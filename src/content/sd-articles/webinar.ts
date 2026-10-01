import type { SystemDesignGuide } from "@/lib/types";

export const webinarGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A live webinar room: a host and panelists publish audio and video, an audience watches the stage, and everyone has chat, questions, and a raise-hand. A recording, if it is on, is obvious.

What you commit to:

- Roles are host, panelist, and audience. Audience members subscribe to the stage. They do not upload video by default, and the client does not try to receive a stream per audience member.
- Mute, camera, and device choice are local state that you also signal. “You are muted” is visible on the control and in a banner if the host mutes you.
- Join is resilient: a drop reconnects with the same identity and does not create a second panelist tile.
- If the session is recorded, a persistent indicator says so, for every role, not only the host.
- Captions, if offered, are a text track the audience can turn on. Chat is text. Neither is a substitute that you hide.

Scale: the audience can be large. Media fan-out is a server problem (an SFU or a CDN for a broadcast). The browser subscribes to a handful of tracks. Chat is a side channel that must survive a media reconnect.

Out of scope: building the SFU. You choose to use one and describe the client contract. Also out of scope: a full editing suite for the recording.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Signaling, media, and side channels.

The client gets a token that names the role and the room. Signaling (websocket) joins, receives the roster of publishers, and learns about mute and hand events. Media is WebRTC to an SFU: panelists publish a camera and a microphone, and optionally a screen track. Audience members only subscribe. The host can promote a hand to a panelist, which is a token change and a publish, not a client-side “just start streaming.”

Simulcast or a single broadcast rendition is how you serve a large audience. The client picks a rendition from what it was offered. Say you do not open a mesh of peer connections. A mesh dies at a handful of people.

Layout: stage tiles for publishers, a local preview for yourself that is not echoed back as a remote tile (watch the SFU’s publish id). Device selection uses \`enumerateDevices\` after permission. Permission denial is a specific screen with a way to retry, not an infinite spinner.

Reconnect: keep the participant id, rejoin signaling, republish or resubscribe, and restore mute state from the server’s view of you. The server’s mute wins if the host muted you. Show a reconnecting banner instead of tearing the UI down to the lobby.

## Chat and Q&A

Chat is the message list you already know: cursor, idempotent send, and a connection of its own so a media blip does not freeze questions. Q&A is a moderated queue: audience submits, host promotes to visible. Raise-hand is presence, ephemeral, with a list the host can order.

## Recording

The host toggles recording. The server starts the archive and broadcasts \`recording: true\`. Every client shows a red or textual “Recording” that is not only an icon. Stopping clears it. If you join mid-recording, the flag is in the join snapshot so you do not miss it.

## Lobby

A waiting room is a state before you are admitted. You see your preview and a “waiting” message. The host admits. Do not subscribe to stage media in the lobby.`,
      diagram: {
        caption: "Audience subscribes to the stage. Panelists publish. Chat and hands stay off the media path.",
        mermaid: `flowchart TB
  Client[Room UI]
  Signal[Signaling]
  SFU[SFU media]
  Chat[Chat and Q and A]
  Rec[Recording flag]
  Client --> Signal
  Client --> SFU
  Client --> Chat
  Signal --> Rec
  Rec --> Client`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Participant: \`{ id, name, role, muted, cameraOn, hand, speaking }\`. \`speaking\` is a transient flag from audio level, optional, and it must not reveal that a muted person is talking to other people if the product muted them server-side. If mute is local-only, a speaking indicator while muted is a local “you are muted but talking” hint, shown only to yourself.

Stage: \`{ participantId, hasScreen }[]\` in an order the host can pin.

Chat message: \`{ id, clientMessageId, authorId, body, sentAt }\`.

Question: \`{ id, body, authorId, state }\` where state is queued or visible.

Join snapshot: \`{ self, participants, stage, recording, captionsAvailable }\`.

Local device state: \`{ micId, camId, speakerId }\` in local storage is acceptable. It is not secret. The media stream objects are not serializable and stay in refs.

Token: short-lived, role inside it, refreshed by signaling. Do not put the token in the query string of a recording URL that gets shared.

Captions: a track id and text cues, or a data channel of phrases. The client renders a line, not a second unmoderated chat. Language is a field.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
POST /rooms/{id}/join
→ { token, snapshot }

WS signaling
join, subscribe, publish
mute { participantId, muted }
hand { participantId, raised }
recording { on }

Chat WS or the same socket, separate events
POST message { clientMessageId, body }

WebRTC offer and answer via signaling to the SFU
\`\`\`

Controls: mute, camera, share screen, leave, each a button with a pressed state. The mute button’s name includes whether you are muted. Leave is explicit and stops tracks (\`track.stop()\`) so the camera light goes off.

The recording state is text in the banner and in the control if you are the host. Audience cannot dismiss it permanently.

Chat input is labeled. A live region announces new chat on a polite cadence or only when the chat panel is closed (a count), so a busy room does not talk over the speaker nonstop. When the panel is open, the list is a log and new messages do not steal focus from the input.

Captions are a toggle. They render in a region the user can read, and they are not the only copy of a question the host pinned. Keyboard access reaches mute and leave without hunting across the video.

Device menus list names from \`enumerateDevices\`. Until permission, labels may be blank. Explain that and request permission from a button.`,
      diagram: {
        caption: "Join loads a snapshot, then media. A reconnect reuses the participant id.",
        mermaid: `sequenceDiagram
  participant UI
  participant Signal
  participant SFU
  UI->>Signal: join
  Signal-->>UI: snapshot and token
  UI->>SFU: subscribe stage
  Signal--xUI: drop
  UI->>Signal: rejoin same participant
  UI->>SFU: resubscribe`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Why the audience does not publish

A thousand upstreams will crush the client and the server. The product is a stage. Hand-raise is a small signaling message. Promotion to panelist is rare and is the moment you start publishing. If you need a “gallery of everyone,” cap it and say the cap, and still prefer subscribed simulcast over a mesh. The interview signal is that you refused N-squared peer connections.

## Mute semantics

Local mute stops sending frames or sends silence, and the tile shows muted so people do not think the connection died. Host mute is a server-side refusal to forward, plus a signal the UI must obey, or a hostile client unmutes and keeps talking. For a staff answer, host mute is enforced in the SFU, and the UI reflects it. Camera off sends a black track or stops the video track and shows an avatar, and it stops the camera indicator on the laptop by stopping the track.

## Reconnect and duplicate tiles

If rejoin allocates a new participant id, the room shows two of the same person and one of them is frozen. Persist the id in the session and design the roster as a map by id. Replace the stream on resubscribe. Ignore an old peer connection’s events after you have opened a new one. Leave tears down both signaling and tracks.

## Recording, captions, and consent

Join snapshot includes recording so latecomers see it before they speak. The indicator stays visible against any layout, including full screen. Captions are optional to view and, if the host enables live transcription, that is also disclosed because it is another processor of the audio. Chat is logged with the recording or it is not, and the product copy should match. Do not autoplay the stage with sound. Start muted or wait for a user gesture, then remember it inside the room only.`,
    },
  ],
};
