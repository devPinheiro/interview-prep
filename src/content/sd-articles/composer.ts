import type { SystemDesignGuide } from "@/lib/types";

export const composerGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A short-post composer: text with a limit, photos or a short video, mentions, a link preview, and a draft that survives a refresh. Posting is safe to retry. The feed it lands in can be the existing feed design.

What you commit to:

- The limit counts grapheme clusters (what people call characters), not UTF-16 code units, so an emoji does not randomly cost two.
- Mentions are entities (a user id and a range), not only an @ string that breaks when a name changes.
- Media uploads with progress and can be removed before post. Alt text is a field. If the product requires alt, the post stays disabled until it is filled or explicitly decorative.
- The draft saves locally at once and to the server on a debounce. Discard asks if the draft is dirty.
- Submit sends a client post id. A retry returns the same post. The button does not fire a second create.

Scale: the composer is one document. The audience is the feed. Link unfurls are a small server fetch. You do not crawl the URL in the browser.

Out of scope: a long-form editor and a full media studio. Threads and replies reuse this composer with a parent id.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A draft model, an upload queue, and a submit command.

The text control is a textarea if the formatting is plain, which it should be for this product. Mentions and link detection can work on plain text with ranges. A contenteditable is extra risk for a 280-character box. If you need inline mention chips, a structured editor is justified, and the stored form is still text plus entities, not HTML.

On input, measure the grapheme length and highlight overflow. Detect \`@\` and open an autocomplete against a user search, keyboard accessible, inserting a mention entity on choose. Detect a URL and ask the server for a card. Debounce that. Replace the card if the URL changes. The server fetches the page so the client is not an open proxy and so tokens are not sent to the target site from the user’s browser in a way you do not intend.

Uploads start when the file is chosen, not when the user posts, so posting is then attaching finished asset ids. Show progress. A failure leaves the draft in place and marks that attachment failed. Video has a size and duration cap checked before upload.

Submit builds \`{ clientPostId, text, mentions, assetIds, card }\` from the draft. Optimistic feed insert is allowed with a pending flag, replaced when the response arrives, removed if it fails. The draft clears only on success. Rate limit errors keep the draft and show the message.

## Reply and quote

A reply carries \`parentId\` and renders the parent above, read-only. The draft key includes the parent so a reply draft does not overwrite a fresh post draft.

## Discard and navigation

A route change with a dirty draft confirms, or the draft is already saved and the next open restores it. Be explicit which one you promise. Restoring from the server draft is the better default for a logged-in user. Local storage covers the offline case and the moment before the first autosave returns.`,
      diagram: {
        caption: "The draft collects text, mention entities, and uploaded asset ids. Submit is one idempotent command.",
        mermaid: `flowchart TB
  Box[Composer]
  Draft[Draft]
  Mention[User search]
  Unfurl[Card service]
  Upload[Upload queue]
  Post[Create post]
  Feed[Feed cache]
  Box --> Draft
  Mention --> Draft
  Unfurl --> Draft
  Upload --> Draft
  Draft --> Post
  Post --> Feed`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Draft: \`{ clientPostId, parentId | null, text, mentions: [{ userId, start, end }], assetIds, altTexts, card, updatedAt }\`. \`clientPostId\` is minted when the draft is created and reused until success.

Mention ranges refer to the plain text. Editing the text rewrites ranges or re-parses. If that is fragile, store mentions as tokens in a structured document. Either is fine if a mid-string edit does not attribute the wrong person.

Asset: \`{ id, mime, width, height, alt, status }\`.

Card: \`{ url, title, image, domain }\` from the server. Render the domain so the user sees where the link goes.

Post response: \`{ id, clientPostId }\`. The feed entity uses the server id. The optimistic entity uses \`clientPostId\` until then.

Character count: \`Intl.Segmenter\` where available, with a defined fallback. The server enforces the same limit and returns an error if you disagree. The server count is the authority.

Do not put the draft in a shared cache. Key local storage by user id. Clear it on logout.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /users/search?q=
→ { users }

POST /unfurl
{ url }
→ { title, image, domain }

POST /media
→ { uploadUrl, assetId }

POST /posts
Idempotency-Key: {clientPostId}
{ text, mentions, assetIds, parentId }
→ { post } or 429 or 400 { code }
\`\`\`

The composer has a label (“Post text”). The remaining count is text, and it is announced at thresholds (every 20, then every 1 near the limit), not on every key. The mention list is a combobox with an active descendant. Inserting a mention does not leave a raw query string that will be posted as text.

The attachment control is a button. Alt text is an input associated with the preview. Remove attachment is a button.

Post is disabled when the count is over the limit, when an upload is in progress, or when required alt is missing, and the disabled reason is visible. Enter-to-submit is optional and off by default if it surprises people. A modifier submit is safer.

Errors from the server (duplicate, rate limit, rejected media) appear above the box and focus moves there.`,
      diagram: {
        caption: "Retries use the same client post id. The feed replaces the pending item with the server post.",
        mermaid: `sequenceDiagram
  participant User
  participant Composer
  participant API
  participant Feed
  User->>Composer: Post
  Composer->>Feed: pending clientPostId
  Composer->>API: POST with same id
  API-->>Composer: post
  Composer->>Feed: replace pending
  Composer->>API: retry with same id
  API-->>Composer: same post`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Counting characters

UTF-16 length makes emoji and some flags count as two, and ZWJ sequences count as many. Segmenter grapheme length matches what people select with the keyboard. Newline policy is a product rule (counts or not). The server must share the rule. Show the count before the user hits the wall, and reject on the server so an old client cannot bypass it.

## Mentions

Search is debounced and aborted when the query changes. The stored entity is the user id. Display uses the current handle at render time. A deleted user renders as a plain name or “deleted.” Do not let the mention menu cover the caret without a way to dismiss it with Escape, and do not trap the textarea.

## Link cards and media

Unfurl is server-side, cached, and timed out. If it fails, post the URL as text and skip the card. Do not block submit on a slow unfurl. Images: reserve the aspect ratio in the draft preview, compress or reject on type and size before upload, and send alt. A missing alt when the product requires it is a validation error, not a warning you scroll past. Paste from the clipboard can start the same upload path.

## Draft races

Two tabs autosaving one draft: last write wins if they share a server draft id and you show “updated elsewhere” when the version does not match, the same pattern as any document. The \`clientPostId\` should be per draft instance so two tabs do not collapse two different posts into one idempotency key. Mint the id per composer session, and let the server draft id be the sync key for text. Say that split so retries do not merge distinct posts.`,
    },
  ],
};
