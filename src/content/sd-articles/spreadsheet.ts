import type { SystemDesignGuide } from "@/lib/types";

export const spreadsheetGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A spreadsheet that opens a large grid, edits one cell, and evaluates formulas without mounting every cell.

Commitments:

- The grid is windowed. Cells outside the viewport plus a small overscan are data, not DOM. Start with fixed row height so the window math is a division, not a measurement of every row.
- A cell stores raw input (a literal or a formula string) and a computed value separately. The formula bar shows the raw text. The grid shows the value or an error.
- An edit dirties the dependency subgraph, not the whole sheet. Cycles become a cell error and stop. They do not lock the UI.
- One editor is active. Commit on Enter or blur.
- Frozen headers share the column offset of the body window.
- Collaboration, if in scope, shares commits, not keystrokes. Other people see a value when you commit. Live cursors inside a formula are a later mode.

Out of scope: charts, pivot tables, and variable row heights. Name them as the next step so the interviewer knows you saw them.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Three pieces.

The sheet store is a sparse map of written coordinates to cells. Empty space is the absence of a key. A million empty cells cost nothing.

The viewport translates scroll offset into the first visible row and column using the fixed sizes, renders that rectangle plus overscan, and reuses DOM nodes as you scroll. Frozen headers are a second window locked to the same column offset and a row offset of zero.

The evaluator parses a formula when it is committed, records edges from this cell to the cells it references, and evaluates dirty cells in dependency order. A cycle writes an error on the involved cells and leaves the rest of the sheet responsive. Editing does not recompute on scroll. Scroll only changes which nodes display the values already in the store.

For a shared sheet, the commit goes to the server, which can be the evaluator and return the dirty values. The client still windows the grid. Do not send the viewport to the server.

The formula bar and the in-cell editor are the same edit buffer. Only one coordinate is in edit mode.`,
      diagram: {
        caption: "Scroll changes the window. Commit changes the store and the dirty set. Those are different directions.",
        mermaid: `flowchart TB
  Viewport[Grid window]
  Store[Sparse cells]
  Eval[Dependency evaluator]
  Editor[Single editor]
  Viewport --> Store
  Editor --> Store
  Store --> Eval
  Eval --> Store`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Cell {
  coord: { row, col },
  raw: string,
  value: string | number | null,
  error?: string
}

Edges: coord → coord[]   // this cell depends on these
Dirty: Set<coord>
\`\`\`

Sparse means you persist and transfer only cells that have a raw value. The viewport size is view state: \`{ scrollTop, scrollLeft, rowHeight, colWidth }\`. Derived: first row, first column, row count, column count.

A formula \`=A1+B1\` stores that string as raw and a number as value. References are parsed into coordinates. Ranges expand to edges, with a cap. An enormous range is an error or a server-side computation, not a million edges in the browser without a plan.

Versions, if shared: each commit has \`{ coord, raw, baseVersion }\`. The server returns \`{ value, error, dirty, version }\`. A conflict means someone else committed that coord. Refetch those cells. Do not merge formula strings by hand.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `Local first, shared if they ask:

\`\`\`
PUT /sheets/{id}/cells/{coord}
{ raw, version }
→ { value, error, dirty: coord[], version }
\`\`\`

\`dirty\` tells the client which coordinates to replace from the response body. Include their new values in the same payload so you do not N+1 the sheet.

\`\`\`
GET /sheets/{id}/window?r0&c0&rows&cols
→ { cells }
\`\`\`

Optional. For a sheet that does not fit in memory, fetch by window. For an interview-sized sheet, load the sparse set once and window only the DOM. Say which. The interesting limit is DOM and recompute, not the existence of an address bar.

Keyboard: arrows move the selection when you are not editing. Enter starts or commits an edit. The formula bar is a labeled text field. Headers are headers, not extra selectable cells that land in the tab order a thousand times. The windowed DOM still exposes the selected cell’s value to assistive tech even when neighbors are recycled.`,
      diagram: {
        caption: "A commit returns the edited cell and the other cells that became dirty.",
        mermaid: `sequenceDiagram
  participant Editor
  participant API
  participant Grid
  Editor->>API: PUT A1 formula
  API-->>Editor: A1 value and dirty B1
  Editor->>Grid: update those coords only
  Note over Grid: scroll does not recompute`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## The window

\`firstRow = floor(scrollTop / rowHeight)\`. Render \`visibleRows + overscan\`. Position each row with a translate. Recycle the node objects if you want, but correctness is “the right coords are mounted”. When the user jumps to a distant row, replace the window in one go. Do not render every row in between. Frozen headers subscribe to \`scrollLeft\` only.

Variable row heights break the division. If they ask, the next design is an offset prefix array you rebuild when a row is measured, and you binary-search the scroll offset. That is why you started fixed.

## Formulas and cycles

Build edges on commit. Inverse edges tell you who is dirty when A1 changes: everyone reachable through dependents. Evaluate in topological order. If the graph has a back edge in the dirty set, mark those cells with a cycle error and skip the infinite walk. Cap the number of cells you will recompute in one commit so a accidental full-column reference cannot freeze the tab. Show a partial error if you hit the cap.

## Collaboration boundary

Commit-level sync means the value others see is stable and the formula string is not half typed across the network. Cursors can show which cell someone selected, as presence, without streaming the editor buffer. If two commits hit one coord, the version check rejects the second. Last-write-wins without a version will lose a formula and you should refuse that.

## Accessibility and the recycled DOM

Recycled nodes must update their headers’ association and the selected cell’s name when they are reused for a new coordinate. A node that still announces the previous cell’s address is a serious bug. Keep one live selection and a formula bar that is a normal input. Do not rely on a canvas grid with no text alternative.`,
    },
  ],
};
