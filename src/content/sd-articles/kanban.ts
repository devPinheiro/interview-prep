import type { SystemDesignGuide } from "@/lib/types";

export const kanbanGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A kanban board: columns, cards in an order, drag and drop, and two people moving cards. Keyboard users get the same move.

Rules:

- Order is data, not a side effect of the mouse.
- A drag previews locally and commits with the board version. A rejected move puts the card back and shows the server’s order.
- Filters hide cards. They do not rewrite the stored order.
- A long column virtualizes. A backlog of hundreds of cards must not mount every node.
- Permissions: who may move is checked on the server for the move command, not only by hiding the handle.

Out of scope: swimlanes and WIP limits, unless you have time. WIP is a check on the destination column’s count at commit. It uses the same command.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The board document is columns of card ids plus a version. Card fields live in an entity map so a title edit is not a reorder.

Drag session state is local: the card id, the pointer, and a preview index. On drop, you send a move. You do not treat the preview as committed. On cancel or conflict, you throw the preview away.

Ranks: give each card a string rank so inserting between two neighbors does not renumber the column. Generate a key between the previous and next rank (fractional indexing). When keys grow too long, rebalance that column in a background job. Integer indexes look simpler and force a rewrite of every card under the drop. Say why you refused them.

The keyboard path opens a menu: destination column and position. It calls the same endpoint as drop. There is one command, two input devices.

Filters are a view predicate. Dropping inside a filtered column still chooses real neighbors in the unfiltered order, or you will shuffle hidden cards. If that is too sharp, disallow drop while a filter is on and say so. Either rule is fine. Silence is not.

Realtime: other clients receive the new version or the move. If your local preview is in flight, keep it until your own response. Then reconcile to the server board.`,
      diagram: {
        caption: "Preview is local. The board document changes only when the move command is accepted.",
        mermaid: `flowchart TB
  Columns[Columns of ids]
  Cards[Card entities]
  Preview[Drag preview]
  Move[Move command]
  Columns --> Cards
  Preview --> Move
  Move --> Columns`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Board { id, version, columns: [{ id, title, cardIds: string[] }] }
Card { id, title, rank, columnId }
Move { cardId, toColumnId, rank, version }
\`\`\`

You can store order as \`cardIds\` arrays or as ranks that you sort. Ranks win when two people insert in the same gap, because each generates a key between the same neighbors and the sort is deterministic. Arrays need the version so one writer wins and the other refetches. Use both: ranks for the position you request, version so a stale client does not overwrite a column it did not see.

Preview holds \`{ cardId, toColumnId, index }\` and is not persisted.

Filter state is \`{ query, assignee }\` and is not in the board document.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /boards/{id}
→ { board, cards }

POST /boards/{id}/moves
{ cardId, toColumnId, rank, version }
→ { board } | { conflict, board }
\`\`\`

The response board is what you render after a success or a conflict. Do not patch the array yourself a second time or you will apply the move twice.

A realtime event can be “board version changed, refetch” for a small board, or the move itself for a busy one. Refetch is the honest default when you are unsure about ordering. It costs a read and saves a merge bug.

Keyboard move uses that POST. There is no second “keyboard rank” API.`,
      diagram: {
        caption: "Two clients hold the same version. The first move wins. The second conflict refetches.",
        mermaid: `sequenceDiagram
  participant A
  participant B
  participant API
  A->>API: move version 4
  API-->>A: version 5
  B->>API: move version 4
  API-->>B: conflict and board 5
  B->>B: drop preview`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Fractional ranks

Between ranks “a” and “b” you can insert “a”. Well, you insert a key that sorts between them, such as the midpoint of a string space. You do not use floating point numbers, because they run out of precision and two clients can generate the same midpoint. A string or a list of integers with a careful append avoids that. When the key gets long, rewrite the column’s ranks in one transaction. Mention rebalance or the interviewer will ask what happens after a year of inserts in one gap.

## Filters and hidden cards

If the visible order is a subset, the neighbor above the drop in the UI may not be the neighbor in the data. Compute the rank from the full column, not the filtered list. Otherwise the hidden cards jump. Document this in the empty-state copy if you disable drag during filter instead.

## Virtualization and drag

Virtualize each column on its own scroll. The drag preview is one floating card, positioned over the board, not a live reorder of hundreds of DOM nodes on pointer move. Hit-testing during drag uses the column geometries, and the list underneath updates the preview index only when you cross a row boundary.

## Accessibility

Each card is a button or has a move control with a name that includes the title and column. The menu lists columns. Announcing “Moved to Review” on success is enough. A board that is only sortable by pointer fails even when the rank math is right.`,
    },
  ],
};
