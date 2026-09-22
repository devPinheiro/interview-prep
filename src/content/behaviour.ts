import type { Question } from "@/lib/types";

export const behaviourQuestions: Question[] = [
  {
    id: "beh-conflict-api",
    track: "behaviour",
    level: "senior",
    title: "Conflict over an API contract with backend",
    tags: ["conflict", "collaboration"],
    status: "ready",
    canonicalTopic: "conflict-api",
    competencies: ["conflict", "communication"],
    prompt:
      "Tell me about a time you disagreed with a backend engineer about an API shape that blocked the UI. What did you do?",
    hints: [
      "Use STAR(R): focus on your actions and the relationship outcome.",
      "Show data or user impact, not ego.",
    ],
    approach:
      "S: deadline + mismatched contract\nT: unblock UI without burning trust\nA: clarify use cases, propose options, agree on decision owner\nR: shipped + healthier process\nR: what you changed afterward (API review ritual)",
    solution:
      "Write your own story in the STAR builder. Compare to the model only after you draft.",
    interviewerNotes:
      "They score judgment, empathy, and whether you escalate appropriately.",
    sourceRefs: [
      { site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" },
    ],
    starModel: {
      situation:
        "Two weeks before launch, the checkout API returned nested prices that our form library could not validate cleanly, and the backend lead wanted to ship as-is.",
      task:
        "I needed a contract we could implement safely without slipping the release or souring the partnership.",
      action:
        "I documented three UI failure cases with screenshots, proposed a flatter DTO plus a temporary adapter on our side, and scheduled a 25-minute decision meeting with a clear DRI. We agreed on the adapter for v1 and a dated follow-up for the proper contract.",
      result:
        "We shipped on time with zero pricing defects in the first week. The adapter was removed the next sprint. We added a joint API review checklist for future features.",
      reflection:
        "I would have shared the failure cases earlier in design review instead of waiting for implementation friction.",
    },
  },
  {
    id: "beh-performance-win",
    track: "behaviour",
    level: "senior",
    title: "A performance win you drove",
    tags: ["performance", "ownership"],
    status: "ready",
    canonicalTopic: "performance-win",
    competencies: ["ownership", "technical-judgment"],
    prompt: "Describe a time you improved frontend performance with measurable impact.",
    hints: ["Name the metric (LCP/INP/bundle).", "Include how you validated."],
    approach: "STAR with numbers; mention trade-offs you rejected.",
    solution: "Draft in the builder; use the model as a structure check.",
    interviewerNotes: "Metrics + validation method = senior signal.",
    sourceRefs: [
      { site: "frontend-atlas", url: "https://frontendatlas.com/guides/behavioral/intro" },
    ],
    starModel: {
      situation: "Our marketing landing LCP was ~4.8s on mobile, hurting SEO and paid conversion.",
      task: "I owned getting LCP under 2.5s without redesigning the page.",
      action:
        "I profiled with WebPageTest, found a late-discovered hero image and render-blocking font. I preloaded the hero, switched to font-display: swap with subsetting, and deferred non-critical scripts behind interaction.",
      result: "LCP p75 dropped to 2.1s; landing conversion rose ~6% over two weeks.",
      reflection: "I now add performance budgets to the definition of done for marketing templates.",
    },
  },
  {
    id: "beh-incident",
    track: "behaviour",
    level: "senior",
    title: "Production UI incident",
    tags: ["incident", "ownership"],
    status: "ready",
    canonicalTopic: "incident",
    competencies: ["ownership", "communication"],
    prompt: "Tell me about a production frontend incident you helped resolve.",
    hints: ["Mitigate first, then diagnose.", "Mention communication cadence."],
    approach: "Detect → mitigate → communicate → root cause → prevent.",
    solution: "Use STAR; emphasize customer impact and prevention.",
    interviewerNotes: "Blameless tone; prevention > heroics.",
    sourceRefs: [
      { site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" },
    ],
    starModel: {
      situation: "A bad feature flag default hid the pay button for 8% of users after a release.",
      task: "Restore checkout quickly and prevent recurrence.",
      action:
        "I flipped the flag off within minutes, posted a status update, then traced the default in our flag config. We added a canary check for critical CTA visibility.",
      result: "Impact window ~12 minutes; no lasting revenue loss detected; canary caught a similar issue later.",
      reflection: "Critical path UI now has synthetic checks before full rollout.",
    },
  },
  {
    id: "beh-influence",
    track: "behaviour",
    level: "staff",
    title: "Influence without authority",
    tags: ["leadership", "influence"],
    status: "ready",
    canonicalTopic: "influence-without-authority",
    competencies: ["leadership", "influence"],
    prompt:
      "Tell me about a time you changed the technical direction of teams that did not report to you.",
    hints: ["Data, relationships, framing, escalation as last resort."],
    approach: "Show mechanisms: RFC, pilots, metrics — not title power.",
    solution: "Draft your story; model shows the altitude expected at staff.",
    interviewerNotes: "Staff bar: leverage and trust preserved.",
    sourceRefs: [
      { site: "codesnatch", url: "https://codesnatch.io/behavioral-interviews/leading-without-authority" },
    ],
    starModel: {
      situation:
        "Three product squads each maintained divergent form libraries, slowing accessibility fixes.",
      task: "Align them on one approach without a reporting line.",
      action:
        "I wrote an RFC with migration cost, ran a pilot on the highest-traffic squad, published before/after a11y scores, and offered office hours. Two squads opted in; the third got an exception with a review date.",
      result: "Shared library adoption hit 70% in a quarter; critical a11y bugs dropped by half.",
      reflection: "Leading with a reversible pilot beat arguing at architecture review alone.",
    },
  },
  {
    id: "beh-mentoring",
    track: "behaviour",
    level: "mid",
    title: "Mentoring a junior engineer",
    tags: ["mentoring", "growth"],
    status: "ready",
    canonicalTopic: "mentoring",
    competencies: ["mentoring"],
    prompt: "Describe how you helped someone grow technically or in delivery.",
    hints: ["Specific coaching loop, not 'I was nice'."],
    approach: "Goals → feedback cadence → outcome for them and the team.",
    solution: "Write STAR focusing on their outcome.",
    interviewerNotes: "Evidence of multiplying others.",
    sourceRefs: [
      { site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" },
    ],
    starModel: {
      situation: "A new hire struggled with PR size and review cycles.",
      task: "Help them reach independent delivery in one quarter.",
      action:
        "We set a weekly goal of smaller PRs, paired on the first two features, and used a checklist for self-review before requesting mine.",
      result: "Their median PR cycle time fell from 5 days to 1.5; they owned a feature solo by week 10.",
      reflection: "I now share the self-review checklist in onboarding docs.",
    },
  },
  {
    id: "beh-ambiguity",
    track: "behaviour",
    level: "senior",
    title: "Delivering through ambiguity",
    tags: ["ambiguity", "product"],
    status: "ready",
    canonicalTopic: "ambiguity",
    competencies: ["ownership", "judgment"],
    prompt: "Tell me about shipping when requirements were unclear.",
    hints: ["How you created clarity; what you cut."],
    approach: "Frame problem, propose MVP, validate with users/PM, sequence risks.",
    solution: "STAR with explicit trade-offs.",
    interviewerNotes: "Senior FE as product engineer.",
    sourceRefs: [
      { site: "frontend-atlas", url: "https://frontendatlas.com/guides/behavioral/intro" },
    ],
    starModel: {
      situation: "PM wanted a 'smarter dashboard' with no success metrics.",
      task: "Turn the vague ask into a shippable MVP in six weeks.",
      action:
        "I interviewed three power users, proposed a problem statement and two metrics, built a clickable prototype, and cut scope to one workflow.",
      result: "We shipped the workflow; task completion time dropped 30% for that cohort.",
      reflection: "I now refuse to estimate before a written problem statement exists.",
    },
  },
];
