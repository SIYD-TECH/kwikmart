// app/api/checkout/route.js
//
// This is a Route Handler — Next.js's version of a backend API endpoint.
// The checkout page calls this via fetch('/api/checkout', ...) instead of
// talking to Supabase or Paystack directly. Both those things need secret
// keys (service_role, Paystack secret key) that must never be visible in
// browser code — so this trusted server-side step is where that happens.

import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, items } = body;

    if (!firstName || !phone || !items?.length) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // SECURITY: never trust prices sent from the browser — a request can
    // be edited by anyone before it reaches this server. Instead, look up
    // each item's REAL current price from the database ourselves, and use
    // that for the total. This is the only price that counts.
    const productIds = items.map((item) => item.id);
    const { data: realProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity")
      .in("id", productIds);

    if (productsError) throw productsError;

    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const cartItem of items) {
      const realProduct = realProducts.find((p) => p.id === cartItem.id);
      if (!realProduct) {
        return Response.json(
          { error: `Product ${cartItem.id} no longer exists` },
          { status: 400 },
        );
      }
      if (cartItem.quantity > realProduct.stock_quantity) {
        return Response.json(
          {
            error: `${realProduct.name} only has ${realProduct.stock_quantity} left in stock`,
          },
          { status: 400 },
        );
      }

      const lineTotal = realProduct.price * cartItem.quantity;
      totalAmount += lineTotal;

      orderItemsToInsert.push({
        product_id: realProduct.id,
        product_name_at_purchase: realProduct.name,
        price_at_purchase: realProduct.price,
        quantity: cartItem.quantity,
      });
    }

    // Single pickup location for this demo — just grab whichever row exists.
    const { data: location } = await supabase
      .from("pickup_locations")
      .select("id")
      .limit(1)
      .single();

    // Create the order. order_number and current_status ('pending') are
    // filled in automatically by the schema's defaults/triggers.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        pickup_location_id: location.id,
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_phone: phone,
        customer_email: email || null,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: order.id,
    }));
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);
    if (itemsError) throw itemsError;

    // Paystack requires an email — fall back to a placeholder built from
    // the phone number if the customer didn't give one (email was optional
    // on our form, but Paystack's API won't accept the request without it).
    const paystackEmail =
      email || `${phone.replace(/\D/g, "")}@kwikmart-guest.com`;

    const origin =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
    const transaction = await initializeTransaction({
      email: paystackEmail,
      amountInKobo: Math.round(totalAmount * 100), // Paystack works in kobo, not naira
      reference: order.order_number, // reuse our human-readable order number as the Paystack reference too
      callbackUrl: `${origin}/order-confirmation`,
    });

    return Response.json({
      authorizationUrl: transaction.authorization_url,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: "Something went wrong starting checkout" },
      { status: 500 },
    );
  }
}
