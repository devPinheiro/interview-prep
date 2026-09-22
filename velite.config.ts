import { defineConfig, s } from "velite";

/**
 * Velite validates markdown content under content/.
 * Primary app data also lives in src/content/*.ts for interactive fields (sandbox, options).
 */
export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: {
    notes: {
      name: "Note",
      pattern: "notes/**/*.md",
      schema: s.object({
        title: s.string(),
        track: s.enum(["quiz", "dsa", "system-design", "behaviour", "negotiation"]),
        slug: s.slug("notes"),
        body: s.markdown(),
      }),
    },
  },
});
