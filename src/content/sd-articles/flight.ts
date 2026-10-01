import type { SystemDesignGuide } from "@/lib/types";

export const flightGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `Search itineraries by origin, destination, and dates, then pick a fare and hold it long enough to enter passengers. Results are large, the request is slow, and the price can move before purchase.

What you commit to:

- Criteria live in the URL. Changing them aborts the in-flight search and replaces results. You never concatenate two cities.
- An itinerary is slices (outbound, return) made of segments (flights with airports and times). A fare is a priced offer on an itinerary, sometimes with brands (basic, flex) that change the rules, not the flights.
- Sort and filters that would hide rows the server did not send belong in the query. Client-side refine is allowed only for a complete result set, and you say when the set is complete.
- Selecting outbound then return is a two-step flow with the chosen outbound pinned. The return query includes that choice when the fare depends on it.
- Revalidate the price before pay. Booking uses an idempotency key. A failed payment does not create two reservations.

Scale: one search can return hundreds of itineraries. Render a window. The slow part is the search API. The page shell is up immediately, and the user can cancel.

Out of scope: airline operations, seat maps in depth, and loyalty credit math. Seat selection can be a step you name after the fare is held.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A criteria form, a results store, and a selection flow.

The form edits origin, destination, dates, passengers, and cabin. Airports are an autocomplete against an airport API, storing the code, not the typed string. Submit writes the URL and starts the search with an \`AbortController\`. If the user edits again, abort, clear, and restart. Show a determinate state only if the server gives you progress. Otherwise show searching and a cancel control.

Results land as a list of itineraries. Virtualize it. Each row shows times, stops, duration, airlines, and the lowest fare. Expanding a row shows segments and the fare brands. Brands are radios: same flights, different price and rules (changes, bags). The rules are text on the offer, not icons alone.

Filters: stops, airlines, times, price. If the server returns a full set for this query, filtering locally is fine and instant, and the counts are honest. If the server paginates relevance, filters are new queries and the list replaces. Do not mix the two. A “showing 50 of many” label is how you stay honest.

Selection: store the chosen itinerary id and fare id, then collect passengers. Before payment, \`POST /revalidate\` returns the current price or a sold-out error. If the price moved, show the delta and require a confirm. Pay submits the revalidated offer id.

## Flexible dates

A separate grid: price by departure date. It is another endpoint and a sparse matrix. Selecting a cell fills the date and runs the normal search. Do not build it by firing thirty searches from the browser.

## Nearby airports

The server can return alternates in the same response, labeled as such, with the city difference in text. Do not silently swap the airport the user picked.`,
      diagram: {
        caption: "Criteria drive one search at a time. A fare is revalidated before money moves.",
        mermaid: `flowchart TB
  Form[Criteria in the URL]
  Search[Search request]
  List[Virtualized itineraries]
  Fare[Selected fare]
  Reval[Revalidate]
  Book[Book]
  Form --> Search
  Search --> List
  List --> Fare
  Fare --> Reval
  Reval --> Book`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Query: \`{ origin, destination, depart, return?, passengers, cabin }\`.

Itinerary: \`{ id, slices: [{ segments: [{ from, to, departAt, arriveAt, carrier, number, duration }] }], duration, stops }\`. Times include a zone offset or an airport-local string plus a zone. Do not format them in the user’s zone in a way that hides the airport-local time. Show both if they differ.

Offer: \`{ id, itineraryId, brand, price, currency, rules, expiresAt }\`.

The results cache is keyed by the query and discarded when criteria change. Do not keep a global normalized mess of every airport search in memory forever. Normalize segments if the same flight appears on many itineraries and it helps, but it is optional at this scale.

Hold or revalidated offer: \`{ offerId, price, expiresAt }\`. Passenger details are a form keyed separately. Payment returns \`{ bookingReference }\` or an error code \`price_changed\` or \`unavailable\`.

The selected outbound id is in the URL or in the flow state when the return list depends on it, so refresh does not forget which way they were going.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /airports?q=
→ { airports: [{ code, city, name }] }

POST /search
{ origin, destination, depart, return, passengers, cabin }
→ { itineraries, offers, complete }

POST /offers/{id}/revalidate
→ { price, expiresAt } or { code: unavailable }

POST /bookings
Idempotency-Key: {key}
{ offerId, passengers }
→ { bookingReference }
\`\`\`

If search is a GET with query params, caching and abort are simpler. A POST is fine when the criteria are fat. Either way, one in flight.

Rows are articles or list items with a heading that includes the route and the price. Expand is a button. Fare brands are radios named with the brand and the price. Rules sit in the labeled group.

Sort is a control that reorders the loaded set or reruns the query, matching the completeness decision. Focus stays on the results heading when a new search lands, so a screen reader hears that results arrived. A live region says “Searching” and then the count.

Loading does not remove the form. Cancel is a button that aborts and leaves the previous results only if they still match the URL. If the URL changed, previous results are gone.

Passenger fields are a labeled form. Errors from revalidate appear before pay, in text, with the new price.`,
      diagram: {
        caption: "A second search aborts the first. Purchase uses the revalidated offer.",
        mermaid: `sequenceDiagram
  participant User
  participant UI
  participant API
  User->>UI: change dates
  UI->>API: abort previous
  UI->>API: search
  API-->>UI: itineraries
  User->>API: revalidate offer
  API-->>User: current price
  User->>API: book with key`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Fare brands

The confusing UI is a matrix of brands across slices. Keep the flights stable and swap the offer. If combinations explode (outbound brand times return brand), the server returns legal combinations, and the client does not cartesian-product them. An illegal combo is disabled with a reason. The price the user sees is always an offer id they can revalidate, never a sum of two half-prices you invented.

## Time zones and duration

Layover math uses the instants, so a red-eye does not show a negative duration. Display the airport local time as the primary time, with the offset or city. “Arrives next day” is a label when the local date changes. Duration is a field from the server so you do not disagree on connection length.

## Performance

Virtualize rows. The row is not a heavy child tree of images. Airline marks are small. Do not hydrate a map. Abort is part of performance: a slow search must not lock the input. Debounce only the airport autocomplete, not the submit of a search the user already confirmed. Prefetch nothing from a results hover that could stampede the revalidate endpoint.

## Honesty when inventory moves

Between render and book, a seat disappears. Revalidate is the design. If you skip it, the book call must return the same errors and the UI must show them without charging. Idempotency covers the double click on pay. It does not freeze a price by itself. The offer’s \`expiresAt\` does, and only until then.`,
    },
  ],
};
