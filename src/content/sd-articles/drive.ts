import type { SystemDesignGuide } from "@/lib/types";

export const driveGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A file browser: folders, a list or grid, upload, rename, move, share, and preview. Search finds files the folder listing might not have loaded.

What you commit to:

- A folder is a query of children by parent id, cursor-paged, with the folder id in the URL.
- Upload is resumable, shows per-file progress, and does not block browsing. A failed file retries without restarting the ones that finished.
- Rename, move, and delete are commands against the current version or etag. A name clash is an error the user resolves, not a silent suffix unless you state that product rule.
- Sharing is an ACL change: role and an optional link with an expiry. The UI shows the current roles from the server.
- Preview depends on mime type and streams or lazy-loads the viewer. A folder of thousands of files does not mount thousands of rows.

Scale: folders can be large, files can be large, the tree of favorites is small. Bytes live in object storage. This app holds metadata and a transfer queue.

Out of scope: real-time co-editing of the file body. Sharing a link to a doc editor is a handoff. Offline pin can be named as a later cache of specific file ids.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A metadata store and a transfer queue.

The store caches folders by id: child ids, next cursor, and file entities by id. Navigating to a folder reads the cache and revalidates. The tree sidebar is a separate, smaller query of roots and pinned folders, not a recursive download of the universe.

The list virtualizes. Selection is a set of ids. Bulk move sends those ids and a destination parent. If the selection is “all in this folder,” send the query, not every id you have not loaded.

Uploads live in a queue that survives route changes inside the app and, if you promise it, a refresh (persist the upload id and the resume offset). Each file: create an upload session, PUT chunks, complete. The UI shows progress from bytes acknowledged, not from a fake timer. Concurrency is capped so you do not open fifty connections.

Preview is a route or a panel that chooses a viewer: image, PDF, video, text. Unknown types offer download. Viewers load after the shell. Download uses the file URL with auth, not a full read into memory first.

## Search

Search is an endpoint. Its results are a flat list of files with parent breadcrumbs. Filters (type, owner, modified) are part of the query and the URL. Opening a result navigates to the preview or reveals it in the parent folder. Do not implement search by scanning loaded folders.

## Sharing

The share dialog loads the ACL, adds a person or a link, and saves. Optimistic UI is optional. A failure to share must not look like success. Link sharing shows the scope (view or edit) and the expiry in text.`,
      diagram: {
        caption: "Folder queries fill the list. Uploads are a queue beside it. Preview and search are different reads.",
        mermaid: `flowchart TB
  List[Folder list]
  Meta[File metadata]
  Queue[Upload queue]
  API[Folder and file API]
  Blob[Object storage]
  Search[Search]
  Preview[Previewer]
  List --> Meta
  API --> Meta
  Queue --> Blob
  Queue --> Meta
  Search --> List
  Meta --> Preview`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `File: \`{ id, name, mime, size, parentId, version, updatedAt, thumbnail? }\`. Folders are files with a folder mime or a \`kind: folder\`.

Folder page: \`{ parent, children, nextCursor }\`.

Upload session: \`{ uploadId, fileId, offset, size, state }\`. States: queued, uploading, paused, failed, done.

ACL entry: \`{ principal, role }\` where role is owner, editor, or viewer. Link: \`{ url, role, expiresAt }\`.

Move command: \`{ ids, destinationParentId }\`. Response lists conflicts. Delete is soft: a trash flag and a restore command. Say that, because hard delete is a different confirm.

Quota: \`{ used, limit }\` from the server, shown in the shell, not computed by summing loaded files.

Local persistence: the upload queue and maybe the last folder id. File names and ACLs come from the server. Do not keep other people’s file names in a global cache after logout.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /folders/{id}?cursor=
→ { children, nextCursor }

POST /uploads
{ name, size, parentId }
→ { uploadId, fileId }

PUT /uploads/{id}
Content-Range: bytes
→ { offset }

POST /files/{id}/complete

PATCH /files/{id}
{ name, version }
→ { file } or 409

POST /files/move
{ ids, destinationParentId }

GET /search?q=&cursor=
→ { files, nextCursor }

GET /files/{id}/acl
PUT /files/{id}/acl
\`\`\`

Name conflicts return 409 with the existing file id. The dialog offers replace, keep both, or cancel, and replace is a versioned overwrite you only do if the role allows it.

The list is a grid with keyboard selection. Row actions are in a menu with names. Drag and drop to a folder is extra, not the only move path. Upload is a button and a drop target on the folder view.

Preview has a close control and a download control. Focus returns to the file row when the preview closes. Progress for uploads is in a region that does not steal focus on every byte, and errors are announced when a file fails.

Share roles are a select with the role names spelled out. The link URL is a readonly field with a copy button.`,
      diagram: {
        caption: "An upload session resumes from the acknowledged offset. Metadata appears when the file completes.",
        mermaid: `sequenceDiagram
  participant UI
  participant API
  participant Store as Storage
  UI->>API: create upload
  UI->>Store: PUT chunk at offset
  Store-->>UI: next offset
  UI->>API: complete
  API-->>UI: file in folder`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Large folders

Page the children. Virtualize the page you render if you ever load a big window. Sort is server sort so page two matches page one. A client sort of a partial folder lies. Thumbnails are separate requests, lazy, with a fixed box so the grid does not reflow. Generating thumbnails is a server job. The list does not wait for them.

## Resumable uploads

If the tab dies, the session id and the file handle may be gone. You can only resume if you still have the file bytes (the user picks the file again, or you held it in the origin private file system for a short time). Be honest. What you can always do is retry a chunk from the server’s last offset while the tab lives. Cap parallel uploads. Hash or etag the completed object if you need integrity.

## Permissions in the UI

The folder payload includes \`canWrite\`. Hide upload and rename when false, and handle a 403 if the ACL changed while the page was open. A shared link view is the same component with a capability token and a smaller action set. Do not leak sibling folders that the token cannot see. Breadcrumbs stop at the shared root.

## Trash and move conflicts

Soft delete removes the id from the parent list and can be undone from a trash query. A move into a folder that already has that name is a 409 per file in a bulk move, and the UI shows a list of conflicts rather than failing the whole batch silently. Partial success is a result object. Say it.`,
    },
  ],
};
