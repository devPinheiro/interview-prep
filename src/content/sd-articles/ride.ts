import type { SystemDesignGuide } from "@/lib/types";

export const rideGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A rider’s map for a trip: choose a pickup, see a car, and watch the trip through matching, waiting, and drop-off. The map is a view of a trip, not the source of truth.

Phases: choosing a pickup, matching, waiting for the car, on trip, completed, canceled. Actions on screen follow the phase. A moving marker does not invent a phase.

Location samples are timestamped and can be late or out of order. If a sample is older than a freshness budget you state (a few seconds for on-trip, longer while matching), fade the car and say the location is delayed. Do not keep animating a car after samples stop, or it will drive through the destination after the trip ended.

The socket can die. Show reconnecting, keep the last phase marked stale, and refetch the trip on reconnect. Do not resume a location stream for a finished trip.

Pickup is a pin the rider confirms. GPS only seeds it.

Driver app, pricing, and matching algorithm are out of scope. You consume a trip document and a location stream.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The trip store holds the phase, pickup, dropoff, and assigned car. The map reads that and draws pins, a route polyline if you have one, and one car marker. A sheet below or over the map explains the phase and the actions (cancel, confirm pickup).

A location channel delivers samples. The client keeps the latest sample per car by \`observedAt\`. Interpolation between the last two fresh samples is a visual. It stops when the newest sample is stale or the phase is no longer one that shows a live car.

The snapshot GET is used for first paint and for reconnect. The socket is a patch stream: phase changes and locations. If you miss patches, the GET repairs you. Design the UI so it can render from the GET alone. A socket-only client is a blank map whenever the network blips.

Route lines can come from the snapshot as an encoded path. Recalculating a route on the client from raw GPS is unnecessary if the server already matched the driver to roads.

Confirming pickup writes the pin and only then requests a car. That request is the transition out of the choosing phase.`,
      diagram: {
        caption: "The trip document decides the phase. Location samples only move the marker, and only while they are fresh.",
        mermaid: `flowchart TB
  Sheet[Phase sheet]
  Map[Map]
  Trip[Trip store]
  HTTP[Trip snapshot]
  Socket[Location and phase events]
  Sheet --> Trip
  Map --> Trip
  HTTP --> Trip
  Socket --> Trip`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Trip {
  id,
  phase,
  pickup: { lat, lng, label },
  dropoff: { lat, lng, label },
  car?: { id, label },
  location?: { lat, lng, heading, observedAt }
}

Sample { tripId, lat, lng, heading, observedAt }
\`\`\`

\`observedAt\` is server time when the fix was taken, not when the socket delivered it. Out-of-order delivery is ignored when \`observedAt\` is older than the sample you already applied.

Stale is \`now - observedAt > budget\`. The budget is a product number. Say 5 seconds while on trip. Do not use a magic boolean from the server unless the server is the one hiding the car, in which case the phase or a \`locationStatus\` field is clearer.

Pickup draft: \`{ lat, lng, label }\` local until confirm. It is not the trip yet.

Do not store a long trail of samples in the UI. Two points are enough to interpolate. A breadcrumb history is a different feature.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
POST /trips
{ pickup, dropoff }
→ { trip }

GET /trips/{id}
→ { trip }

WS trip.phase { tripId, phase }
WS car.moved { tripId, lat, lng, heading, observedAt }
\`\`\`

Reconnect:

\`\`\`
GET /trips/{id}
\`\`\`

then resubscribe. If \`phase\` is completed or canceled, do not subscribe for motion.

Pickup confirm is the POST that creates the trip, or a PATCH if you created a draft server-side. Either way the pin is explicit. A GPS update after confirm does not move the pickup unless the rider edits it. Drivers are dispatched to the pin, not to a phone that is still walking.`,
      diagram: {
        caption: "After a dropped socket, the client refetches the trip before it trusts another location event.",
        mermaid: `sequenceDiagram
  participant UI
  participant API
  participant Socket
  Socket--xUI: disconnect
  UI->>UI: mark phase stale
  UI->>API: GET trip
  API-->>UI: phase and location
  UI->>Socket: subscribe if still active`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Interpolation without lying

Between two fresh samples, move the marker along the segment over the sample interval, or over a short fixed time if you want it to feel smooth. Cap it. If the next sample is far away (a tunnel, a bug), snap instead of animating across the city. If no sample arrives, stop. A constant velocity extrapolation will cross the dropoff after arrival. Stop extrapolation when the phase is waiting or completed.

## Stale and out of order

Ignore a sample with an older \`observedAt\`. Fade the marker when the newest accepted sample is past the budget, and change the sheet copy to “Location delayed”. Do not leave a bright car on a corner from ten minutes ago. When the phase event says completed, remove the marker even if one last sample is in flight. The phase wins.

## Reconnect

On disconnect, banner immediately. Do not freeze the last animation frame as if it were live. GET on reconnect applies phase and location together so you never show “matching” with a car that is already on trip. If the GET fails, stay on the stale snapshot and retry. Inventing a phase from the last coordinate is the bug.

## The pin

Reverse-geocode the confirmed pin into a label the rider can read, and let them drag the pin before request. GPS error of a block is normal in cities. The confirm step is the product, not a formality. Cancel is available in matching and waiting, and it is a command on the trip, after which the GET would show canceled and the map drops the car.`,
    },
  ],
};
