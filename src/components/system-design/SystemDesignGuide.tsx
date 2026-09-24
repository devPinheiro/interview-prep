import type { Question } from "@/lib/types";

type Guide = NonNullable<Question["systemDesignGuide"]>;

export function SystemDesignGuide({ guide }: { guide: Guide }) {
  return (
    <section className="system-design-guide" aria-label="Detailed system design walkthrough">
      <div className="system-design-guide-intro">
        <p className="system-design-guide-kicker">Interview walkthrough</p>
        <p>{guide.framing}</p>
      </div>

      <GuideSection title="Start by clarifying">
        <ol className="system-design-steps">
          {guide.clarifyingQuestions.map((item, index) => (
            <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
          ))}
        </ol>
      </GuideSection>

      <GuideSection title="Component boundary">
        <div className="system-design-tree" role="list">
          {guide.componentTree.map((item) => <p key={item} role="listitem">{item}</p>)}
        </div>
      </GuideSection>

      <GuideSection title="State and ownership">
        <div className="system-design-table">
          {guide.stateModel.map((item) => (
            <div key={item.name} className="system-design-table-row">
              <div><strong>{item.name}</strong><span>{item.owner}</span></div>
              <p>{item.notes}</p>
            </div>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="Interface contracts">
        <div className="system-design-contracts">
          {guide.interfaces.map((item) => (
            <article key={item.name}>
              <h4>{item.name}</h4>
              <pre><code>{item.contract}</code></pre>
              <p>{item.why}</p>
            </article>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="Decisions worth saying out loud">
        <div className="system-design-decisions">
          {guide.decisions.map((item) => (
            <article key={item.decision}>
              <h4>{item.decision}</h4>
              <p>{item.tradeoff}</p>
            </article>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="Deep dives">
        <div className="system-design-deep-dives">
          {guide.deepDives.map((item) => (
            <details key={item.title}>
              <summary>{item.title}</summary>
              <p>{item.content}</p>
            </details>
          ))}
        </div>
      </GuideSection>

      <p className="system-design-close">{guide.close}</p>
    </section>
  );
}

function GuideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="system-design-section"><h3>{title}</h3>{children}</section>;
}
