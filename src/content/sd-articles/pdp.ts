import type { SystemDesignGuide } from "@/lib/types";

export const pdpGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A product detail page: gallery, price, variant choice (size, color), availability, and add to cart. The URL identifies the product and the selected variant so a shared link lands on the same SKU.

What you commit to:

- HTML for the title, price, and a hero image is server-rendered. The variant matrix and gallery can enhance, but the default SKU is in the first response.
- Price and inventory are server fields. The client does not compute a discount. A change in variant updates the price from data you already have or from a refetch, and you say which.
- Add to cart sends the SKU and a quantity, with an idempotency key. If the SKU sold out between render and click, the button learns about it from the error and the page shows the new availability.
- Gallery images reserve their boxes. Color is not the only way to pick a variant.
- Reviews, recommendations, and rich media below the fold do not gate the add-to-cart control.

Scale: a popular PDP is a public cache per product, with variant query, plus a small uncached inventory check if stock is hot. Images are the bytes.

Out of scope: the full catalog browse and checkout. The cart mutation hands off to a cart you can name. Personalization of “recently viewed” is a separate, uncached request.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `One product document drives the page. It includes the option axes, the list of SKUs, and a default SKU id. Each SKU has price, availability, and the image ids that apply. Selecting a color or a size finds the matching SKU or shows that combination as unavailable. That selection is written to the query string without a full navigation if you can still server-render shared links. A full navigation is also fine and simpler. Do not keep the choice only in memory.

The gallery is a list of images for the current SKU, with a selected index. Reuse a carousel pattern: buttons, not drag alone, and no autoplay that the user cannot stop. The hero is the LCP. Give it priority and a known size. Later images lazy-load.

Add to cart is a command. Optimistic update of a cart count in the header is allowed if rollback is real when the POST fails. The PDP itself should show the server’s availability after the response. Disable the button only while the request is in flight, not as your only guard against double submit. The idempotency key does that.

Inventory freshness: the cached HTML can be slightly stale. On a hot SKU, the client confirms \`GET /skus/{id}/availability\` before enabling purchase, or the POST is the confirmation and the UI handles rejection. Say which. Do both if stock is scarce: confirm on load and still handle rejection.

## Price presentation

Show the currency from the SKU. A strike-through compare-at price is a field, not a calculation. Tax and shipping messaging is copy unless you have a quote endpoint, in which case it loads after the main price and never replaces it without a label.

## Below the fold

Reviews are paged and fetched after the main content, or included as a short summary in the HTML with a link. Recommendations are another query, lazy, and labeled. Neither shares the hero’s network priority.`,
      diagram: {
        caption: "The product document selects a SKU. The gallery and price follow that SKU. Cart is a command.",
        mermaid: `flowchart TB
  HTML[Cached product HTML]
  Doc[Product and SKUs]
  Select[Variant selection]
  Gallery[Gallery]
  Cart[Cart command]
  Stock[Availability check]
  HTML --> Doc
  Doc --> Select
  Select --> Gallery
  Select --> Stock
  Select --> Cart`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Product: \`{ id, title, description, options: [{ name, values }], skus, defaultSkuId }\`.

SKU: \`{ id, optionValues, price, compareAt, available, imageIds }\`. \`optionValues\` maps axis to value, such as size to M and color to navy.

Image: \`{ id, src, width, height, alt }\`. Alt can vary by color, so it lives with the image, not only on the product.

Selection state: the chosen values, the resolved sku id or null, and the gallery index. The URL holds the sku id or the option values. Prefer the sku id for uniqueness and keep the values visible in the UI.

Cart command: \`{ skuId, qty, idempotencyKey }\`. Response is the new cart summary \`{ count, lines }\` or an error code such as \`sold_out\` or \`price_changed\`.

Do not cache a personalized price (loyalty) on the public HTML. Request it as a small overlay if you have it, and label it. The public price remains the guest price.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /products/{id}
→ HTML and the product JSON used to render it

GET /skus/{id}/availability
→ { available, qty?, price }

POST /cart/lines
Idempotency-Key: {key}
{ skuId, qty }
→ { count } or 409 { code, sku }

GET /products/{id}/reviews?cursor=
→ { reviews, nextCursor }
\`\`\`

Variant controls are radio groups or a listbox, one group per axis, with the value in the accessible name. Unavailable combinations are disabled and described, not removed without explanation if that makes the matrix jump. A single select is fine when an axis is long (shoe sizes).

The add button names the product and is disabled with a reason when no SKU matches. Price is text next to the control, updated when the SKU changes, and announced.

The gallery thumbnail buttons have alt or a position label (“Image 2 of 5, navy”). Arrow keys move the selected image when the gallery is focused. A zoom view is a dialog with a close button.

Quantity is an input with a minimum and a maximum from availability if you know it. Do not let the user add 99 if the response will fail, but still handle the failure.`,
      diagram: {
        caption: "Add to cart is idempotent. A sold-out response updates availability instead of incrementing the badge twice.",
        mermaid: `sequenceDiagram
  participant Shopper
  participant Page
  participant API
  Shopper->>Page: Add SKU
  Page->>API: POST line with key
  alt available
    API-->>Page: cart count
  else sold out
    API-->>Page: 409 sold_out
    Page->>Shopper: show unavailable
  end`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Variant matrix

The number of SKUs is the product of the axes, minus holes. Store holes as absent SKUs, not as a SKU with a magic price. When the shopper picks a color that does not exist in this size, keep the size and clear the invalid axis, or keep both and show “unavailable.” Prefer showing unavailable so you do not silently change their size. The URL updates to the resolved SKU only when one exists.

## Caching versus stock

Public HTML cached for minutes is good for TTFB and bad for the last unit. Split them. Cache content and images. Ask availability on the client for the selected SKU, and treat POST as the real gate. If price can change, the POST returns the price it charged or refuses with \`price_changed\`, and the page shows the new price rather than confirming the old one.

## Gallery and Core Web Vitals

One hero, known dimensions, high priority. Do not mount a video in the hero that autoplays with sound. Thumbnails are small and lazy. INP: variant clicks update one piece of state and swap an image URL, and they do not re-render a recommendations carousel of product cards. Preload the second image if the gallery swipe is the next interaction.

## Accessibility of color swatches

A navy circle with no text fails. The radio’s name includes the color name, and the selected state is not hue alone (a check or a border plus text). Size is text. Focus is visible on the swatch. The gallery does not trap touch users without buttons.`,
    },
  ],
};
