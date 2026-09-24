import type { Question } from "@/lib/types";

const refs = [{ site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" }];

/** Fourth authoring wave: curated behavioural practice prompts. */
export const authoredBehaviourStubs: Question[] = [
  {
    id: "beh-disagreement-senior", track: "behaviour", level: "senior", title: "Disagreement with a strong senior engineer", tags: ["conflict", "collaboration"], status: "ready", canonicalTopic: "disagreement-senior", competencies: ["conflict", "judgment", "communication"],
    prompt: "Tell me about a time you disagreed with a highly respected engineer on a technical decision. How did you reach a decision without turning it into a status contest?",
    hints: ["Make the disagreement about customer or system outcomes, not personalities.", "Show how you made the decision reversible or gathered evidence."],
    approach: "Set up a real trade-off, explain how you made both views legible, name the decision mechanism, and end with the relationship/process outcome—not simply being proved right.",
    solution: "Draft a story where you challenged a decision with evidence, listened carefully, and made the smallest safe experiment possible. The answer should make clear what you owned, the other engineer’s valid concern, and how the team escaped a deadlock.",
    interviewerNotes: "Senior candidates are scored on intellectual honesty and conflict repair. Do not choose a story where the other person was obviously unreasonable.", sourceRefs: refs,
    starModel: {
      situation: "A senior engineer proposed moving every checkout validation rule into a shared client package. I was concerned that it would couple three products to one release cycle and make regional exceptions harder to ship.",
      task: "I needed to challenge the design without slowing the launch or making the discussion personal, while still protecting the product teams from a hard-to-reverse platform decision.",
      action: "I wrote down the two approaches with concrete failure cases: release ownership, bundle impact, and how a new regional rule would flow. In the review I first restated the engineer’s goal—consistent validation and fewer production defects—then proposed a two-week pilot: a small shared schema layer with product-owned adapters. We agreed on success measures and asked the tech lead to make the final call after the pilot.",
      result: "The pilot caught two inconsistent rules while allowing the launch team to ship a local exception without waiting on the shared package. We adopted the adapter boundary, and the senior engineer and I co-authored the contribution guide instead of revisiting the same debate in later reviews.",
      reflection: "I learned to surface the other person’s underlying goal before presenting my alternative. It made the disagreement a joint design problem and gave us a reversible way to learn.",
    },
  },
  {
    id: "beh-failure", track: "behaviour", level: "mid", title: "Tell me about a failure", tags: ["growth", "ownership"], status: "ready", canonicalTopic: "failure", competencies: ["ownership", "learning", "communication"],
    prompt: "Tell me about a project or decision that did not go as planned. What was your part in it, and what changed because of what you learned?",
    hints: ["Choose a real failure with meaningful stakes, not a disguised strength.", "Spend more time on recovery and durable change than on the mistake itself."],
    approach: "Own a specific judgment error, show early detection and transparent communication, then name the prevention mechanism you created. Avoid blaming a vague process or another team.",
    solution: "A credible failure answer names the decision you made, why it seemed reasonable then, the impact, the corrective action, and the operating habit you changed. The model is a shape to adapt—not an event to memorize.",
    interviewerNotes: "Interviewers listen for accountability without self-destruction: no hero narrative, no external blame, and a specific lesson that changed later behavior.", sourceRefs: refs,
    starModel: {
      situation: "I led the frontend estimate for a self-service account migration and treated an old embedded settings page as a small integration detail. Two weeks into the work, we found it used an undocumented authentication handoff that our new shell could not support.",
      task: "I had to surface the risk immediately, protect the launch date where possible, and own the gap in my discovery rather than letting the team find out at the end.",
      action: "I told the PM and engineering lead the same day, with three recovery options and their scope/date impact. I paired with the legacy owner to map the handoff, split the migration so the main account flow could launch, and added a compatibility bridge for the embedded page. Afterward I added an integration inventory and a mandatory owner review to our planning template.",
      result: "The main migration launched one week later than planned instead of slipping the quarter. The embedded page followed in the next release, and the inventory caught two similar hidden dependencies in a later project before estimates were committed.",
      reflection: "I learned that a clean mock and a component inventory are not enough for migration estimation; boundary contracts and operational ownership need explicit discovery time.",
    },
  },
  {
    id: "beh-deadline", track: "behaviour", level: "mid", title: "Delivering under a tight deadline", tags: ["ownership", "execution"], status: "ready", canonicalTopic: "deadline", competencies: ["prioritization", "communication", "execution"],
    prompt: "Tell me about a time you delivered under a tight deadline without quietly trading away quality or burning out the team.",
    hints: ["Define the non-negotiable customer outcome and cut scope deliberately.", "A good story includes risk communication, not just late nights."],
    approach: "Show how you separated must-have from nice-to-have, created a visible risk plan, and preserved checks for the critical path. Finish with the outcome and what you would plan earlier next time.",
    solution: "Use a case where constraints were genuine and you made transparent choices. The strongest stories show sequencing, stakeholder alignment, and a quality floor—not personal endurance as the solution.",
    interviewerNotes: "Look for judgment: an interviewer should hear how the candidate decides what not to build, validates the risk, and keeps partners informed.", sourceRefs: refs,
    starModel: {
      situation: "A partner announcement moved our launch date forward by three weeks. The original plan included a new dashboard, migration tooling, and a visual refresh, but the partner only needed users to complete the new onboarding path on launch day.",
      task: "I owned the frontend delivery plan and needed to meet the date while keeping the onboarding path accessible, observable, and safe to roll back.",
      action: "I turned the launch into a one-page scope contract: onboarding, analytics, error handling, and support copy were non-negotiable; the dashboard refresh and automated migration were deferred. I split the work by independent route, added daily risk reviews, paired early with QA on the critical flow, and put the path behind a feature flag with synthetic checks. I told stakeholders what we were not shipping and why before implementation began.",
      result: "We launched on the announced date with a 98% successful onboarding rate in the first week. The deferred dashboard shipped two sprints later with better research rather than rushed UI, and there were no after-hours hotfixes for the launch team.",
      reflection: "The biggest accelerator was naming the quality floor early. It stopped last-minute requests from masquerading as launch requirements.",
    },
  },
  {
    id: "beh-cross-team-launch", track: "behaviour", level: "staff", title: "Leading a cross-team launch", tags: ["leadership", "cross-functional"], status: "ready", canonicalTopic: "cross-team-launch", competencies: ["leadership", "influence", "systems-thinking"],
    prompt: "Tell me about leading a launch that required several teams with different incentives and dependencies. How did you create alignment and manage the system, not just your own work?",
    hints: ["Staff stories should show mechanisms that scale beyond a single meeting.", "Describe how you handled a dependency that did not report to you."],
    approach: "Frame the customer/business outcome and the dependency graph. Explain the planning mechanism, decision rights, leading indicators, and how you unblocked teams without becoming the bottleneck.",
    solution: "Choose a launch with real cross-functional friction. The model should demonstrate shared operating rhythm, clear ownership, and a result that persists as a reusable playbook or platform capability.",
    interviewerNotes: "Staff-level scope shows leverage: clear interfaces, decision forums, and durable coordination mechanisms rather than personally doing every integration.", sourceRefs: refs,
    starModel: {
      situation: "We were launching a new subscription tier across web, billing, identity, support, and data teams. Each group had a valid local priority, but a failure in any one system could create an incorrect entitlement or a support burden.",
      task: "I was the frontend staff engineer asked to make the customer experience and the cross-team launch path reliable, even though none of the dependency teams reported to me.",
      action: "I created a shared launch map around customer states rather than team deliverables: discover, purchase, provision, manage, and recover. Every state had a DRI, an API/UX contract, and a measurable exit criterion. I set up a twice-weekly 25-minute dependency review with a written decision log, ran an end-to-end staging drill with support, and pushed for an entitlement-readiness endpoint so the UI did not infer billing state. When billing slipped its bulk migration, we agreed on a gated rollout cohort and a manual support fallback instead of delaying all teams.",
      result: "The launch reached 10% of eligible users on time and expanded to 100% after the staging and cohort metrics held. Entitlement-related tickets stayed below the agreed threshold, and the customer-state map became the template for two later multi-product launches.",
      reflection: "I learned that cross-team plans need a shared representation of the customer journey. A generic status meeting hid the actual integration risks; the state map made missing ownership obvious.",
    },
  },
  {
    id: "beh-saying-no", track: "behaviour", level: "senior", title: "Pushing back on a product request", tags: ["judgment", "product"], status: "ready", canonicalTopic: "saying-no", competencies: ["judgment", "product-thinking", "communication"],
    prompt: "Tell me about a time you pushed back on a product request. How did you protect the relationship while changing the decision?",
    hints: ["Say no to an approach, not the underlying customer goal.", "Bring evidence and a credible alternative."],
    approach: "Explain the product intent, the engineering/user risk you found, how you validated it, and the smaller or safer path you proposed. End with the shared outcome.",
    solution: "The point is not to win an argument. Show that you understood the customer problem, made the risk concrete, offered a path forward, and involved the right decision-maker at the right time.",
    interviewerNotes: "Good pushback feels collaborative and specific. Avoid stories where you simply invoked authority, process, or an arbitrary technical preference.", sourceRefs: refs,
    starModel: {
      situation: "A product manager wanted an always-on full-screen upsell modal after every successful user action to accelerate trial conversion. The request was scheduled for the same sprint as an accessibility remediation effort.",
      task: "I needed to address the conversion goal while preventing an intrusive experience that would interrupt keyboard users and make the core workflow feel punitive.",
      action: "I reviewed session recordings and funnel data with the PM, then mapped the modal behavior against focus management and repeat-exposure risks. Instead of rejecting the idea, I proposed an inline contextual upgrade card after the user reached a usage limit, plus a one-time modal only at a natural break. We ran an A/B test with frequency caps, an escape path, and an accessibility review before rollout.",
      result: "The contextual variant achieved the target upgrade lift with fewer support complaints and no new keyboard-accessibility issues. The PM adopted the frequency-cap rule for later lifecycle experiments, and we added it to the growth component guidelines.",
      reflection: "I learned that the best pushback translates a UX concern into the metric and experiment language partners already use, while still defending the experience boundary clearly.",
    },
  },
];
