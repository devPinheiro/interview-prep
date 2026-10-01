import type { SystemDesignGuide } from "@/lib/types";

export const storiesGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A row of people with unseen stories, and a viewer that plays one person’s segments in order: images and short videos, with a way to pause, go back, skip, and reply. Segments expire. Seen state is remembered.

What you commit to:

- A story is an ordered list of segments with a duration. Images use that duration. Videos use their length, capped.
- The viewer is a state machine: which user, which index, playing or paused. A tap on the right is not the only control. Buttons do the same thing.
- The next segment is prefetched. The next user is prefetched only when you are near the end, not the entire friend graph.
- Autoplay is muted until the user turns sound on, and a gesture starts sound. Reduced motion does not run a fast crossfade, and the timer still advances with a visible pause control.
- Closing returns to the place you opened from. Reply does not lose the segment index.

Scale: the tray is a horizontal list of users. The viewer holds one segment fully and the next one warm. Media is CDN bytes. Seen state is a small write.

Out of scope: the camera capture pipeline and a full messenger. Reply can hand off to the chat composer with a story id attached.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Tray and viewer.

The tray loads users who have active stories: \`{ userId, unseen, cover }\`. It is server-ordered. Horizontal scroll with buttons. The cover image is small. Opening a user routes to the viewer with that user id so refresh and share can land there if the story is still valid.

The viewer loads that user’s segments and starts at the first unseen index, or zero if all are seen. A timer or the video element’s time advances progress. When a segment ends, the index increments. After the last, you move to the next user in the tray or close.

Prefetch: when index is N, request N+1’s media. If N is the last, prefetch the next user’s first segment. Cancel prefetch if the user leaves. Do not prefetch every user in the tray. That is a bandwidth bug.

Pause when the pointer is held, when a reply box is focused, when the tab is hidden, and when the user hits the pause button. Resume does not skip the remaining time. Video elements pause for real so audio does not continue.

Seen: when a segment completes or the user skips forward, POST a seen mark for that segment id. It can be batched at the end of a user’s story if you accept a crash losing the mark. Prefer sending on advance so a kill does not rewind them to the start. Idempotent.

## Progress UI

One bar per segment, filled for past ones, partial for the current, empty for later. The fill follows time. Under reduced motion, update the bar without a tween, or update less often. The bars are also buttons that jump to that index, if you want random access. If they are decorative, the previous and next buttons are the controls.

## Expiry

The server omits expired segments. If the one you are on expires or 404s, skip to the next or exit with a message. Do not loop a broken media file.`,
      diagram: {
        caption: "The tray picks a user. The viewer plays an index and prefetches the next segment only.",
        mermaid: `flowchart TB
  Tray[Story tray]
  Viewer[Viewer state machine]
  Seg[Current segment]
  Next[Prefetch next]
  Seen[Seen API]
  CDN[Media CDN]
  Tray --> Viewer
  Viewer --> Seg
  Viewer --> Next
  Seg --> CDN
  Next --> CDN
  Viewer --> Seen`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Tray item: \`{ userId, name, avatar, unseenCount, coverUrl }\`.

Story: \`{ userId, segments: [{ id, type, url, durationMs, width, height, alt }] }\`.

Viewer state: \`{ userId, index, paused, soundOn, progressMs }\`. Progress for video comes from the element. For images it comes from a timestamp started when the segment became current, subtracting paused intervals. Do not use a drifting \`setInterval\` as the only clock. Store \`startedAt\` and \`accumulatedPause\`.

Seen request: \`{ segmentIds }\`. The tray’s \`unseenCount\` decrements from the response or locally in a way the next tray fetch overwrites.

Reply draft is separate, keyed by segment id, so moving to the next segment does not post the previous reply by accident. Sending a reply pauses playback and then resumes.

Sound preference can stick for the session. Do not persist autoplay-with-sound as a default that bypasses the browser’s media policy. The first sound-on is a user control.

Cache media with the HTTP cache. A segment URL can be short-lived. If it expires mid-view, refresh the story document and continue at the index.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /stories/tray
→ { users }

GET /stories/{userId}
→ { segments }

POST /stories/seen
{ segmentIds }
→ { ok }

POST /stories/{segmentId}/replies
{ text }
\`\`\`

The viewer is a dialog with an accessible name (“Story by Sam, 2 of 5”). Next, previous, pause, and close are buttons. The click zones on the image can exist for pointer users and must not be the only path. Keyboard: arrows, space to pause, Escape to close.

If the segment is an image, expose \`alt\` if you have it. Stories are often decorative or duplicative of the name. If there is no alt, the dialog name still carries the author and the index so the screen reader is not silent. Videos expose the same controls as your player, simplified, and do not autoplay sound.

A reply field has a label. While it is focused, the story stays paused. Progress is visible as text (“2 of 5”) for people who do not see the bars.

Reduced motion: no ken-burns pan on stills. The segment still changes when the user hits next or when the duration elapses, and that duration is not shortened sneakily.`,
      diagram: {
        caption: "Finishing a segment marks it seen and plays the prefetched next one.",
        mermaid: `sequenceDiagram
  participant Viewer
  participant CDN
  participant API
  Viewer->>CDN: show segment N
  Viewer->>CDN: prefetch N plus 1
  Viewer->>API: seen N
  Viewer->>Viewer: index becomes N plus 1`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Prefetch budget

The failure mode is downloading every friend’s video when they open the app. Prefetch the next segment and maybe the next cover. On a constrained network or \`Save-Data\`, prefetch only the next image and wait to fetch video until the index lands. The timer for an image can start only after the image has decoded, or you will skip a segment that never appeared. If you start the timer on navigation, a slow file gets a short life. Wait for load, with a timeout that skips and reports the failure.

## Gesture and accessibility

Edge taps and long-press-to-pause are common and invisible. Keep labeled buttons. Do not use a timer to trap focus. Closing restores focus to the tray item that opened the viewer. The horizontal tray is a list with a roving tabindex or native scroll and visible focus, plus next and previous controls so it is not a swipe-only row.

## Seen state races

Mark seen on advance, idempotent. If the POST fails, retry, and still let them move. On the next tray load, unseen counts come from the server. Do not block playback on the seen write. If they go backward, you do not unset seen. Skipping to the next user can mark the remainder unseen, which is the right product call, and you should say it: only segments you displayed or skipped-forward count. Define skip-forward as seen so you do not trap people who are trying to leave.

## Video inside a story

Reuse the player ideas: muted start, no competing audio from a second segment (unload the previous element), captions if the video has them. A segment error skips after a brief message. Hold-to-pause must call \`video.pause()\` or the audio keeps going. When the viewer unmounts, pause and drop the element.`,
    },
  ],
};
