import type { SystemDesignGuide } from "@/lib/types";

export const musicGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A player for a catalog of tracks and albums: play, pause, seek, queue, shuffle, repeat, and the next track starting without a gap the listener notices. Lock-screen and keyboard controls work while the tab is in the background.

What you commit to:

- Playback is a state machine. The controls reflect the engine, and the engine does not restart because a button re-rendered.
- The queue is an ordered list of track ids, separate from “now playing.” Shuffle is a permutation of that list, not a coin flip on every advance.
- The next track is buffered before the current one ends. A quality or format change happens between tracks, not mid-sentence, unless the product really is adaptive streaming.
- Resume stores position per track and per context (album, playlist, radio). Radio is a server-extending queue, not a local list you already own.
- Captions or lyrics, if in scope, are a timed track. They are not burned into the audio.

Scale you should say: a playlist can be thousands of tracks, but the DOM holds the now-playing chrome and a window of the queue. Artwork is on a CDN. The personal queue and the catalog are different caches.

Out of scope for the first pass: social activity, recommendations, and a full DRM license server. If the catalog is licensed, name Encrypted Media Extensions as a later path and do not pretend a plain audio element can play it.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Split the shell, the session, and the engine.

The shell is the transport bar, the queue drawer, and the volume control. It reads a playback snapshot and sends commands. It does not own the clock.

The session is the product object: context (playlist id or album id), the queue order, the shuffle permutation, the repeat mode, and the index of the current item. Advancing the index is a session transition. Repeat-one does not advance. Repeat-all wraps. A radio session asks the server for the next ids when the tail gets short.

The engine plays one item. For progressive files an audio element is enough, with \`preload="auto"\` on a second element for the next track. For gapless or a crossfade, schedule buffers on a Web Audio graph: decode the next window early and start it at a computed time so the output clock does not stop. Media Source is the tool when the product is segmented (long podcasts, adaptive bitrate). Do not introduce MSE for a three-minute MP3.

Media Session API is the integration with the OS and keyboard: title, artist, artwork, play, pause, next, previous, and seek. Update metadata when the index changes, including while the document is hidden. Autoplay without a user gesture will be blocked. The first play happens on a click, and later tracks continue from that activation.

## Interruptions

A phone call or another app taking audio focus pauses the engine and leaves the session index where it was. On resume, play from the same offset. Do not re-fetch the queue. A headphone-unplug pause is the same transition. Log it as a stalled or interrupted state, not as an ended track.

## Failures

A 404 or a decode error skips to the next item after a short, visible failure, and records that the track failed so you do not tight-loop on a broken id. A network stall stays on the same track, shows buffering, and retries with backoff. Ended is different from stalled.`,
      diagram: {
        caption: "The shell sends commands. The session owns order. The engine owns the clock and the next buffer.",
        mermaid: `flowchart TB
  Shell[Transport and queue UI]
  Session[Queue session]
  Engine[Playback engine]
  Audio[Audio element or Web Audio]
  Next[Prefetch of next track]
  API[Catalog and radio API]
  OS[Media Session]
  Shell --> Session
  Shell --> Engine
  Session --> Engine
  Engine --> Audio
  Engine --> Next
  API --> Session
  Engine --> OS`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Catalog entities are cacheable and mostly public:

- Track: \`{ id, title, artistId, albumId, durationMs, artwork, sources }\`. \`sources\` is a list of \`{ url, mime, bitrate }\`. The client picks one. It does not invent a bitrate.
- Album and playlist are lists of track ids plus art.
- Lyrics, if present: \`{ trackId, cues: [{ startMs, endMs, text }] }\` or a WebVTT URL.

Session is private and small:

- \`{ contextId, order: trackId[], shuffleOrder, repeat, index, offsetMs, volume, muted }\`.
- Persist \`index\` and \`offsetMs\` per context so a refresh resumes. Persist volume globally.
- A radio token \`{ sessionId, cursor }\` is how the server extends the tail. Do not cache radio pages on a shared CDN URL.

The engine snapshot, which the shell renders, is \`{ state, trackId, currentTime, duration, buffered, error }\`. States are idle, loading, playing, paused, stalled, ended, and error. Interrupted is paused plus a reason.

Downloads for offline, if you promise them, are encrypted blobs keyed by track id in Cache Storage or IndexedDB, with the key staying in the app’s session. The queue then prefers a local URL. Name the quota. A catalog the user “liked” is not the same as a file that is on disk.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /tracks/{id}
→ { id, title, artist, durationMs, artwork, sources }

GET /playlists/{id}/tracks?cursor
→ { tracks, nextCursor }

POST /radio/{sessionId}/next
→ { tracks, cursor }

PUT /me/playback
{ contextId, index, offsetMs }
\`\`\`

Previous means “restart this track if offset is past a couple of seconds, otherwise go to the prior index.” Say that. It is what people expect, and it is easy to get wrong.

Seek is a command to the engine, debounced if the scrubber emits continuously, then one \`currentTime\` write. Do not POST the server on every pointer move. POST the resume point on pause, on \`pagehide\`, and on a timer of tens of seconds.

Artwork in Media Session should be a few absolute URLs at known sizes, not a CSS background. The transport buttons are real buttons. The scrubber is a slider with a label that includes the track name, and the value text updates on a polite live region at a low rate so a screen reader is not flooded every frame.

Keyboard: space toggles play when focus is not in a field, arrows seek, and media keys go through Media Session rather than a second implementation.`,
      diagram: {
        caption: "A track ending advances the session. The next buffer was already warm, so the clock continues.",
        mermaid: `sequenceDiagram
  participant Engine
  participant Session
  participant Shell
  participant API
  Engine->>Engine: current time nears end
  Engine->>API: prefetch next source
  Engine->>Session: ended
  Session->>Session: advance index
  Session->>Engine: play track at index
  Engine->>Shell: new snapshot and metadata`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Gapless and crossfade

Two audio elements will click if you start the second in the \`ended\` handler after a task. Measure the gap. If the product requires gapless, decode ahead and schedule the next buffer against the audio clock. Crossfade is two gains ramping over a few hundred milliseconds, which means both tracks are live during the ramp. That is a different promise from gapless. Pick one and name the cost in memory.

## Shuffle that does not feel broken

Shuffle once into \`shuffleOrder\` when the user turns it on, and keep that order until they reshuffle. Skipping back must return to the previous shuffled item, not a new random id. Removing a track from the queue edits both orders. Turning shuffle off returns to the original album order at the same track, not at index zero.

## Large playlists and the queue UI

The catalog page is virtualized. The queue drawer virtualizes too once it can hold a radio tail of hundreds. Now-playing artwork is the LCP on the player route, so give it a reserved ratio and a priority hint. The rest of the playlist art is lazy.

## Background and lyrics

A hidden tab can have timers throttled. Drive the lyric cursor from \`timeupdate\` or the audio clock, not from \`setInterval\`. If the browser suspends JS, Media Session still owns the OS controls, and the next foreground tick reconciles the displayed time. Do not autoscroll lyrics with a large layout jump under reduced motion.`,
    },
  ],
};
