import type { SystemDesignGuide } from "@/lib/types";

export const calendarGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A calendar with month and week views, overlapping events, and a way to create or move an event. Time zones and recurrence are the questions that change the shape. Design week and month for a single viewer first, with recurrence expanded by the server for the visible range.

Requirements:

- The view is a range. You fetch events that intersect that range, not a year of DOM nodes.
- Instants are stored in UTC. Labels use the calendar’s display zone. A meeting created in one zone still means the same instant in another.
- Overlaps in a day are stacked in columns. All-day events sit in their own row and do not consume the timed grid.
- Creating an event starts a draft on the selected slot. It is not an event until save.
- Dragging reschedules by sending a new start and end with the version you rendered. A conflict snaps back.
- Keyboard: move across days, open the selected event, save from the draft. A drag-only calendar is incomplete.

Out of scope until asked: rooms, working hours for a whole company, and finding a time across ten people. Those are searches on top of the same range query.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The header sets the visible range and the mode. The grid is either month cells or a week time grid. Both read the same event cache for that range.

Layout of overlaps is a pure function of the timed events in a day: sweep, group intersecting intervals, assign columns. It is not stored. A timezone switch relayouts because the local hour of an instant changed. The stored instant did not.

The draft is local until save. Save posts start, end, and title. The response is the event or a conflict. Drag uses the same write with the version.

Recurrence, if the interviewer insists: store a rule on the master and ask the server to expand instances for the range. The client should not be the only place that understands “every second Tuesday” or you will disagree with the invite email. Editing “this instance” versus “the series” is an explicit API choice, not a local hack.

Prefetch the next and previous range so week navigation feels instant. The cache key is the range plus the calendar id.`,
      diagram: {
        caption: "The range query fills the cache. Layout is derived. Saves go back as versioned writes.",
        mermaid: `flowchart TB
  Header[Range header]
  Grid[Week or month grid]
  Layout[Overlap layout]
  Cache[Events in range]
  API[Calendar API]
  Header --> Grid
  Cache --> Layout
  Layout --> Grid
  API --> Cache
  Grid --> API`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Event {
  id, calendarId,
  start, end,          // UTC instants
  timeZone,            // zone the organizer picked, for the label
  title, allDay,
  version,
  recurrenceId?        // instance of a series, if expanded
}
\`\`\`

All-day events are dates, not instants, or you will shift them across midnight when the viewer changes zone. Keep all-day as a date range without a time.

View state: \`{ mode, anchorDate, displayZone }\`. The range is derived. It is also the cache key.

A recurrence master, if present, is not painted directly when the server sends instances. Instances carry the master id so “edit series” knows where to write.

Drag preview is not an event. It is an overlay with a proposed start and end. On success it is replaced by the server event. On conflict the overlay is removed and the cached event remains.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /events?start&end&zone
→ { events }

POST /events
{ start, end, title, timeZone, allDay }
→ { event }

PATCH /events/{id}
{ start, end, version }
→ { event } | { conflict, event }
\`\`\`

The GET expands recurrence inside \`[start, end]\` so a week view does not download the rule and hope. Include the display zone so all-day boundaries and labels match what you will paint.

PATCH with the wrong version returns the current event and does not apply the drag. The client snaps the preview back and can show “Updated elsewhere”.

Creating from a drag-select on the grid fills the draft with those instants and still requires an explicit save, so a mis-drag does not invite the company.`,
      diagram: {
        caption: "A drag proposes a time. The server accepts it only if the version matches.",
        mermaid: `sequenceDiagram
  participant Grid
  participant API
  Grid->>Grid: preview new start and end
  Grid->>API: PATCH version 3
  alt ok
    API-->>Grid: event version 4
  else conflict
    API-->>Grid: current event
    Grid->>Grid: snap preview back
  end`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Overlaps

Sort the day’s timed events by start. Walk a sweep. While intervals intersect, they share a group. Column count is the size of the widest overlap in the group, not a global forever. Width is one column. An event that starts when another ends does not overlap, if you treat the end as exclusive. All-day items never enter this sweep.

## Time zones

Store UTC. Display with the calendar zone, and show the event’s own zone when it differs, or 09:00 is a lie for a traveler. Changing the display zone does not PATCH events. It only relabels and relayouts. All-day items stay on their dates. DST is why you use a real zone database in the formatter and not a fixed offset.

## Recurrence edits

“This event” writes an instance exception. “This and following” splits the series. “All” edits the master. If the client tries to do that by rewriting every expanded instance it has loaded, it will miss instances outside the range. The server owns the rule. The client sends the scope and the master id.

## Accessibility

The grid has a label and the focused day is announced with its date and the count of events. Arrow keys move the focus across days or slots. Enter opens. Drag is additional. A time grid that only works with a pointer fails the interview even if the overlap math is beautiful.`,
    },
  ],
};
