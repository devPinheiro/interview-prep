import type { SystemDesignGuide } from "@/lib/types";

export const notificationsGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `An in-app notification center: a badge, a list of what happened, and a way to open the thing it points at. Read state is reliable. Push permission is a separate, later ask.

What you commit to:

- The badge is a count or a dot from a small endpoint or a session payload, not a download of every row.
- The list is cursor-paged, newest first, and grouped when many events share a target (five likes on one post become one row with a count).
- Mark read is idempotent. Mark-all-read means “read up to this cursor,” not “patch every id the client happens to have loaded.”
- Clicking a row navigates to the entity and marks it read. If the entity was deleted, the row says so and still clears.
- Browser push is opt-in after a user gesture that has context. Denial is remembered. The in-app list works with push off.

Scale: a heavy user can have thousands of historical notifications. The panel holds a page. Realtime only increments the badge and prepends if the panel is open.

Out of scope: the email and SMS pipelines, and a full preference-center matrix, though you should name per-category muting as a settings link.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Three surfaces share one store: the badge in the shell, the panel list, and the push worker.

The store keeps \`unreadCount\` and a page of notification ids plus entities. Opening the panel fetches the first page if it is stale. The badge can refresh on focus and on a socket event without opening the list.

Realtime event \`notification.created\` bumps the count and, if the panel is open at the top, prepends the id. If the user has scrolled the panel, show a “new” affordance instead of jumping. \`notification.read\` from another tab sets the entity’s read flag and decrements the count once.

Mark read sends ids or a cursor. Optimistic: set read locally and adjust the count, rollback if the POST fails. Mark-all-read stores the cursor you had at click time so a notification that arrives a second later stays unread.

Push: the page asks permission only from a control that explains why. The service worker shows a notification from a server payload (title, body, target url). Clicking it focuses the app and opens that url. The worker does not contain a copy of the inbox.

## Grouping

Grouping is a server decision so pages do not disagree. The row has a group key, a count, and a representative actor list. Expanding the group fetches the members. The client does not try to cluster arbitrary pages itself.

## Empty and failure

If the list request fails, the badge can still show the last count and the panel shows a retry. Do not zero the badge on a failed fetch.`,
      diagram: {
        caption: "The badge and the panel read one store. Push is a side door to a URL, not a second inbox.",
        mermaid: `flowchart TB
  Badge[Badge]
  Panel[Panel list]
  Store[Notification store]
  API[Inbox API]
  Socket[Realtime]
  SW[Service worker]
  Badge --> Store
  Panel --> Store
  API --> Store
  Socket --> Store
  SW --> Badge`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Notification: \`{ id, type, actors, target, count, read, createdAt, groupKey }\`. \`target\` is \`{ type, id, url, title }\`. \`actors\` is a short list of users for the sentence “A and B liked your post.”

Page: \`{ items, nextCursor }\`. The unread endpoint is \`{ unreadCount, readCursor }\`.

Read command: \`{ ids }\` or \`{ upToCursor }\` for mark-all. The server’s read cursor is the authority for “everything older than this is read.”

Preferences, if you touch them: \`{ category, inApp, push }\`. They do not live on each row.

Do not store the full inbox in localStorage. A short cache of the first page is optional for instant open, keyed by user id, and cleared on logout. The badge count in memory is enough across a session.

Ids are stable so a realtime create and a later fetch merge. A grouped row uses the group key as its list id and updates \`count\` in place.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /notifications?cursor=
→ { items, nextCursor, unreadCount }

POST /notifications/read
{ ids } or { upToCursor }
→ { unreadCount, readCursor }

notification.created { notification }
notification.read { ids, unreadCount }
\`\`\`

Push payload is the browser’s shape: title, body, data url. It is not the full notification entity.

The panel is a dialog or a disclosure with a heading. Rows are links with the sentence as the name. Unread state is text or a mark, not color alone. Mark-all is a button. The live region announces “3 new notifications” when the count changes from a socket, not on every render.

Focus goes into the panel when it opens and back to the badge button when it closes. Pagination is a load-more button as well as any infinite scroll.

If the target 404s, the page you land on explains it. The notification row can show “no longer available” on the next fetch when the server marks it.`,
      diagram: {
        caption: "Mark-all-read uses the cursor at click time so a newer item stays unread.",
        mermaid: `sequenceDiagram
  participant User
  participant Panel
  participant API
  User->>Panel: Mark all read
  Panel->>API: upToCursor C
  API-->>Panel: unreadCount
  Note over API: item newer than C stays unread`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Badge correctness

The count is not \`items.filter(unread).length\` of the loaded page. It is a server count. Decrement locally on read, then accept the server number from the response so two tabs converge. If a socket drops, refetch the count on focus. A badge that sticks at 1 after you read everything is the bug people notice.

## Permission timing

Asking for push on the first visit gets denied and you cannot ask again. Ask from the notification settings, or after a repeated in-app event the user already cares about. If permission is denied, stop asking and keep the in-app center. The service worker registration can exist without permission. Showing a notification requires it.

## Grouping and deep links

The grouped row opens the target entity, not an intermediate page, unless the group mixes targets. The url on the row is what push uses too, so both doors land in the same place. Include enough title in the row that the user can decide without opening.

## Accessibility and motion

The panel does not autofocus a moving list. New rows insert at the top only when the user is at the top. Reduced motion skips the badge bounce. The count in the button’s accessible name includes the number (“Notifications, 4 unread”) and updates.`,
    },
  ],
};
