import type { SystemDesignGuide } from "@/lib/types";

export const blogGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A public reading site and a small publishing flow: home and tag indexes, an article page, and comments. Authors publish posts. Readers get a fast article, a stable URL, and a way to read on a bad network after the HTML arrives.

What you commit to:

- The article HTML is server-rendered. The LCP is the title and the hero, not a client fetch of the markdown.
- Indexes are paginated and cacheable. The article body is cacheable by URL. Personalized bits (me, my comment draft) are not in that cache key.
- Comments are a separate resource, paged, and they do not block the article. A comment is sanitized text or a structured subset, not a second HTML document.
- Drafts are unpublished. Preview is authorized. The public cache never stores a draft.
- Tags and the feed (RSS or a JSON feed) are generated from published posts.

Scale: the long tail is reads. Writes are rare. A popular post’s HTML and images sit on a CDN. Comments can be chatty on one post and empty on the rest.

Out of scope: a full CMS schema system, paywalls, and real-time collaborative editing of the post. One authoring box with publish is enough.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Read path: a request for \`/posts/{slug}\` resolves the published post and returns HTML with the body already rendered from markdown or structured blocks on the server. Assets are CDN URLs with dimensions so the hero reserves space. Cache the response, and purge that URL on publish or update.

Index path: \`/tags/{tag}?cursor=\` returns a page of summaries. Summaries exclude the body. The next page is a link, not only an infinite scroll, so the URL is shareable and the cache is obvious.

Write path: an authenticated editor saves a draft and publishes. Publish sets \`publishedAt\`, updates tag indexes, pings the feed, and purges the slug. Unpublish purges too.

Comments: the article page includes a container and the first page can be in the HTML or fetched after load. Pick one. If comments are slow or third-party, do not put them on the critical path. Posting a comment is an authorized or anti-abuse-protected command and appends to the list optimistically only after basic validation, with rollback on failure.

## Personalization

The cached HTML is anonymous. “You’re subscribed” and the profile menu load in a small client request or a cookie-dependent fragment that is not cached on the shared CDN. Do not vary the entire article cache on cookie, or you will stop caching.

## Related posts

A second query, below the fold or in the HTML after the body. It must not delay TTFB of the article. If you do not have a ranking service, recent posts with the same tag is a fine answer.`,
      diagram: {
        caption: "Published HTML and images are cached. Drafts and comments are off that cache key.",
        mermaid: `flowchart TB
  Reader[Reader]
  CDN[Cached article HTML]
  Origin[Publish origin]
  Drafts[Draft store]
  Comments[Comment API]
  Img[Image CDN]
  Reader --> CDN
  CDN --> Origin
  Origin --> Drafts
  Reader --> Comments
  Reader --> Img`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Post: \`{ id, slug, title, excerpt, body, hero, tags, status, publishedAt, updatedAt }\`. \`status\` is draft or published. Body is markdown or a block list you render to HTML on the server at publish time, and you can store the rendered HTML so reads do not reparse.

Hero: \`{ assetId, alt, width, height }\`.

Comment: \`{ id, postId, authorName, body, createdAt, status }\`. \`status\` allows held-for-review. The public list returns only visible comments. Cursor pagination by id or time.

Feed item uses title, slug, publishedAt, excerpt. It updates when a post is published.

Slug uniqueness is enforced at publish. A slug change leaves a redirect from the old path so shared links survive.

Reader progress, if you want it, is local and optional. It is not part of the post document.

Cache keys: the HTML URL, the tag page URL including cursor, and the feed URL. A query string for the share button does not create a new cache entry if you canonicalize.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /posts/{slug}
→ HTML, cacheable

GET /tags/{tag}?cursor=
→ HTML or { posts, nextCursor }

GET /feed.xml
→ published items

GET /posts/{slug}/comments?cursor=
→ { comments, nextCursor }

POST /posts/{slug}/comments
{ body }
→ { comment } or 429

PUT /admin/posts/{id}
{ draft }

POST /admin/posts/{id}/publish
→ { slug, purge }
\`\`\`

Comment bodies render as text or as a markdown subset with a sanitizer on the server. The client does not insert the raw string with \`innerHTML\`.

The article is a document: one h1, a byline, and the body heading structure preserved from the source. Code blocks can highlight on the server or progressively. Images in the body have alt and dimensions.

Index pages are lists of links. Pagination is a link with a real href. The comment form is labeled, and errors are tied to the field. A held comment tells the writer it is pending instead of pretending it is live.`,
      diagram: {
        caption: "Publish writes the post and purges the public URL. Readers then get the new cached HTML.",
        mermaid: `sequenceDiagram
  participant Author
  participant API
  participant CDN
  participant Reader
  Author->>API: publish slug
  API->>CDN: purge /posts/slug
  Reader->>CDN: GET /posts/slug
  CDN->>API: miss
  API-->>Reader: HTML`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Rendering the body

Server-render the article so it is readable without JS and so the CDN stores useful HTML. Hydrate only the comment form, the menu, and maybe code-copy buttons. A client-only markdown SPA fails the performance bar and the “open the link” bar when JS stalls. Syntax highlighting, if heavy, runs at publish time and the HTML already has the markup.

## Comment abuse

Rate-limit by account and by IP on the server. Do not rely on a hidden client field. New accounts can be held for review. Render text, escape HTML, and reject URLs if the product wants that. A reply thread, if you add it, is one level or a flat list with a parent id, and you still page it. Do not block the article cache on comment freshness. Comments can be a short client cache or always dynamic.

## Tags and the feed

Tag pages and the feed are derived data. Publish and unpublish update them in the same operation as the post visibility change, or you accept a short lag and say so. A feed that still lists an unpublished post is the bug. Canonical URL on the article matches the slug the feed advertises.

## Cache and drafts

Preview uses a no-store header and an auth check. If the public slug of an unpublished post 404s, good. If it 200s from a stale CDN entry after unpublish, your purge failed. Name purge on publish, update, and unpublish. Also send a cache header that is finite so a missed purge heals.`,
    },
  ],
};
