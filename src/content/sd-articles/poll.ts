import type { SystemDesignGuide } from "@/lib/types";

export const pollGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A host opens a poll. A room of people votes once. Everyone sees totals move. When the host closes it, the totals freeze.

What you commit to:

- One vote per identified voter. The client disables the control after a successful vote, and the server ignores a second vote from that voter. Anonymous mode, if offered, still needs a server-side dedupe (a signed ballot token), not “trust the button.”
- Totals displayed are server aggregates. Clients do not add their local vote on top of a total that already includes it.
- Live updates are aggregate snapshots on a cadence or on change, not a stream of who voted for what.
- Closing the poll is a host command. Late votes are rejected and the UI shows closed.
- Options are defined before open, or you explicitly allow the host to add an option and you reset nothing.

Scale: a poll can have a large audience. The payload that fans out is a few integers, not a ballot per person. The vote write path must be idempotent under double clicks and retries.

Out of scope: a general survey builder and payment. Moderation of option text is a host responsibility you can mention.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Definition, ballot, and tally are separate.

The client loads the poll: question, options, state (draft, open, closed), and the current tally. If this voter already voted, the response includes their choice so the UI renders the result state immediately.

Voting POSTs an option id and an idempotency key. The server records one ballot and returns the new tally plus the voter’s choice. The UI then shows results. An optimistic tally is optional and easy to double-count, so prefer waiting for the POST on a poll. The click can show a pending state on the chosen option. The numbers move when the response arrives, and a following snapshot confirms them.

A channel or SSE pushes \`tally\` \`{ counts, total, version }\` to subscribers. Apply a snapshot only if its version is newer. Do not apply a delta you can lose. A full counts array is small. Send that.

The host client has open and close commands. Closing publishes a final snapshot and a \`closed\` flag. Voters who are mid-POST may get a rejection. Show it.

Joining late: GET the poll and you have the current tally. You do not replay votes.

## Cadence

For a very large room, coalesce tally publishes to a few times a second on the server so you do not emit per vote. The vote still commits each time. The animation can interpolate between snapshots. Say that the last snapshot on close is exact, even if intermediate ones were sampled.

## Identity

If the room already has a user id, use it. If the poll is a public link, issue a ballot token in an HttpOnly cookie or a signed token at page load, one per browser, and accept the abuse that multiple browsers means multiple votes unless you require sign-in. Say that tradeoff instead of pretending a localStorage flag is enforcement.`,
      diagram: {
        caption: "Votes commit on the server. Viewers apply tally snapshots. Closing freezes the last snapshot.",
        mermaid: `flowchart TB
  Voter[Voter UI]
  Host[Host UI]
  Ballot[Ballot store]
  Tally[Aggregate]
  Channel[Tally stream]
  Voter --> Ballot
  Ballot --> Tally
  Tally --> Channel
  Channel --> Voter
  Host --> Tally`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Poll: \`{ id, question, options: [{ id, label }], state, version }\`.

Ballot: \`{ pollId, voterKey, optionId }\` unique on \`(pollId, voterKey)\`.

Tally: \`{ counts: { [optionId]: number }, total, version }\`. \`total\` is the sum the server computed. The client derives percents from that total so a stale count cannot show 120%.

Voter payload on GET: \`{ poll, tally, myOptionId | null }\`.

Idempotency key collapses retries of the same click. A different option after a recorded vote is a 409, not an update, unless the product allows changing votes. If it allows a change, the server moves one count to another in the same transaction and returns the tally. Say whether change is allowed. The simpler design is no changes after the ballot is stored.

Do not put voter keys into the tally stream.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /polls/{id}
→ { poll, tally, myOptionId }

POST /polls/{id}/votes
Idempotency-Key: {key}
{ optionId }
→ { tally, myOptionId } or 409 closed

WS poll:{id}
tally { counts, total, version }
state { state }

POST /polls/{id}/close
→ { tally, state: closed }
\`\`\`

Options are radio buttons or toggle buttons with the label text. Results are a list: label, count, and percent as text, with a bar as decoration. Color is not the result. A live region announces the updated total on a coarse interval or when the poll closes, not on every snapshot if that floods the screen reader. Pending vote sets \`aria-busy\` on the group.

Host controls are not rendered for voters. If a voter calls close, the server returns 403.

Closed polls hide the vote controls and show the final numbers. A draft poll is host-only.`,
      diagram: {
        caption: "The vote response and the stream both carry a full tally. The newer version wins.",
        mermaid: `sequenceDiagram
  participant Voter
  participant API
  participant Room
  Voter->>API: vote option A
  API-->>Voter: tally version 8
  API-->>Room: tally version 8
  Room->>Room: ignore version less than 8`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Double counting

The bug is: optimistic +1, then the snapshot that already includes you, then you leave the +1 in place. Either skip optimism, or replace local counts entirely whenever a snapshot version arrives. The vote response is a snapshot. Apply it the same way. Derive percent from \`total\` in that snapshot only.

## Large rooms

Writes: unique constraint on the voter key, idempotency key for retries. Reads: one aggregate row updated in the same transaction as the ballot, or a compacted counter, not a \`COUNT(*)\` across ballots on every viewer’s refresh. Broadcast the aggregate, coalesce, and let the close command read the exact counter once more before sealing.

## Honesty of the closed state

After close, ignore further tally events that are not marked final, or accept only a higher version that still says closed. A late ballot must not increment a closed poll. The UI that is offline during close reconciles on reconnect with GET and replaces local state. Do not keep the vote buttons enabled just because the socket missed the event.

## Accessibility of results

Bars need text. Updating every 200ms in a live region is hostile. Mark the region polite and announce on vote acknowledgement (“Recorded. 42 of 100 for A.”) and on close. Hosts get the same numbers. Motion on the bar width respects reduced motion by jumping to the new width.`,
    },
  ],
};
