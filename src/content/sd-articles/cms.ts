import type { SystemDesignGuide } from "@/lib/types";

export const cmsGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `Editors create structured content, preview it, and publish a version that the public site can render. A draft is not what readers see. Two editors can be in the same entry, and you do not silently lose a body to a stale tab.

What you commit to:

- The model is a schema (content type) plus entries. The editor generates a form from the schema. It is not a single rich-text blob for every product, article, and banner.
- Publish freezes a version. Later draft edits do not change the live version until the next publish. Schedule and unpublish are versions with times, or you say they are out of scope.
- Preview renders the draft through the same components as production, against draft data, on a URL that is not indexed and not cached as public.
- Media is an asset library: upload, focal point, alt text. The entry stores an asset id.
- Localization, if in scope, is a locale dimension on the entry, not a copy-paste of the whole CMS.

Scale: thousands of entries, documents that are not huge, assets on a CDN. The editor is an authenticated app. The read path for the public site is a cached published API.

Out of scope: the public site’s layout system and a full digital asset rights workflow. Page building can be “sections of known types,” not arbitrary CSS.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Schema, entry editor, preview, published API.

The schema lists fields: text, rich text, number, reference, asset, list of blocks. The form renderer maps type to control and validator. Unknown types from a newer schema render as read-only so an old admin build does not destroy them.

The entry store holds a draft and zero or more published versions. Saving the form writes the draft and a version number. Autosave debounces and sends that version. A 409 means another tab or person saved. Show their updated time and offer reload or overwrite. Overwrite is explicit.

References are ids (author, related entries), resolved in the editor for display and on the published API for readers. Do not expand the whole graph into the draft document or you will save a stale copy of the author name forever.

Preview opens the site renderer with a draft token. The renderer calls the draft API, not the CDN cache. The token expires. Production pages call the published API only.

## Publish

Publish takes the current draft version and writes an immutable published document, invalidates the cache key for that entry, and returns the public URL. If validation fails (missing required, missing alt), publish does not happen. Draft save can still allow incomplete work. Say that split.

## Blocks

A page entry is an ordered list of blocks \`{ type, props }\`. Editors reorder blocks. The public renderer has a component per type. A type the renderer does not know is skipped or shows a placeholder in preview only. Do not \`eval\` schema.

## Media

Upload goes to a signed URL. The asset record holds alt, dimensions, and a CDN URL. The form shows a reserved box from the dimensions. Replacing an asset is a new id or a new version so published content does not change pixels underneath unless the editor updates the reference.`,
      diagram: {
        caption: "Draft and published are different reads. Preview uses the draft token. The public CDN sees published versions only.",
        mermaid: `flowchart TB
  Form[Schema-driven form]
  Draft[Draft entry]
  Pub[Published version]
  Preview[Preview renderer]
  CDN[Public content API]
  Assets[Asset CDN]
  Form --> Draft
  Draft --> Pub
  Preview --> Draft
  CDN --> Pub
  Form --> Assets
  CDN --> Assets`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Content type: \`{ id, name, fields: [{ key, type, required, localized }] }\`.

Entry: \`{ id, typeId, locale, draft, draftVersion, publishedVersion, updatedAt, updatedBy }\`.

Draft body matches the schema. Rich text is a structured document you sanitize, not unsanitized HTML. References are \`{ type, id }\`.

Published: \`{ entryId, version, body, publishedAt, publishedBy }\`. Readers request the latest published, or a specific version for previewing history.

Asset: \`{ id, url, width, height, alt, mime }\`. Alt is required to publish an entry that uses the asset in a meaningful image, and decorative images can be marked empty on purpose.

Conflict token is \`draftVersion\`. Autosave includes it. The editor also keeps a local dirty flag so a failed network save retries the same body.

Slug is a field with uniqueness checked on publish. The public path comes from the slug. Changing a slug writes a redirect you mention, or you forbid slug changes after first publish. Pick one.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /content-types/{id}
→ { fields }

GET /entries/{id}
→ { draft, draftVersion, published }

PUT /entries/{id}
{ draft, draftVersion }
→ { draftVersion } or 409 { draft, draftVersion }

POST /entries/{id}/publish
{ draftVersion }
→ { publishedVersion, url }

GET /preview/{id}?token=
→ rendered page

GET /content/{slug}
→ published body, cacheable
\`\`\`

The published GET is cacheable and contains no draft fields. The draft GET is authorized.

The form labels every field. Errors sit on the field and in a summary. Rich text toolbar buttons have names. Asset chooser is a dialog with search, and the chosen asset shows its alt, which you can edit.

Publish is a button that lists blocking errors before the request when you already know them, and still trusts the server list. After publish, the status line says which version is live.

Locale switcher does not discard a dirty draft without a confirm.`,
      diagram: {
        caption: "Save advances the draft version. Publish freezes that version for the public API.",
        mermaid: `sequenceDiagram
  participant Editor
  participant API
  participant CDN
  Editor->>API: PUT draft version N
  API-->>Editor: version N plus 1
  Editor->>API: publish N plus 1
  API->>CDN: store version and invalidate
  CDN-->>Editor: public URL`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Schema changes

Adding an optional field is safe. Renaming a key is a migration that rewrites drafts and published documents, or a new key with a fallback read. Do not do it only in the client. Removing a field hides it in the form and leaves the stored value until a migration strips it, so old renderers do not break mid-deploy. The editor and the site renderer version together, or the renderer ignores unknown keys.

## Preview honesty

If preview uses a different component than production, editors will ship surprises. Same renderer, draft data, noindex, and a token. Cache must vary on the token or skip the cache. A CDN that caches the preview URL without the token is a data leak. Say that.

## Rich text and XSS

The public site renders structured nodes (paragraph, link, embed) or sanitized HTML. Editors are not a trusted boundary for script tags. Links can be validated. Embeds are a block type with an allow-list of providers, not an iframe the editor pastes in raw.

## Two editors

Show presence if you can: who has the entry open. The hard part is still the version check on save. Operational transform on every field is usually not worth it for a CMS entry. 409 plus a diff of the body is an acceptable staff answer if you describe the diff. Autosave without a version is how you lose a paragraph.`,
    },
  ],
};
