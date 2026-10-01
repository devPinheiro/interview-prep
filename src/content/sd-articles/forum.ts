import type { SystemDesignGuide } from "@/lib/types";

export const forumGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A forum: a list of threads, a thread page with a nested comment tree, votes, and a reply composer that targets a parent. Moderation can remove a comment without destroying the shape of the thread.

What you commit to:

- The thread page has a URL. A link to a comment loads that comment’s ancestors so the page can scroll to it.
- Roots are paged. Children load with the root up to a depth, and deeper threads have an explicit “continue” control. You do not recursively fetch the whole tree in one unbounded document.
- A vote is one per user per comment, idempotent, and reversible. The score shown after a click matches the server once the command returns.
- Removed and deleted comments leave a placeholder so replies underneath still have a parent. Deleted by the author and removed by a moderator are distinguishable.
- The composer inserts the optimistic reply under the right parent and removes it if the POST fails. A refresh shows the server order.

Scale: a large thread is the problem, not the list of forums. Root pagination plus depth caps keep the DOM bounded. Vote writes are the hot path on a popular comment and must not require reloading the thread.

Out of scope: real-time presence of readers and a chat-style live tail. A manual refresh or a “new comments” hint is enough.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A thread store keyed by comment id, plus an ordered list of root ids, each with ordered child ids.

Loading the page fetches the post and the first page of roots with descendants to a depth (for example three). The response is a flat list of comments and a parent map, which you normalize. Rendering walks the tree. Collapsing a node hides its descendants in the view without forgetting them.

“Continue this thread” fetches \`GET /comments/{id}/children\` and attaches them. Pagination of roots uses a cursor and does not reset expansion state for ids you still have.

Vote toggles an intent: up, off. Optimistic score applies to that entity, with the previous score stored for rollback. The response score replaces the optimistic one. A second click before the first returns is fine if the command is “set my vote to this state,” not “increment.”

Reply opens a composer whose \`parentId\` is that comment. Submit sends the parent and an idempotency key. On success, insert the comment id into the parent’s child list in the server’s position (usually last, or by the sort). Sort mode (top, new) is part of the URL. Changing sort refetches. Do not re-sort a partial tree locally and call it “top.”

## The post itself

The original post is the head of the page, not a comment, with its own vote and a reply that creates a root. It is server-rendered so a shared link has content before hydration. Comments can hydrate after, but the first screen of comments should be in the HTML if they are the point of the page.

## Moderation

A removed comment renders “removed” and keeps its children if the policy allows. The client does not filter those children out. A moderator action is a command that returns the comment’s new state. Optimistic removal is optional. A failed remove restores the body.`,
      diagram: {
        caption: "The page normalizes comments by id. Trees are views over parent links. Votes patch one entity.",
        mermaid: `flowchart TB
  Page[Thread page]
  Roots[Root cursors]
  Map[Comments by id]
  Composer[Reply composer]
  API[Thread API]
  Page --> Roots
  Roots --> Map
  Page --> Map
  Composer --> API
  API --> Map
  API --> Roots`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Post: \`{ id, title, body, author, score, createdAt }\`.

Comment: \`{ id, parentId, author, body, score, myVote, state, createdAt, childIds }\`. \`state\` is visible, deleted, or removed. \`myVote\` is -1, 0, or 1 if you allow downvotes. If you only allow upvote, it is 0 or 1.

Page payload: \`{ post, comments: flat[], rootIds, nextCursor }\`. Flat plus roots avoids a deeply nested JSON you cannot page. \`childIds\` can be included already sorted for the current mode, or derived from \`parentId\`. One source of order. Do not keep both if they can diverge.

Vote command: \`{ commentId, value }\`. Response: \`{ score, myVote }\`.

Permalink: \`/t/{postId}?c={commentId}\`. The loader fetches ancestors for that id and the surrounding roots so the target is mounted, then scrolls and focuses it. If it is on a later root page, the API can return the cursor window that contains it.

Draft replies are keyed by \`parentId\` in session storage so a quote you started is not lost when you expand another branch. Bodies are plain text or a restricted markdown subset rendered on the server or with a sanitizer. Store the source.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /threads/{id}?sort=&cursor=&focus=
→ { post, comments, rootIds, nextCursor }

GET /comments/{id}/children?cursor=
→ { comments, childIds, nextCursor }

POST /comments
Idempotency-Key: {key}
{ parentId, body }
→ { comment }

PUT /comments/{id}/vote
{ value }
→ { score, myVote }
\`\`\`

The thread is a document with one h1. Comments are articles or list items nested in a way assistive tech can follow. Indent is visual. The accessible structure is nested lists or headings, not a pile of divs with margins. Each comment has a reply button named with the author. Collapse is a button that states expanded or collapsed.

Vote buttons expose the current state (“Upvoted, score 12”). The score is text. A live region does not announce every score on the page. Announce the one you changed.

The composer is next to the parent, labeled “Reply to Sam.” Submit and cancel are buttons. Cancel returns focus to the reply button. After a successful reply, focus can move to the new comment.

“Continue thread” and “more replies” are buttons or links that do not reload the whole post. Loading state is on that control.

Removed body is not in the HTML payload for a removed comment, so a client bug cannot reveal it. The placeholder is what the API sends.`,
      diagram: {
        caption: "A reply names its parent. A vote sets a value and replaces the score.",
        mermaid: `sequenceDiagram
  participant Reader
  participant UI
  participant API
  Reader->>UI: Reply to comment C
  UI->>API: POST parent C
  API-->>UI: comment id
  UI->>UI: attach under C
  Reader->>API: vote value 1
  API-->>UI: score and myVote`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Deep trees

Indent forever makes a horizontal scroll and a huge DOM. Cap visual depth. Beyond it, “continue this thread” opens the rest as a new rooted view, still with the same permalink behavior. Virtualizing a nested tree is hard because heights depend on expansion. Virtualize root cards if needed, and keep each root’s rendered subtree short via the depth cap. That is the practical answer. Mention it instead of a fictional windowed tree.

## Sort and pagination

“Top” order changes as scores change, so an offset page will duplicate and skip. Use a cursor, and accept that a comment can move after you vote. Do not reshuffle the whole page under the user’s cursor. Apply the new score in place and reshuffle on the next fetch. Say that. “New” is stable and easier.

## Votes under contention

The write is “set my vote,” unique on user and comment. The score update is in the same transaction or the response reads the current score. The client replaces. It does not add the delta to a score a socket also added. If you have no socket, the response is enough. If two tabs vote, both settle on the server’s \`myVote\` and \`score\`.

## Permalink and focus

The target comment might be collapsed or not yet loaded. The loader includes ancestors expanded and the target present, then \`scrollIntoView\` and focuses the comment container, which has \`tabindex="-1"\` so focus is programmatic and visible. If the comment was removed, focus the placeholder and do not error the whole page. A missing comment that was never real is a small message at the top, with the thread still usable.`,
    },
  ],
};
