import type { SystemDesignGuide } from "@/lib/types";

export const hotelGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `Search stays by place and dates, compare rooms and rates, and book one before someone else takes the last room. The dates are hotel-local nights, not timestamps that shift when the traveler changes time zones.

What you commit to:

- The search is in the URL: destination, check-in, check-out, guests. Back and forward restore it. Results are server-ranked. Filters and sort are part of the query if they change which ids come back.
- A rate is a price for a room type under a cancellation policy, for these dates. The client displays it. It does not add fees that were not in the quote.
- Selecting a room creates a short hold with an expiry. Checkout pays against that hold. When the hold expires, the price and availability are re-quoted. Booking is idempotent.
- The calendar makes invalid nights unselectable (check-out after check-in, min stay if the rate requires it) and is keyboard usable.
- Photos and maps do not block the room list. The list shows name, price, and policy as text.

Scale: search results are a page, not every hotel in a city. Availability changes quickly. Search responses can be cached briefly. Holds and bookings are not cached.

Out of scope: the property management system and loyalty accounting internals. A member rate is a rate you request with the signed-in context, not a percent you subtract in the browser.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Search, property, hold, book.

Search returns hotel summaries for the criteria: name, area, a from-price, a hero image, and an id. The from-price is the cheapest rate the server found for these dates, labeled as such. Virtualize the list if the page is long, but a paged list of cards with real links is the right default. The map, if present, plots the same page of results and stays in sync with hover or selection. It is not a second search unless you explicitly search by bounds.

The property page lists room types and rate plans for the same dates, which are still in the URL. Changing dates reruns availability. Each rate has a book action.

Book starts a hold: the server reserves inventory optimistically for a few minutes and returns \`holdId\`, the frozen price breakdown, and \`expiresAt\`. The checkout page shows a countdown based on \`expiresAt\` from the server, not a client timer that started at an optimistic guess. If the hold expires, stop payment and send the user back to re-select.

Payment submits the hold id and an idempotency key. Success returns a confirmation code. Failure releases nothing the client has to invent: the server either keeps the hold until expiry or returns a new state. A double submit returns the same confirmation.

## Date logic

Check-in and check-out are date strings (\`YYYY-MM-DD\`) in the property’s calendar. “3 nights” is a date difference, not 72 hours. DST does not add a night. The calendar component selects dates, and the accessible name includes the full date.

## Sold out and price changes

If a rate disappears between the list and the property page, say so and show what remains. If the price changed before the hold, the hold response is the price that matters, and the UI shows it before pay. Do not pay the list price from memory.`,
      diagram: {
        caption: "Search finds properties. A hold freezes a rate. Booking commits that hold once.",
        mermaid: `flowchart TB
  Search[Search results]
  Property[Rooms and rates]
  Hold[Hold]
  Pay[Payment]
  Confirm[Confirmation]
  Search --> Property
  Property --> Hold
  Hold --> Pay
  Pay --> Confirm`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Query: \`{ destination, checkIn, checkOut, adults, children, filters }\`.

Summary: \`{ hotelId, name, area, fromPrice, currency, image, lat, lng }\`.

Room offer: \`{ roomTypeId, name, rates: [{ rateId, price, nightly, currency, cancellation, meals }] }\`.

Hold: \`{ id, rateId, priceBreakdown, expiresAt, status }\`. Breakdown lists room, taxes, and fees as lines the server computed.

Booking: \`{ id, confirmationCode, holdId, status }\`.

The countdown is \`expiresAt - serverNow\`, and you can send \`serverNow\` or rely on a short TTL and refetch the hold if the tab was backgrounded. A backgrounded tab’s \`setInterval\` is not an authority.

Guest details on checkout are a form. They are not part of the search cache.

Do not store card numbers beyond the payment field the processor’s frame owns. If the card field is an iframe from the processor, say that. The rest of the form is yours.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /search?destination=&checkIn=&checkOut=&adults=&cursor=
→ { hotels, nextCursor }

GET /hotels/{id}/offers?checkIn=&checkOut=&adults=
→ { rooms }

POST /holds
{ rateId, checkIn, checkOut, guests }
→ { holdId, priceBreakdown, expiresAt }

POST /bookings
Idempotency-Key: {key}
{ holdId, guest }
→ { confirmationCode } or { error, hold }
\`\`\`

The calendar is a dialog or an inline grid with next and previous month buttons, a heading for the month, and days as buttons. Disabled days are not selectable. The selected range is described in text near the field, not only as a painted stripe.

Room cards show the cancellation policy as text before the hold. The pay button names the total. After expiry, the pay button is replaced by a message and a link to refresh offers.

Errors from booking (hold expired, payment declined) are specific. A declined payment keeps the hold if it is still valid so the guest can retry without losing the room. Say that if the server supports it. If it does not, you start a new hold.

Sort and filter controls reflect in the URL. A map pin list is the same hotel ids.`,
      diagram: {
        caption: "The hold freezes the price. Booking retries return the same confirmation.",
        mermaid: `sequenceDiagram
  participant Guest
  participant API
  Guest->>API: create hold
  API-->>Guest: price and expiry
  Guest->>API: book with key
  API-->>Guest: confirmation
  Guest->>API: retry book with same key
  API-->>Guest: same confirmation`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Inventory races

Two guests can see one room. The hold is the lock. If hold creation fails, the rate is gone and the list refreshes. Do not decrement a count in the client to simulate this. The expiry must be visible so a guest does not fill a long form and discover the room left ten minutes ago. Refetch the hold when the tab becomes visible if more than a short time passed.

## Time zones

A hotel in Lisbon and a shopper in New York still mean the night of 12 March. Send dates, not instants. Format them in the UI as dates without applying the shopper’s zone in a way that shifts the day. The property’s zone matters for arrival language (“after 15:00 local”). Put “local” in the copy.

## Search latency

Hotel search fans out to suppliers in real products and can be slow. Show the shell and stream results if you have them, or a single response with a clear loading state and a cancel via \`AbortController\` when the criteria change. Do not append a new search’s hotels onto the previous list. Replace, or you will show Rome in a Paris search.

## Accessibility and trust

Price, dates, and cancellation are text. The hold timer is text that updates without being the only indication. Photo carousels do not auto-advance. The payment iframe has a title. Errors on guest fields focus the first invalid field. The confirmation page is a document with the code, the dates, and the total, and it is reachable again by confirmation id for this user.`,
    },
  ],
};
