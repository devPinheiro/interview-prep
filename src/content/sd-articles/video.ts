import type { SystemDesignGuide } from "@/lib/types";

export const videoGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A streaming video player for on-demand titles, with a note on how live would differ. People press play, seek, change captions, and survive a bad network.

Behavior:

- States are explicit: idle, loading, playing, paused, stalled, ended, failed.
- Quality adapts to bandwidth and can be pinned by the viewer. Switches happen on segment boundaries so the playhead does not restart.
- Captions and audio languages are separate tracks. Captions are timed text, not burned into the picture.
- Resume offers the last position instead of silently jumping.
- Controls stay available when the pointer hides, and they work from the keyboard.
- A stall keeps the last frame and tells the truth. It does not reset to time zero.

Targets: time to first frame on a mid-tier phone is the metric you name, plus rebuffer count per play. The page around the player has its own LCP. The player should not block that with a giant script if the video is below the fold.

Live playback, if asked, drops the resume prompt and cares about latency behind the live edge. Do not design both in full unless they ask. Say which one you designed.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `A shell owns controls and preferences. A media engine owns the element or a Media Source Extensions buffer: current time, buffered ranges, and errors. A quality policy chooses the next segment’s rendition from throughput and the viewer’s pin.

For adaptive streaming, the engine reads a manifest (HLS or DASH). The manifest lists renditions and media segments of a few seconds each. The engine appends one segment at a time. When throughput drops, the next segment comes from a lower rendition, aligned to the same timeline. You do not reload the entire file.

Captions are a text track, WebVTT or the equivalent signaled by the manifest, rendered in a layer you control so contrast and position can meet accessibility, or a native text track if that is enough. Audio is another rendition set, switched without changing the video timeline.

Preferences (volume, mute, caption language, quality override) sit in a session store, not in the media engine. The engine reports facts. The shell decides policy.

The stalled state is entered when playback catches the end of the buffer. The policy then requests lower renditions. Repeated failure offers retry at the same time. Ended is a different state from stalled.`,
      diagram: {
        caption: "Controls talk to the shell. The engine pulls a manifest and then segments. Captions are a separate track.",
        mermaid: `flowchart TB
  Shell[Player shell]
  Engine[Media engine]
  Manifest[Manifest]
  CDN[Segment CDN]
  Captions[Caption track]
  Shell --> Engine
  Engine --> Manifest
  Engine --> CDN
  Engine --> Captions`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Manifest {
  duration,
  renditions: [{ id, bandwidth, width, height, codec }],
  captions: [{ lang, label, url }],
  resumeAt?
}

Playback {
  state, currentTime, buffered: [start, end][],
  renditionId, captionLang, volume, muted, error?
}
\`\`\`

\`resumeAt\` is per profile and title, stored on the server when you are signed in and locally otherwise. You ask before seeking there.

Buffered ranges are how the scrubber shows what is safe to jump to. A seek outside the buffer is a command that may stall. That is fine if the UI says it is loading that range.

Do not persist the media bytes in the design unless downloads are in scope. Streaming segments can live in the HTTP cache. A service-worker download mode is a different product with storage limits and rights rules.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /titles/{id}/manifest
→ { duration, renditions, captions, resumeAt }

GET /titles/{id}/r/{rendition}/{n}.m4s

GET /titles/{id}/captions/{lang}.vtt
\`\`\`

Segments are immutable and cacheable. The manifest may be short-lived if you insert ads or update live playlists. For on-demand, the media playlist can be cached longer than a live one. Say which.

Quality selection is local policy over that manifest. There is no “set quality” RPC required unless you are reporting the choice for analytics:

\`\`\`
player.rendition_change { titleId, from, to, reason }
player.stall { titleId, currentTime, renditionId }
\`\`\`

Keyboard: Space toggles play when the player has focus, arrows seek by a small step, captions are a menu of names. Focus rings stay visible. The control bar returns on focus even if the idle timer hid it.`,
      diagram: {
        caption: "A bandwidth drop changes the next segment’s rendition. The playhead stays on one timeline.",
        mermaid: `sequenceDiagram
  participant Engine
  participant Manifest
  participant CDN
  Engine->>Manifest: list renditions
  Engine->>CDN: segment 10 high
  Note over Engine: throughput falls
  Engine->>CDN: segment 11 low
  CDN-->>Engine: append at same timeline`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Stalls and oscillation

If you switch rendition on every sample, the picture will flap. Smooth the throughput estimate and require the new rendition to win by a margin before you leave the current one. A viewer pin overrides the policy until they clear it. On stall, drop a rung for the following segments and keep the frame. After several failures, surface retry. Never seek to zero as a recovery.

## Captions

A caption cue has a start, an end, and text. You render the cue whose window contains \`currentTime\`. Switching language swaps the track and does not rebuild the video buffer. Burned-in captions cannot be turned off and cannot be restyled. Offer a track even when a burned-in version exists, and name the languages in the viewer’s language where you can.

## Resume and autoplay policy

Browsers block autoplay with sound. Start muted or wait for a gesture, and design the button for that. Resume should be a prompt, “Continue at 12:04”, because a silent seek feels like data loss. Store the position periodically, not only on pause, or a crash loses the hour.

## Live, if they ask

The manifest updates. The player stays a few segments behind the live edge so the buffer exists. Seeking is bounded by the DVR window. Latency targets fight quality. You say which one the product chose. You do not claim both are minimized.`,
    },
  ],
};
