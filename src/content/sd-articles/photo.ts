import type { SystemDesignGuide } from "@/lib/types";

export const photoGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A photo sharing app: a grid or feed of images, an upload from the camera roll, and a detail view. People follow accounts, like photos, and expect the first screen to show pictures, not empty boxes.

Commitments:

- Images are responsive, reserved, and served from a CDN. The API returns metadata and URLs, not bytes.
- Uploads are resumable or at least retryable, and a failed photo does not vanish from the composer.
- The feed paginates by cursor and virtualizes once the session is long.
- The detail view can deep-link. The back stack returns to the same scroll offset in the grid.
- Private photos are authorized on every URL. A guessed CDN path must not work for someone else’s image.

Out of scope until asked: filters and editing, stories, and a full social graph. Following is a filter on the feed query, not a second app.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The feed page renders a grid of cards from a cursor query. Each card is a fixed aspect tile so virtualization and CSS grid stay simple. Use cover-crop on the CDN rendition rather than letting the browser download a 4000px original.

Upload is a separate flow: pick file, create an upload session, send bytes (direct to storage with a signed URL), then commit a photo record with that storage key. The feed does not update from the local file alone. It updates when the commit returns, optionally with an optimistic tile that uses a local object URL and then swaps to the CDN URL.

The detail route reads one photo id. Prefetch it on hover or on press for the tiles in view, not for the whole cursor page.

Likes use the same optimistic pattern as a news feed: entity update, idempotency key, rollback.

Authorization: the image URL is signed and short-lived, or the CDN checks a cookie scoped to the photo. Do not ship public buckets for private accounts.`,
      diagram: {
        caption: "The feed stores ids. Pixels come from the CDN. Upload commits a record only after storage accepts the bytes.",
        mermaid: `flowchart LR
  Grid[Photo grid]
  API[Photo API]
  CDN[Image CDN]
  Uploader[Upload session]
  Store[Object storage]
  Grid --> API
  Grid --> CDN
  Uploader --> Store
  Uploader --> API`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Photo {
  id, authorId, caption, createdAt,
  width, height,
  renditions: { w: number, url: string }[],
  visibility: "public" | "followers" | "private"
}
\`\`\`

The grid query holds ordered ids and a cursor. The entity cache holds photos and authors. A local upload has \`{ localId, file, progress, remoteId? }\` until commit, then it becomes the real photo id.

Do not persist other people’s private rendition URLs beyond the session. Signed URLs expire. Refresh them from the API when an image 403s, once, then show a failure tile.

Likes and follow state live on the viewer’s relationship to the photo or author, not baked into a URL that a cache might share.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /feed?cursor=
→ { photos, authors, nextCursor }

POST /uploads
→ { uploadUrl, storageKey }

PUT uploadUrl
body: bytes

POST /photos
{ storageKey, caption, width, height }
→ { photo }

GET /photos/{id}
→ { photo, author }
\`\`\`

The upload URL is single-purpose and expires. The commit is idempotent on \`storageKey\` so a retry does not create two photos.

Image element: \`srcset\` from \`renditions\`, \`sizes\` from the grid column, width and height attributes set. Lazy-load tiles below the fold. The detail image can be higher priority.

Signed GET on the CDN includes the expiry. The client treats 403 as “refresh metadata”, not “the photo was deleted”, until the API says the photo is gone.`,
      diagram: {
        caption: "Bytes go to storage. The photo exists in the feed only after commit.",
        mermaid: `sequenceDiagram
  participant User
  participant App
  participant API
  participant Store
  User->>App: choose file
  App->>API: create upload
  API-->>App: signed URL
  App->>Store: PUT bytes
  App->>API: commit photo
  API-->>App: photo id
  App->>User: tile in the grid`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Layout and memory

A masonry layout that needs every image’s height before paint will hitch. A uniform tile is the right default. If the product wants a justified gallery, give the server the target row height and let it return rows, rather than measuring every image in the browser.

Virtualize by row once you have more than a couple of screens. Keep the scroll offset keyed by route so detail and back does not reset to the top. That offset is view state, not server state.

## Privacy

Visibility is checked when the URL is minted, not only when the JSON loads. A public CDN cache for a followers-only photo is a leak. Vary the cache on the auth context, or use unguessable signed URLs with a short TTL. Log access denials. Do not put the raw storage key in the client as a long-term identifier the CDN will honor forever.

## Upload failure

Show progress from the PUT. If the network dies, retry the same session if the storage API allows resume, otherwise retry the PUT and keep the same storage key. Only the commit creates a visible photo. A local preview that was never committed should say “not posted”.`,
    },
  ],
};
