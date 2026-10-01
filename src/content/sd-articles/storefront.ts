import type { SystemDesignGuide } from "@/lib/types";

export const storefrontGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `A storefront: home, listing, product detail, and a path into the cart. This is the browsing surface. Checkout payment is the cart design, not this one, but the product page must hand off a real SKU and a price the server still agrees with.

Needs:

- First product paint is server-rendered. LCP is the product image or the listing’s first tile, with dimensions reserved.
- Listing filters and sort live in the URL so a result can be shared and the back button restores them.
- Product detail shows price, availability, images, and a primary action. Sold out is visible and disables add-to-cart.
- Catalog can be large. Listing paginates or uses a cursor. Do not ship the whole category as JSON on first load.
- Prices and inventory are server-owned at the moment of add-to-cart. The page can be slightly stale if you say how you refresh.

Internationalization: currency and locale format on the server response or from a locale the query includes. Do not hard-code a dollar sign in the component.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Routes: home, category listing, product detail. Each route has a loader that returns the JSON for that view. The client cache keys include the URL search params so two filter sets do not collide.

Listing is a grid. Filters are links or a form that updates the query string and refetches. Optimistic filter UI is unnecessary. A fast server and a pending state are enough. Cancel the previous listing request when the filters change so a slow “all shoes” response cannot overwrite “boots”.

Product detail composes the gallery (the carousel you already know), a buy box, and below-the-fold recommendations fetched after the primary content. Recommendations must not block LCP.

Add to cart calls the cart service with sku and quantity and renders the returned cart count. If the server says the item is gone, the buy box updates from that error rather than showing a success toast.

Static marketing pages can be cached hard. Category and product HTML should be cached briefly or varied on the edge, and personalized blocks (recently viewed) load on the client so the public cache stays public.`,
      diagram: {
        caption: "Listing and product are route loaders. Add to cart is the only write, and it returns the cart.",
        mermaid: `flowchart LR
  Listing[Listing route]
  PDP[Product route]
  Gallery[Gallery]
  Buy[Buy box]
  Cart[Cart API]
  Catalog[Catalog API]
  Listing --> Catalog
  PDP --> Catalog
  PDP --> Gallery
  PDP --> Buy
  Buy --> Cart`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `\`\`\`
Product {
  id, title, description,
  images: Slide[],
  variants: [{ sku, label, price, currency, available }]
}
Listing {
  products: summary[],
  nextCursor, total?
}
\`\`\`

The buy box selects one variant. Price and availability hang off the variant, not the parent, because two sizes are not the same stock. The summary on a listing can show a “from” price, and the detail page is where the chosen SKU becomes real.

URL state: category, sort, filters, cursor. Keep it boring and shareable. Do not hide filters in memory only, or refresh loses them and the back button lies.

Recently viewed is local: a short list of product ids. It is not part of the catalog payload.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /categories/{id}/products?sort&filters&cursor
→ { products, nextCursor }

GET /products/{id}
→ { product }

POST /cart/lines
{ sku, quantity }
→ { cart } | { error: "unavailable", product }
\`\`\`

Product GET can be cached publicly for a short time if the price is allowed to be seconds stale. If it is not, say so and cache only the images.

The listing request is abortable. Filter changes abort the in-flight query.

Add-to-cart is not the checkout. It returns the cart summary the header needs (count and maybe subtotal). A full cart page is a different route.`,
      diagram: {
        caption: "Changing filters aborts the previous listing. Adding a sold-out SKU returns the product, not a success.",
        mermaid: `sequenceDiagram
  participant Shopper
  participant Listing
  participant Catalog
  participant PDP
  participant Cart
  Shopper->>Listing: set filter
  Listing->>Catalog: abort previous
  Listing->>Catalog: GET products
  Shopper->>PDP: open product
  Shopper->>Cart: POST sku
  Cart-->>PDP: cart or unavailable`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Performance of the product page

The LCP image is the first gallery image, with \`fetchpriority\` and a reserved box. Below-fold recommendations, reviews, and analytics wait. Third-party scripts do not sit in front of the buy box. A performance budget for the product route is part of the design, not a follow-up ticket.

## Stale price and stock

The listing price is a hint. The detail page and the add-to-cart response are the checks. If they disagree, show the server price before the shopper continues. Do not let a cached HTML page sell a product the inventory service has already closed. A short revalidate on focus is enough to say in the interview.

## SEO and sharing

Listing and product routes are real URLs with titles. Filters that should be indexed are reflected in the URL and in the server HTML. Facets that explode into infinite combinations should not all be indexed. Say that tradeoff. Infinite client-only filtering with an empty first HTML document fails both SEO and the first visit.`,
    },
  ],
};
