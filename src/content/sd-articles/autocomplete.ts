import type { SystemDesignGuide } from "@/lib/types";

export const autocompleteGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `Design a search typeahead: suggestions appear as the person types, they can choose one with a keyboard or pointer, and a slow or failed network never blocks typing.

Functional behavior worth pinning down before the architecture:

- Suggestions after a short pause, not on every key, and empty query shows recent searches or nothing, stated explicitly.
- Keyboard: Arrow keys move the highlight, Enter selects, Escape closes the list and leaves the typed text.
- Pointer: hover highlights, click selects. The selected suggestion fills the input or navigates, and that choice is product-specific.
- IME composition (Chinese, Japanese, Korean) must not search until the composition ends.
- Loading, empty, and error are distinct. The input stays editable in all three.

Non-functional targets that change the design:

- Perceived time to first suggestion under about 200ms for a cache hit, and the network call itself debounced to 150–300ms.
- One result set visible at a time. A slower response for an older query must not overwrite a newer one.
- The list stays usable at eight to twenty items without virtualization. Past roughly one hundred, window it.
- Screen readers hear the combobox and a polite announcement of result count, not a re-read of every row on each highlight.

Out of scope unless the interviewer pulls it in: spell correction, personalization models, and the search results page after commit. Ranking stays on the server.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Split the widget into an input, a list, a fetch controller, and a small memory cache. The page shell owns the route that runs after a suggestion is committed. The widget does not.

The input is a controlled text field with \`role="combobox"\`. The visible value and the debounced query are different pieces of state. Debounce only the network. The list updates from cache immediately when the current query has been seen before.

The fetch controller owns an AbortController and a generation counter. Starting a request aborts the previous one. A response is applied only when its query equals the latest debounced query. That is the race you will be asked to describe.

The suggestion list is a \`listbox\` of \`option\` elements. \`aria-activedescendant\` points at the highlighted option so focus can stay in the input, which is what people expect while typing. Virtualize only after you have measured a long list. A windowed list that also has to move \`aria-activedescendant\` is a cost you do not pay for ten rows.

Errors render next to the list as a retry. They never disable the field.

## Where ranking lives

Ranking, typo tolerance, and business boosts belong in the suggest API. The client caches the payload for a normalized query. Doing rank on the client means the typeahead drifts from the search page.`,
      diagram: {
        caption: "Keystrokes hit the cache first. Only the debounced query goes to the network, and late responses are dropped.",
        mermaid: `flowchart LR
  Input[Combobox input]
  Debounce[Debounced query]
  Cache[Memory LRU]
  API[Suggest API]
  List[Listbox]
  Input --> Debounce
  Debounce --> Cache
  Debounce --> API
  Cache --> List
  API --> List`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Client state stays small.

- \`query\`: what is in the field right now.
- \`activeQuery\`: the debounced string last sent, or about to be sent.
- \`activeIndex\`: highlighted option. Reset to -1 whenever the result set identity changes.
- \`status\`: idle, loading, ready, empty, or error.
- Cache: \`Map\` of normalized query to \`{ suggestions, storedAt }\`. Normalize by trim and lowercase for Latin search. Do not lowercase queries where case is meaningful, and document that.

A suggestion is \`{ id, label, type }\`. \`id\` is what you select. \`label\` is what you paint and match to the typed prefix visually. \`type\` can drive an icon. Do not put HTML in \`label\`. Highlight the matched substring on the client from the query, so the API stays text.

Cache policy: LRU of about 50 entries, session memory only. Do not persist queries that might contain secrets or other people’s names to localStorage without a product decision. If freshness matters, treat a hit as stale-while-revalidate: paint the cached list, then replace it when the response arrives for that same query.

There is no client ranking index. If the API is down, the last cache for that query can show with a stale hint. Anything else is an error row.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `The suggest call is a GET that can be cached by query.

\`\`\`
GET /suggest?q={normalized}&limit=8
→ { suggestions: [{ id, label, type }] }
\`\`\`

Limit the payload. Eight items is enough to choose. The client aborts with AbortController when the debounced query changes. The server should be cheap enough that aborted work does not dominate, but you still cancel on the client so the UI stays honest.

The combobox contract, aligned with the ARIA combobox pattern:

- Input: \`role="combobox"\`, \`aria-expanded\`, \`aria-controls\` pointing at the listbox, \`aria-autocomplete="list"\`, \`aria-activedescendant\` when a row is highlighted.
- List: \`role="listbox"\`. Options: \`role="option"\` and \`aria-selected\` for the active one.
- ArrowDown and ArrowUp move the index inside the open list. They do not move document focus.
- Enter selects the active option, or submits the raw query if nothing is highlighted. State which one.
- Escape closes the list and does not clear the field.
- A polite live region announces “8 suggestions” when the count changes, not on every arrow press.

Composition events: ignore \`input\` that happens during \`compositionstart\` until \`compositionend\`.

Selection calls \`onSelect(suggestion)\` and the parent decides whether to fill, navigate, or both.`,
      diagram: {
        caption: "The request for “re” is aborted when the query becomes “rea”. Only the second response may paint.",
        mermaid: `sequenceDiagram
  participant User
  participant Input
  participant Cache
  participant API
  User->>Input: types re
  Input->>API: GET suggest q=re
  User->>Input: types a
  Input->>API: abort re
  Input->>API: GET suggest q=rea
  API-->>Input: suggestions for rea
  Input->>Cache: store rea
  Input->>User: paint list`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Out-of-order responses

Aborting is not always enough. A response can still arrive after you have moved on if the abort raced the network, or if a proxy ignored it. Apply a response only when \`response.query === activeQuery\`. Otherwise drop it. While the new request is in flight, keep showing the cached list for the current query instead of blanking the panel. Blanking on every key feels slower than it is.

## Cache and prefixes

Prefix search is a different product from caching exact queries. An LRU of exact strings is simple and correct. Do not synthesize suggestions for “rea” by filtering the “re” cache unless the API told you the list was a complete prefix expansion. That optimization is wrong the moment ranking is not a pure prefix.

## Accessibility and focus

Focus stays in the input so the caret remains visible. The list is not a second tab stop. If you move focus into the listbox, you will fight screen readers and mobile keyboards. Disabled users of a visible keyboard need the same arrows, Enter, and Escape as everyone else. A custom highlight that removes the focus ring fails the task.

Touch: the list is tall enough to tap, and selecting does not require hover. A virtual keyboard should not cover the list without scrolling it into view. That is a layout bug, not a new component.

## Failure

A network error shows “Could not load suggestions” and a retry button beside the list. The typed query is untouched. Offline uses the cache or the error, and never a spinner that blocks the field. Empty results are a sentence, “No matches”, not an exception. Logging: time to first suggestion, abort rate, error rate, and click-through by index. Those four tell you whether the widget is fast, chatty, broken, or useless.`,
    },
  ],
};
