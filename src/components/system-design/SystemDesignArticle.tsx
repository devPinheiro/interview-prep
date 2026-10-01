"use client";

import { useEffect, useState } from "react";
import type { DesignSection } from "@/lib/types";
import { MermaidFigure } from "@/components/system-design/MermaidFigure";

function RichText({ text }: { text: string }) {
  const chunks: { kind: "code" | "text"; value: string }[] = [];
  const fence = /```[a-z]*\n([\s\S]*?)```/g;
  let last = 0;
  for (const match of text.matchAll(fence)) {
    const index = match.index ?? 0;
    if (index > last) chunks.push({ kind: "text", value: text.slice(last, index) });
    chunks.push({ kind: "code", value: match[1].trim() });
    last = index + match[0].length;
  }
  if (last < text.length) chunks.push({ kind: "text", value: text.slice(last) });

  return (
    <>
      {chunks.map((chunk, chunkIndex) => {
        if (chunk.kind === "code") {
          return (
            <pre key={chunkIndex}>
              <code>{chunk.value}</code>
            </pre>
          );
        }
        const blocks = chunk.value.trim().split(/\n\n+/).filter(Boolean);
        return blocks.map((block, index) => {
          const lines = block.split("\n");
          const key = `${chunkIndex}-${index}`;
          if (lines.every((line) => line.startsWith("- "))) {
            return (
              <ul key={key}>
                {lines.map((line) => (
                  <li key={line}>{line.slice(2)}</li>
                ))}
              </ul>
            );
          }
          if (block.startsWith("## ")) {
            return <h3 key={key}>{block.replace(/^## /, "")}</h3>;
          }
          return <p key={key}>{block}</p>;
        });
      })}
    </>
  );
}

export function SystemDesignArticle({
  sections,
  notes,
}: {
  sections: DesignSection[];
  notes?: string;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.4] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="sd-layout">
      <nav className="sd-toc" aria-label="On this page">
        <p>On this page</p>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} data-active={active === section.id}>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="sd-reading">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="sd-section">
            <h2>{section.title}</h2>
            <RichText text={section.body} />
            {section.diagram && (
              <MermaidFigure chart={section.diagram.mermaid} caption={section.diagram.caption} />
            )}
          </section>
        ))}
        {notes && (
          <aside className="sd-listen">
            <p>What interviewers listen for</p>
            <RichText text={notes} />
          </aside>
        )}
      </div>
    </div>
  );
}
