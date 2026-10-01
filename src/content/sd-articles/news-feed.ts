import type { SystemDesignGuide } from "@/lib/types";

export const newsFeedGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A feed of posts: text, images, and the occasional video. People scroll, like, and sometimes open a post. New posts arrive while they read.

What you commit to:

- First screen is real content, not a skeleton that waits on the client bundle for the posts themselves. Server-render the first page.
- Further pages load by cursor. Infinite scroll is allowed, and a “Load more” control exists so keyboard and switch users are not stuck waiting for an intersection observer.
- Likes are optimistic and can roll back. The count never double-applies.
- If the reader is not at the top, new posts do not yank the scroll position. A “New posts” affordance does.
- Images reserve their aspect ratio. Video does not autoplay five cards at once.

Scale assumptions you should say out loud: a session can be hundreds of posts, media is on a CDN, and the feed query is personalized so it is not a public cache key shared across users.

Out of scope for the first pass: comments threads, ads auctions, and the ranking model. Ranking returns an ordered cursor of post ids. The client does not rerank.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Four layers.

The view is a virtualized list of post cards. Each card reads a post id and subscribes to that entity, so a like does not rerender the whole feed. Media is a child that knows its aspect ratio and uses \`srcset\`.

The store is a normalized cache: posts and users by id, plus a feed query whose value is an ordered list of cursors and the ids on each page. Pages are not one giant array you keep prepending into without knowing where it came from.

Data access is the feed GET, the like mutation, and a realtime channel. HTTP is authoritative for pages and mutations. The socket patches entities or tells the client to refresh the head of the feed. When the socket drops, the UI says so and the next focus refetches the latest cursor.

Rendering: the first page comes from the server so LCP is a post, not a spinner. Later pages are client fetches. The list virtualizer only mounts rows near the viewport. Variable-height posts are the hard part of virtualization. Estimate height from the media ratio, then correct when the row measures, and restore the scroll anchor so the correction does not jump.

## Likes

The like button fires a mutation with an idempotency key. Apply the optimistic count and liked flag on the post entity. On failure, restore the snapshot. If a realtime patch arrives, replace the count with the server value instead of adding the optimistic delta again.`,
      diagram: {
        caption: "The feed query holds ordered ids. Cards read entities. HTTP owns pages and likes. The socket only patches.",
        mermaid: `flowchart TB
  Page[Feed page]
  List[Virtualized list]
  Card[Post card]
  Query[Feed query of cursors and ids]
  Posts[Post entities]
  Users[User entities]
  HTTP[Feed and like HTTP]
  Socket[Realtime channel]
  Page --> List --> Card
  Card --> Posts
  Card --> Users
  Query --> List
  HTTP --> Query
  HTTP --> Posts
  Socket --> Posts`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Server entities, as the client stores them:

- User: \`{ id, name, avatar }\`.
- Post: \`{ id, authorId, text, media, likeCount, likedByMe, createdAt }\`.
- Media: \`{ id, kind, aspectRatio, srcSet }\`. aspectRatio is width and height, or a number, so the card can reserve space before bytes arrive.
- Feed page: \`{ posts, users, nextCursor }\`. The client splits this into the entity maps and an id list. The cursor is opaque.

The feed query key includes the viewer, because the ranking is personal. Do not cache it on a URL that a shared proxy could reuse across accounts.

Optimistic like adds a mutation record \`{ postId, key, previous }\`. Rollback uses \`previous\`. The idempotency key is stable across retries of the same click.

Realtime events are not a second feed. \`post.patched\` updates an entity. \`post.created\` is a hint to prepend only when \`scrollTop\` is near zero. Otherwise increment a counter for the new-posts pill.

Session length: drop pages far above the viewport if memory matters, and keep the cursor trail so “load older” still works. Say that bound. An unbounded session on a phone will eventually hurt.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /feed?cursor={cursor}&limit=10
→ { posts, users, nextCursor }

POST /posts/{id}/like
Idempotency-Key: {clientMutationId}
→ { likeCount, likedByMe }

post.created { post }
post.patched { id, likeCount, likedByMe }
\`\`\`

The cursor must stay stable when newer posts are inserted at the head. Offset pagination will skip or duplicate when the ranking moves, so do not offer it.

Like is idempotent. A double tap or a retry returns the same resulting count for that key. The client disables the button only as a courtesy.

Images come from a CDN URL with width parameters, referenced from \`srcset\`. The feed response does not inline pixels.

Accessibility of the list: the load-more control is a button. New posts are announced as a count, not by injecting content above the reader. Like state is a toggle button with a name that includes the new state after it changes, in a polite live region if the count text is not already in the button name.`,
      diagram: {
        caption: "A like paints immediately, then reconciles. A failed call restores the snapshot.",
        mermaid: `sequenceDiagram
  participant Reader
  participant Card
  participant Store
  participant API
  Reader->>Card: Like
  Card->>Store: optimistic count
  Card->>API: POST like with key
  alt success
    API-->>Store: server count
  else failure
    Store-->>Card: restore snapshot
  end`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Scroll position and new posts

Virtualization plus prepends is where feeds embarrass people. If the user is at the top, insert the new ids and let the list stay pinned to the head. If they have scrolled, do not change the visible row. Store the id of the first visible post and restore it after any update that would shift layout. The new-posts control scrolls to top on purpose.

## Images, video, and Core Web Vitals

Reserve the ratio box before the image request. Use responsive sources. Lazy-load below the fold, and give the first viewport image priority if it is the LCP. Do not let every video with sound start. INP dies if the like handler setState on the page. It should update one entity. Measure feed LCP separately from page-two latency.

## Realtime failure

On disconnect, mark the feed stale and stop pretending likes from other people are live. Refetch the head cursor on reconnect and on visibility regain. Merge by id. If the refetch overlaps an optimistic like still in flight, the mutation result wins until it settles, then the server snapshot wins. Write that order down so two tabs do not oscillate.

## Accessibility of an infinite list

An infinite region with no landmark and no load-more control is a keyboard trap in practice. Give the feed a label, keep the load-more button, and do not autofocus new cards. Reduced motion: no layout animation when rows are inserted.`,
    },
  ],
};
