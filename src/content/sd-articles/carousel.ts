import type { SystemDesignGuide } from "@/lib/types";

export const carouselGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A reusable image carousel for a product page, not a marketing animation that traps the only copy of a photo.

Behavior:

- Previous, next, and a way to jump (dots or thumbnails). Looping is optional and named.
- Swipe is extra. Buttons remain. A touch-only carousel fails keyboard and switch users.
- No autoplay by default. If the business insists, pause is visible, motion stops on interaction, and \`prefers-reduced-motion\` disables it.
- One broken image does not break navigation. The slide shows a failure state.
- Images have alt text, reserved dimensions, and responsive sources. The active slide can be announced as “Image 2 of 6” when the user moves.

Performance: the current slide and its neighbors may load. The rest wait. If the carousel is the hero and the LCP element, that first image is high priority. Distant slides are not.

The component can be controlled (\`activeIndex\`, \`onChange\`) when the URL or a parent gallery owns the index, or uncontrolled when it does not. Say which you are shipping.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `The controller owns the index. The viewport owns overflow and the pointer gesture. Slides own their image status. Controls are native buttons. A live region speaks only user-initiated changes.

Prefer CSS scroll-snap on a horizontal scroller before a transform track. Scroll-snap gives momentum and less gesture code. A transform track is justified when you must virtualize a very long gallery or run a designed animation. That justification is rare on a product page of six photos.

Gesture rules: the pointer handler lives on the viewport, ignores mostly vertical movement so the page can still scroll, and suppresses the click that would otherwise follow a real drag. None of this replaces the buttons.

Autoplay, if present, is a timer in the controller that clears on pointer, focus, and reduced motion. It is not the default path in the diagram, because it should not be the default product.`,
      diagram: {
        caption: "The controller owns the index. The viewport and slides do not invent a second index.",
        mermaid: `flowchart TB
  Controller[Carousel controller]
  Viewport[Viewport]
  Slides[Slides]
  Controls[Previous and next]
  Status[Live status]
  Controller --> Viewport
  Viewport --> Slides
  Controls --> Controller
  Controller --> Status`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
type Slide = {
  id: string
  alt: string
  src: string
  srcSet?: string
  width: number
  height: number
}
\`\`\`

Stable ids keep React identity when the gallery reorders. Width and height reserve the box so the page does not jump. Alt is required. Decorative slides say so explicitly rather than omitting the attribute by accident.

State:

- \`activeIndex\`, clamped or wrapped according to the loop flag.
- Optional drag offset, local to the viewport, discarded on end.
- Per-slide load status: loading, ready, error. One error does not reset the index.

The visible window is derived: current, previous, next. Thumbnails use a separate low-resolution source so you are not decoding full images to paint a strip.

Do not store the gallery in local state copied from props on every render. If the parent passes new images, identity is the slide id, and you keep the index only when that id still exists.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
<Carousel
  images={Slide[]}
  activeIndex?
  defaultActiveIndex?
  onChange?(index)
  loop?
/>
\`\`\`

Buttons are \`button\` elements named “Previous image” and “Next image”, not icon-only controls with an empty name. At the ends, disable them if you do not loop. If you loop, the name still says previous and next.

Arrow keys apply only when a control inside the carousel has focus. Do not listen on \`window\`. Document-level arrows break every other widget on the page.

Media URLs belong to the CDN:

\`\`\`
GET /media/{id}?w={width}&format=avif
Cache-Control: public, max-age=31536000, immutable
\`\`\`

The browser picks a candidate with \`srcset\` and \`sizes\`. The component does not download the original and scale it in CSS.`,
      diagram: {
        caption: "A control updates the index. Only the slides in the window request full-size media.",
        mermaid: `sequenceDiagram
  participant User
  participant Controls
  participant Controller
  participant Slide
  participant CDN
  User->>Controls: Next
  Controls->>Controller: index + 1
  Controller->>Slide: mount neighbor
  Slide->>CDN: srcset candidate
  CDN-->>Slide: image bytes`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Accessibility

The previous and next controls are always in the tab order. The announcement fires when the user changes the slide, not on a timer. Autoplay plus a live region is noise. Thumbnails are buttons with names, not file names. Visible focus stays on whatever control was used. If a slide contains a link, moving slides must not dump focus into an unexpected place.

## Gesture versus scroll

A horizontal carousel inside a vertical page will steal the wrong gesture if you treat every pointer movement as a swipe. Require a horizontal threshold and a win against the vertical delta before you capture the pointer. If you lose, the page scrolls. After a drag, swallow the click so you do not activate a child link by accident.

## Visual stability and LCP

The box is sized from width and height before decode. Only one image is allowed to be the LCP candidate. Eager neighbors are one each side, not the whole set. On a low-end phone, decoding six hero images will hitch. Measure that before you “optimize” by prefetching everything.`,
    },
  ],
};
