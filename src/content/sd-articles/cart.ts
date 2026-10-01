import type { SystemDesignGuide } from "@/lib/types";

export const cartGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A shopping cart that can be edited and then handed to checkout without double-charging and without inventing a price.

Rules:

- The server prices every line, tax, and discount. The client displays the document it was given.
- Quantity edits are optimistic per line and roll back when inventory or a version check disagrees.
- A line that is no longer available stays visible and blocks checkout, with the reason on that line.
- Checkout uses an idempotency key. Two clicks produce one order.
- Guest and signed-in carts have an explicit merge rule at sign-in. Blindly summing quantities can oversell.
- Prices can change while the tab is open. Revalidate before checkout and show the difference.

Payment capture itself can be a hosted field or a redirect. The cart’s job is to create one order from one priced version of the cart. Do not design a card vault unless they ask.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The cart page is a view of a server document plus a few in-flight mutations. It is not a local reducer that computes totals.

Each line has its own pending flag so one slow update does not lock the others, and so a late response for an old quantity cannot apply after a newer one. Include the cart version on the write. A conflict response carries the fresh cart. You replace local state with that document and discard the optimistic overlay.

The summary reads totals from the same document as the lines. If you ever compute the summary locally, you will show a number checkout will not honor.

The checkout button starts an order command with a key created for that attempt. Disable the button as a hint, and still send the key, because disable does not survive a double submit from two tabs. On timeout, retry the same key. On version conflict, do not place the order. Show the new cart and let the shopper confirm.

Sign-in merge calls a dedicated endpoint that returns the account cart. The UI explains what happened if a line was dropped for stock.`,
      diagram: {
        caption: "Edits return a priced cart. Checkout is a separate command guarded by an idempotency key.",
        mermaid: `flowchart LR
  Lines[Cart lines]
  Summary[Summary]
  Mutations[Line mutations]
  Checkout[Checkout command]
  API[Cart and order API]
  Lines --> API
  Summary --> API
  Mutations --> API
  Checkout --> API`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Cart {
  id, version, currency,
  lines: [{
    lineId, sku, title, quantity,
    unitPrice, available, message?
  }],
  totals: { subtotal, discount, tax, total }
}

PendingLine { lineId, quantity, previous }
CheckoutAttempt { idempotencyKey, cartVersion, status }
\`\`\`

\`version\` changes whenever the priced document changes. It is how a stale tab is detected.

\`available: false\` keeps the line on screen. Checkout refuses while any line is unavailable or any pending mutation has not settled.

The idempotency key is stored with the attempt until you have an order id or a definitive rejection. A new gesture to pay, after the shopper has seen a new total, gets a new key. A retry of the same gesture does not.

Guest cart id lives in a cookie. Account cart id lives on the user. Merge does not concatenate versions. It produces one new version.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /cart
→ { cart }

PATCH /cart/lines/{lineId}
{ quantity, cartVersion }
→ { cart } | { conflict: true, cart }

POST /orders
Idempotency-Key
{ cartVersion }
→ { orderId } | { conflict: true, cart }

POST /cart/merge
→ { cart, dropped: lineId[] }
\`\`\`

PATCH returns the whole cart so the summary cannot drift. The client does not send a price. If it does, the server ignores it.

Order creation checks the version, reprices, and charges once per key. A repeat POST with the same key returns the same \`orderId\`. A different version returns conflict and does not charge.

Say the currency on the document. Formatting is local. Arithmetic is not.`,
      diagram: {
        caption: "A version mismatch refreshes the cart and does not place a second order. A retry of the same key returns the original order.",
        mermaid: `sequenceDiagram
  participant Shopper
  participant Cart
  participant API
  Shopper->>Cart: pay
  Cart->>API: POST order key K version 4
  API-->>Cart: timeout
  Cart->>API: POST order key K version 4
  API-->>Cart: same orderId`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Price changes

On focus and immediately before enabling pay, GET the cart. If a unit price moved, highlight the line with the old and new amount and require the shopper to see it. Do not start payment while a revalidate is in flight. A cached total on screen during capture is how chargebacks start.

## Inventory conflicts

The optimistic quantity paints, then the PATCH fails with the real available quantity. Roll back to the server line and explain the cap. Do not leave the higher number until checkout, where it will fail worse.

## Two tabs and double submit

Both tabs share the cart version. The first successful mutation bumps it. The second gets a conflict and refetches. Payment uses the key, not the disabled attribute. Two devices with two keys are two intentional checkouts only if both versions were still valid. Usually the second version check fails because the first order consumed the stock. Return that error in words.

## Guest merge

Prefer keeping both lines only when each SKU still has stock for the summed quantity. Otherwise keep the account line and list what was dropped. Do this before you show a confident total. A merge that oversells is a support ticket you designed.`,
    },
  ],
};
