
// This layout only wraps pages inside the (storefront) group — the root
// layout.js still provides the Navbar/Footer/CartProvider for everything,
// including admin. This one adds ONE more thing, scoped only to
// customer-facing pages: the floating "Ask KwikMart" bubble. An admin
// managing inventory doesn't need a widget asking about stock they're the

import FloatingChatWidget from "./_components/FloatingChatWidget";

// one updating.
export default function StorefrontLayout({ children }) {
  return (
    <>
      {children}
      <FloatingChatWidget />
    </>
  );
}
