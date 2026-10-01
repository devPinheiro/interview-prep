import type { SystemDesignGuide } from "@/lib/types";

export const foodDeliveryGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `After checkout, one screen follows an order until it is delivered or cancelled. The customer sees the phase, an ETA, and a map of the courier only while a courier is assigned and moving.

What you commit to:

- The order document is the source of truth. The map renders it. A missing tile does not mean the order is lost.
- Phases move forward on server events: placed, confirmed, preparing, ready, picked up, en route, arriving, delivered. Cancelled and refunded are terminal side paths. The client does not invent a phase because a location sample moved.
- Courier location is a stream of samples with a timestamp, heading, and accuracy. Draw a position that is interpolated and discard samples that are stale or jump impossibly far.
- ETA and the route polyline come from the server. The phone does not run its own routing engine.
- If the socket dies, the phase is still correct after a refetch, and push covers the transitions that matter while the app is backgrounded.

Scale: one active order for this screen, a handful of historical ones elsewhere. Location updates can be several a second. Map tiles are the heavy bytes, cached by the map SDK.

Out of scope: merchant menus, checkout, and the courier’s own app. Support chat is a link, not this design.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Three collaborators.

The order store holds the latest order snapshot and a short log of phase changes for the timeline. Mutations are not optimistic here. Confirming a delivery or cancelling is a command that waits for the server, because a fake “delivered” is worse than a spinner.

The location store holds the last accepted sample and the render position. A small loop interpolates between the last two good samples using their timestamps, and clamps to the route if you have one. Samples older than a threshold (say 30 seconds) mark the courier as “location delayed” without moving the phase backward.

The map is a view. It takes a center, a polyline, a courier marker, and pins for the store and the drop-off. It is lazy-loaded. The textual status, ETA, and timeline render first so a slow map SDK does not block the answer to “where is my food?”

Realtime: a channel keyed by order id emits \`order.updated\` and \`courier.sample\`. On subscribe, always GET the order so you converge even if you missed an event. When the tab is hidden, drop to the push channel and a coarse poll. Do not keep a high-rate location stream alive in the background.

## Phase against location

“En route” with no fresh sample still says en route. “Preparing” never shows a courier marker, even if a stale sample is in memory. Clear location state on phase transitions that do not include a courier.

## Cancellation and replacement

A cancel command is idempotent. If the restaurant voids an item, the snapshot updates the line list and the ETA. The map stays. Do not route the user back through checkout unless the server says the order is dead and unrecovered.`,
      diagram: {
        caption: "Status text is served by the order snapshot. The map is a consumer of phase, route, and filtered samples.",
        mermaid: `flowchart TB
  Screen[Tracking screen]
  Order[Order store]
  Loc[Location store]
  Map[Map view]
  HTTP[Order GET and commands]
  RT[Order channel]
  Push[Push for background]
  Screen --> Order
  Screen --> Loc
  Screen --> Map
  HTTP --> Order
  RT --> Order
  RT --> Loc
  Push --> Order
  Order --> Map
  Loc --> Map`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Order, as the client stores it:

- \`{ id, phase, eta, store, dropoff, courier, lines, timeline, updatedAt }\`.
- \`store\` and \`dropoff\` are \`{ label, lat, lng }\`.
- \`courier\` is \`{ id, name, vehicle }\` or null.
- \`timeline\` is \`{ phase, at }[]\` for the steps you show as done, current, and upcoming.
- \`route\` is \`{ encodedPolyline, updatedAt }\` and can be null until pickup.

Sample: \`{ orderId, lat, lng, heading, accuracyM, sentAt }\`. The renderable point is derived, not stored as truth.

Privacy: the samples exist only while the phase is one that exposes the courier. After delivered, drop them. Do not write the trail to localStorage. The customer sees the courier for this order, not a history of where that person went yesterday.

Identifiers: the order id in the URL is unguessable or the GET is authorized. A shared “track this link” is a capability, and you say who can open it.

Time: display ETA as a range or a clock time the server computed. Do not subtract client clocks from \`sentAt\` except to measure staleness, and use the server timestamp for that if you have clock skew.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /orders/{id}
→ { phase, eta, store, dropoff, courier, lines, timeline, route }

POST /orders/{id}/cancel
Idempotency-Key: {key}
→ { order }

order.updated { order }
courier.sample { lat, lng, heading, accuracyM, sentAt }
\`\`\`

The route encoding is the server’s. The client decodes it for the map SDK and does not “correct” it.

Polling fallback: \`GET /orders/{id}\` every few seconds while the socket is down and the phase is active, and stop when the phase is terminal. Location can be a separate \`GET /orders/{id}/courier\` if you do not want to resend the menu lines.

The status region is text, not color alone. The timeline is a list with the current step marked by text. The map is complementary and has a text alternative that names the phase and ETA. If the user prefers reduced motion, marker movement steps instead of animating every frame.

Cancel is a button with a confirm step that names the consequence. It stays disabled while the command is in flight.`,
      diagram: {
        caption: "Subscribe only after a snapshot, so a missed event is recovered by the GET.",
        mermaid: `sequenceDiagram
  participant UI
  participant API
  participant Channel
  UI->>API: GET order
  API-->>UI: snapshot
  UI->>Channel: subscribe order id
  Channel-->>UI: courier.sample
  UI->>UI: accept or drop sample
  Channel--xUI: disconnect
  UI->>API: GET order again`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Bad GPS

A sample with poor accuracy, or a jump that implies a vehicle moved faster than a ceiling you state, is dropped. Keep drawing toward the last good point. If several samples fail in a row, freeze the marker and say location is delayed. Never snap the phase to “delivered” because the point entered a geofence. Geofence delivery is a server decision.

## Map cost and first paint

Tiles dominate. Server-render or statically render the status block, and load the map SDK after. Give the map a fixed height so the layout does not jump. A static map image is a fair fallback if WebGL fails or the user is on a constrained network. The order is still understandable without pan and zoom.

## Background and battery

High-rate samples while the screen is off help nobody. Unsubscribe or coarsen when \`visibilityState\` is hidden, and rely on a push for phase changes. On return, GET the snapshot before you animate the marker across the city from an old point. Jump once, then interpolate new samples.

## Two tabs and a second order

The channel is per order id. Opening another order replaces the subscription. A push for a different order deep-links to that id rather than mutating the one on screen. Delivered is terminal: the page can show a receipt, and the location layer is gone.`,
    },
  ],
};
