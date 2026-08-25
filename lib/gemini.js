// lib/gemini.js
//
// Same shape as lib/paystack.js: one small function, server-side only,
// hides the specific API details from the rest of the app.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent";

export async function askGemini(prompt) {
  // AbortController lets us set a hard deadline on the request. Without
  // this, if Gemini's servers are slow to respond (not just erroring, but
  // genuinely hanging), fetch() will happily wait as long as it takes —
  // which we've now seen can be a full minute or more during an outage.
  // 8 seconds is generous for a simple text response; if it hasn't come
  // back by then, something's wrong and we should give up and let the
  // fallback keyword search take over instead.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Gemini API timed out after 8 seconds");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
