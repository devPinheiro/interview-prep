"use client";

import { useEffect, useId, useState } from "react";

type Props = {
  chart: string;
  caption: string;
};

export function MermaidFigure({ chart, caption }: Props) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSvg("");

    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "var(--font-sans)",
          themeVariables: dark
            ? {
                background: "#14181f",
                primaryColor: "#143230",
                primaryTextColor: "#eef1f4",
                primaryBorderColor: "#3dbdb6",
                lineColor: "#8b93a0",
                secondaryColor: "#1c242e",
                tertiaryColor: "#0c0e12",
                textColor: "#eef1f4",
              }
            : {
                background: "#f7f8fa",
                primaryColor: "#d8efed",
                primaryTextColor: "#0e1116",
                primaryBorderColor: "#0b6e6a",
                lineColor: "#5c6570",
                secondaryColor: "#eef1f4",
                tertiaryColor: "#f7f8fa",
                textColor: "#0e1116",
              },
        });
        const rendered = await mermaid.render(`sd-diagram-${reactId}`, chart);
        if (!cancelled) setSvg(rendered.svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <figure className="sd-diagram">
      {svg ? (
        <div className="sd-diagram-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="sd-diagram-pending">{failed ? "Diagram failed to draw." : "Drawing diagram…"}</div>
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
