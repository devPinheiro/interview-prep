import type { Level, Question } from "@/lib/types";

const refs = [
  { site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/behavioral-interview/" },
];

function story(input: {
  id: string;
  topic: string;
  level: Level;
  title: string;
  tags: string[];
  competencies: string[];
  prompt: string;
  hints: string[];
  approach: string;
  solution: string;
  interviewerNotes: string;
  starModel: NonNullable<Question["starModel"]>;
}): Question {
  return {
    id: input.id,
    track: "behaviour",
    level: input.level,
    title: input.title,
    tags: input.tags,
    status: "ready",
    canonicalTopic: input.topic,
    competencies: input.competencies,
    prompt: input.prompt,
    hints: input.hints,
    approach: input.approach,
    solution: input.solution,
    interviewerNotes: input.interviewerNotes,
    sourceRefs: refs,
    starModel: input.starModel,
  };
}

export const behaviourWave: Question[] = [
  story({
    id: "beh-designer-conflict",
    topic: "beh-conflict-with-a-designer--tell-me-about-a-time",
    level: "senior",
    title: "Conflict with a designer over a dense data table",
    tags: ["conflict", "design"],
    competencies: ["conflict", "accessibility", "communication"],
    prompt:
      "Tell me about a time you disagreed with a designer on a UI that looked right in the mock but was going to fail for keyboard and screen-reader users.",
    hints: [
      "Treat the visual goal as legitimate. The conflict is about how the goal is met.",
      "Bring a concrete artifact, not a lecture about guidelines.",
    ],
    approach:
      "Name the shared customer, the specific failure in the mock, and the alternative that kept the visual density. End with how the working pattern was reused, not with who won.",
    solution:
      "A strong answer restates the designer’s goal first, shows the failure mode in a recorded pass or a prototype, and proposes a change small enough to ship in the same review cycle. The relationship should be intact.",
    interviewerNotes:
      "They listen for respect and specificity. “Designers don’t understand engineering” is a fail. So is abandoning the visual goal the moment accessibility comes up.",
    starModel: {
      situation:
        "A designer shipped a high-fidelity transactions table that hid column labels, used color alone for status, and put row actions in a hover menu. It matched a board review the PM loved. I was implementing it for a finance product used by operations staff who live on keyboard and often zoom to 200%.",
      task:
        "I needed to keep the density and the scan pattern the designer cared about, and still make every row operable without a mouse, before the component was copied into three other admin views.",
      action:
        "I booked a 45-minute working session instead of a ticket comment thread. I restated the goal as “see status and act on a row without opening it.” Then I ran the prototype with a keyboard only and with VoiceOver, and I showed the hover menu never appearing and the green/red pills reading as “image” with no name. I proposed a visible overflow button, a text status next to the color, and a sticky header with real column headers, and I mocked the same density in the existing table primitive so it was not a redesign. The designer adjusted type size and padding so the text status still fitted. We wrote the decisions into the component’s usage notes the same day.",
      result:
        "The table shipped in that sprint. Support tickets about “I can’t find the action” dropped on the pilot group, and two later admin views reused the primitive instead of forking hover menus. The designer asked me to review the next data-heavy mock before it went to critique.",
      reflection:
        "I had been leaving accessibility comments on frames, which felt like a veto. Sitting with the prototype and protecting the density made it a design problem we both owned.",
    },
  }),
  story({
    id: "beh-pm-conflict",
    topic: "beh-conflict-with-a-pm--tell-me-about-a-time",
    level: "senior",
    title: "Conflict with a PM over a misleading countdown",
    tags: ["conflict", "product"],
    competencies: ["judgment", "product-thinking", "communication"],
    prompt:
      "Tell me about a time you pushed back on a product requirement because the UI would mislead people, even though the metric looked better.",
    hints: [
      "Show you understood the metric the PM was protecting.",
      "The alternative should still move that metric, or you must say why you accepted a smaller lift.",
    ],
    approach:
      "Describe the deceptive mechanism in one sentence, the evidence you gathered, and the decision owner. Do not make the PM the villain.",
    solution:
      "The answer should make the harm concrete (false scarcity, trapped focus, hidden price) and the replacement experiment just as operational. Ending on a guideline the team reused scores higher than ending on “I was right.”",
    interviewerNotes:
      "Senior bar: you can hold a user-trust line without sounding like you only care about craft. Name the metric and the trade you actually accepted.",
    starModel: {
      situation:
        "A PM wanted a checkout banner that counted down from ten minutes and said “only a few left,” even when inventory was healthy. The copy was tied to an urgency test that had lifted conversion in a previous company. Legal had not reviewed it. I was the frontend lead on checkout.",
      task:
        "I needed to stop a claim the client would have to fake, while still giving the growth team a fair test of urgency before the quarterly goal review.",
      action:
        "I asked what “a few” meant and wrote down three implementations: a timer with no stock check, a timer driven by the real hold expiry we already had, and static copy. I showed that the first one required the browser to invent a number, which we could not defend if a customer screenshotted it. I pulled five support tickets where people had abandoned carts because a previous promo timer expired while stock remained. We took the real hold expiry to design and to legal. The PM kept the experiment but the banner only rendered when a hold existed, and the copy said “price held until” plus a clock from the server timestamp.",
      result:
        "The honest hold timer still lifted completion versus no banner, less than the PM’s original hope, and we did not ship a fabricated stock claim. The pattern went into the checkout content checklist: urgency copy must match a server field.",
      reflection:
        "I used to argue from “dark patterns” as a label. Mapping the sentence to the field that makes it true was what changed the requirement.",
    },
  }),
  story({
    id: "beh-tech-stack",
    topic: "beh-disagreement-on-tech-stack--tell-me-about-a-time",
    level: "senior",
    title: "Disagreement on adding a second state library",
    tags: ["judgment", "architecture"],
    competencies: ["judgment", "influence", "technical-strategy"],
    prompt:
      "Tell me about a time the team wanted to adopt a new library or stack choice you thought was the wrong default. How did you handle it?",
    hints: [
      "A stack fight without a constraint is just taste. Name the constraint.",
      "Show you engaged with the benefits the other side wanted.",
    ],
    approach:
      "Describe the proposed tool, the cost you were actually worried about, the short evaluation, and who decided. Include what you adopted from their idea.",
    solution:
      "The score is whether you made the decision reversible and specific. “I don’t like new things” is not a story. A time-boxed spike with a written bar is.",
    interviewerNotes:
      "Listen for bundle, hiring, and migration cost, not slogan wars. Credit the other engineer if their spike taught you something.",
    starModel: {
      situation:
        "On a dashboard that already used the framework’s built-in state and a thin query cache, a senior teammate proposed adding a second client store for every server entity, with a new pattern the rest of the org did not use. Two feature teams were waiting on a shared filters panel.",
      task:
        "I needed a decision before both teams invented their own cache, without turning the discussion into a library referendum that blocked the panel.",
      action:
        "I asked them to list the pains: stale filters, prop drilling, and awkward optimistic updates. We wrote an eval of one week: implement the filter panel twice, once with the existing query cache and once with the new store, and compare lines of code, the bundle delta, and how a 409 from the server rolled back. I paired on the new-store spike so I was not reviewing from a blog post. The spike showed optimistic rollback was nicer in the new store and that the bundle and the second mental model were the real cost. We kept the query cache, and I pulled the rollback helper pattern they had written into our existing mutation hook.",
      result:
        "The panel shipped the following week on the current stack. The rollback helper became the standard for the two other mutations that had the same bug. We wrote down “new state library needs a failing case the current cache cannot express” as the bar for the next proposal.",
      reflection:
        "I had almost said no in the first meeting from familiarity. The spike made the useful idea separable from the dependency.",
    },
  }),
  story({
    id: "beh-missed-deadline",
    topic: "beh-missed-deadline-recovery--tell-me-about-a-time",
    level: "mid",
    title: "Recovering after a missed translation deadline",
    tags: ["ownership", "delivery"],
    competencies: ["ownership", "communication", "execution"],
    prompt:
      "Tell me about a time you missed a commitment. How did you recover without hiding the miss or dumping the cost on another team?",
    hints: [
      "The miss should be yours to name, even if others contributed.",
      "Recovery includes what you told stakeholders the day you knew, not only the eventual ship.",
    ],
    approach:
      "Date the moment you knew you would miss, the options you offered, the slice you still shipped, and the checklist that changed. Avoid a story where heroic overtime is the only fix.",
    solution:
      "A credible recovery names the information you lacked, the decision you made once you had it, and a control that would have caught it earlier. Softening the miss into a success story fails the prompt.",
    interviewerNotes:
      "Mid-level bar is communication and a concrete process change. Blaming translators, or claiming the date never mattered, is a miss.",
    starModel: {
      situation:
        "I owned the frontend for a billing settings page launching in three locales. I estimated the strings as a late, easy step. A week before launch I discovered the layout broke in German, and the translation vendor’s window had already closed because I had not frozen copy.",
      task:
        "I had to tell the PM the same day, protect the customers who could launch, and own the planning gap rather than asking the vendor for a silent weekend exception.",
      action:
        "I slacked the PM and the eng manager with three options and dates: ship English only and slip the other locales, ship all locales with English fallback and a banner where translation was missing, or slip the whole launch. I recommended the fallback, with German and French queued for the vendor’s next cycle. I fixed the layout against pseudo-localization the same day so the next strings would not reflow into a broken button, and I added a “string freeze” checkbox to our launch template with an owner and a date two weeks out.",
      result:
        "English launched on the original date. The other locales followed nine days later, inside the vendor’s normal window. The freeze checkbox caught a similar miss on the next pricing page before copy was sent.",
      reflection:
        "I had treated translation as content and layout as engineering. They are one schedule. I now put locale expansion in the estimate as its own task, not as a suffix.",
    },
  }),
  story({
    id: "beh-rollback",
    topic: "beh-rollback-decision--tell-me-about-a-time",
    level: "senior",
    title: "Deciding to roll back a checkout change",
    tags: ["incident", "judgment"],
    competencies: ["judgment", "ownership", "communication"],
    prompt:
      "Tell me about a time you had to roll back or kill a change you or your team had shipped. What made you decide, and how did you handle the people who wanted to push through?",
    hints: [
      "Name the signal that crossed your line, not a vague bad feeling.",
      "Include how you kept the learning after the rollback.",
    ],
    approach:
      "State the user harm, the time pressure, who you consulted, and the decision. Then the safer path that replaced the change.",
    solution:
      "Interviewers want a reversible decision made on evidence, including the social part: you did not disappear and revert in secret. The follow-up fix matters as much as the revert.",
    interviewerNotes:
      "A rollback story that never names a metric or a user-facing failure is abstract. A story that blames QA for not catching it is defensive.",
    starModel: {
      situation:
        "We shipped a new payment-method selector that combined card and wallet options into one animated list. It passed our desktop browser suite. Within an hour, conversion on Safari iOS dropped and support started seeing “button does nothing” from people on older iPhones.",
      task:
        "I was the on-call frontend owner. I had to decide whether to hotfix forward or roll back before the afternoon traffic peak, while the designer and the PM wanted to keep the new layout because the bug “only” hit one browser.",
      action:
        "I pulled the real-user timing and the error logs and saw failed clicks clustered on a sticky footer that sat under the browser toolbar after the animation. I reproduced it on a device from the office drawer, not only in responsive mode. I told the channel the options: a CSS hotfix I could not prove in under an hour, or a flag-off back to the previous selector. I recommended flag-off, with the recording attached, and I asked the PM to make the call in the channel so it was shared. We turned the flag off. I wrote a six-line note: symptom, who was hit, what we reverted, and that the new layout would return behind a device check plus a manual pass on two physical phones.",
      result:
        "Conversion recovered in the next hour. The layout came back four days later after the footer bug was fixed and verified on hardware. We added “physical phone pass for sticky checkout controls” to the release checklist.",
      reflection:
        "I had treated the browser suite as a proxy for the customer. The rollback was easier to defend once I had one real device and one number, not a debate about elegance.",
    },
  }),
  story({
    id: "beh-flag-incident",
    topic: "beh-feature-flag-incident--tell-me-about-a-time",
    level: "senior",
    title: "A feature flag that defaulted on in production",
    tags: ["incident", "release"],
    competencies: ["ownership", "systems-thinking", "communication"],
    prompt:
      "Tell me about a time a rollout mechanism failed and customers saw something that was not supposed to be live. What did you do?",
    hints: [
      "Explain the flag’s intended safety and how that safety failed.",
      "Separate stopping the bleeding from the longer change to the system.",
    ],
    approach:
      "Walk the timeline: detect, contain, communicate, repair the default, and change the process so the next flag cannot repeat it.",
    solution:
      "The best versions show you understood blast radius and did not rely on “we’ll be careful.” A dashboard, a default, or a missing environment split is the meat.",
    interviewerNotes:
      "Listen for production-versus-staging separation and a user-visible containment step. “We hopped on a call” without an action is not enough.",
    starModel: {
      situation:
        "I owned a new address-autocomplete experiment. The flag’s default in code was true so local development was easy. A refactor dropped the production override during a Friday deploy. Autocomplete went to 100% of checkout, including a region whose address API quota was still on a trial key.",
      task:
        "I needed to stop the quota burn and the broken suggestions for that region, tell support what customers were seeing, and fix the flag path so a missing override could not mean “on.”",
      action:
        "I confirmed the flag payload in production rather than trusting the console draft. I shipped a one-line default of false and a kill that did not depend on the broken override. I posted in support and incident channels what the UI was doing and that a refresh would return the old input. After traffic was quiet I wrote the post-incident notes: defaults in source must be the safe value, local opt-in lives in a dev-only file, and the release check compares the production snapshot version to what the PR claims. I added that check as a failing build if the committed default for a new flag was true.",
      result:
        "The experiment was off within twenty minutes of detection. The quota did not expire. The next two flags in that repo went out with default false, and the build check caught one attempt to flip a default back.",
      reflection:
        "I had used the default as a convenience for myself. The incident was the moment I treated the default as a production behavior, because that is what it is when config is missing.",
    },
  }),
  story({
    id: "beh-a11y-gap",
    topic: "beh-accessibility-gap-you-closed--tell-me-about-a-time",
    level: "mid",
    title: "Closing an accessibility gap in a modal",
    tags: ["accessibility", "ownership"],
    competencies: ["ownership", "craft", "user-focus"],
    prompt:
      "Tell me about a time you found or were shown an accessibility bug in something your team had shipped. What did you change beyond the one fix?",
    hints: [
      "The user or the bug report is not a punchline.",
      "A systemic change (lint, checklist, component) is the senior or strong mid signal.",
    ],
    approach:
      "Describe the broken interaction in operational terms, the fix, and the guard that prevents the same class of bug. Mention how you involved design or QA.",
    solution:
      "Focus management, names, and contrast are enough technical detail. The behavior signal is whether you widened the fix past your own component.",
    interviewerNotes:
      "A story that ends at “I added an aria attribute” is thin. Listen for how the rest of the app stopped growing the same bug.",
    starModel: {
      situation:
        "A customer who uses a screen reader wrote that our “invite teammate” dialog could not be closed and that focus disappeared behind the page. I had built the dialog as a styled div with a click-away handler. It had shipped in a settings refresh I was proud of.",
      task:
        "I needed to repair that flow quickly and stop the next three dialogs, already in design, from copying the same pattern.",
      action:
        "I reproduced it with the keyboard and with VoiceOver: no role, no initial focus, background still tabbable, Escape did nothing. I replaced the div with our shared dialog, which already trapped focus, restored focus to the trigger, and labeled the title. I wrote the customer’s path into the QA notes so the fix was verified the way they used it, not only by looking at the DOM. Then I deleted the local pattern from the snippet repo and added a lint rule that flags a click-away overlay without a dialog role. I asked design to point new overlays at the shared component in the spec.",
      result:
        "The invite dialog was fixed in two days. The lint rule fired on two in-progress pages before they shipped. The customer’s follow-up said they could send the invite with the keyboard.",
      reflection:
        "I had treated the shared dialog as optional chrome. The bug was the cost of a one-off. I now start from the primitive and restyle it, instead of restyling a div until it looks finished.",
    },
  }),
  story({
    id: "beh-perf-regression",
    topic: "beh-performance-regression-you-owned--tell-me-about-a-time",
    level: "senior",
    title: "Owning a performance regression you shipped",
    tags: ["performance", "ownership"],
    competencies: ["ownership", "technical-depth", "communication"],
    prompt:
      "Tell me about a time a change of yours made the product slower or heavier. How did you discover it, and what did you do?",
    hints: [
      "Own the change. A story about someone else’s regression dodges the prompt.",
      "Name the metric and the user-visible effect, not only the bundle graph.",
    ],
    approach:
      "Detection, impact, containment, the actual fix, and the budget or check you added. Include who you told.",
    solution:
      "Specific numbers and a failed assumption are more credible than “I optimized some components.” The prevention step is what makes it a behavior answer rather than a perf quiz.",
    interviewerNotes:
      "Listen for honesty about why it shipped (no budget, bad import, measuring the wrong page) and a control that is harder to skip next time.",
    starModel: {
      situation:
        "I added a icon set to a marketing page by importing the package root. The page was already close to our Largest Contentful Paint budget. After release, the main bundle jumped by a large chunk and the hero image started arriving later on mid-range phones. I had looked at desktop lab scores only.",
      task:
        "I needed to restore the previous weight without yanking the icons designers had already placed, and to make the bad import fail in CI.",
      action:
        "I confirmed field LCP on that route, not the lab. I told the PM the page had regressed and that I would ship a fix the same day rather than wait for the next sprint. I switched the imports to per-icon paths and checked the bundle diff locally before merging. Icons that were below the fold stayed. I added a size-limit check on the route’s entry so a root import cannot merge unnoticed, and I wrote the incident in the channel with the diff so other teams saw the failure mode.",
      result:
        "Field LCP returned to the previous range within a day of the fix. The size check later failed a similar import in a different package, before release. Design kept the icons they wanted.",
      reflection:
        "I had treated bundle cost as a cleanup task for later. Shipping the budget check was the part that did not depend on me remembering.",
    },
  }),
  story({
    id: "beh-code-review",
    topic: "beh-difficult-code-review--tell-me-about-a-time",
    level: "senior",
    title: "A difficult code review about unsafe HTML",
    tags: ["review", "security"],
    competencies: ["judgment", "communication", "security"],
    prompt:
      "Tell me about a time you blocked or strongly challenged a code review. How did you keep it about the change and not about the person?",
    hints: [
      "Quote the risk in product terms.",
      "Offer a path that still lets them ship the feature.",
    ],
    approach:
      "The review comment, the conversation, the alternative, and the relationship afterward. If you were wrong about tone, say so.",
    solution:
      "Security and correctness reviews fail when they are a drive-by “no.” Show you explained the threat, paired on the fix, and left a reusable note.",
    interviewerNotes:
      "Look for whether the author stayed respected. A story that is only “I enforced the standard” without teaching is a weak senior signal.",
    starModel: {
      situation:
        "A teammate’s pull request rendered comments from our CMS with a direct HTML injection so authors could paste formatted marketing copy into a product page. The page sits on the same origin as the signed-in app. They were trying to hit a campaign deadline and had marked the review as urgent.",
      task:
        "I needed to block the unsafe render without making them miss the campaign, and without a review thread that sounded like I was questioning their competence.",
      action:
        "I commented on the specific line, described the concrete case (a pasted script or an author account that is not as trusted as we hope), and said I would review again the same day if we switched to the sanitizer the blog already used or to a structured block list. I joined a 20-minute call, restated that the deadline was real, and paired on the sanitizer path. We dropped the two tags the campaign needed that the allow-list ate, and we added them explicitly. I asked them to write the one-line note in the component docs so the next person would not rediscover the shortcut.",
      result:
        "The campaign shipped the next morning on the sanitized renderer. The author told me later the call was what made the comment feel like help. The doc note has been linked from three later reviews.",
      reflection:
        "My first draft of the comment was a link to a policy and a single word, “unsafe.” That would have been correct and useless. The path through the deadline was the actual review.",
    },
  }),
  story({
    id: "beh-received-feedback",
    topic: "beh-receiving-critical-feedback--tell-me-about-a-time",
    level: "mid",
    title: "Receiving feedback that you were hard to collaborate with",
    tags: ["feedback", "collaboration"],
    competencies: ["learning", "collaboration", "communication"],
    prompt:
      "Tell me about a time you received critical feedback that was difficult to hear. What did you do with it?",
    hints: [
      "Do not pick feedback that secretly makes you look perfect.",
      "Show a behavior change someone else could observe, not only a feeling.",
    ],
    approach:
      "Quote the feedback in plain language, your first reaction, the change you made, and how you checked whether it worked.",
    solution:
      "The story lands if a teammate would recognize the new behavior. Defending yourself for most of the answer, or choosing a trivial critique, misses the prompt.",
    interviewerNotes:
      "Mid-level signal is coachability. Staff candidates should also show they changed the surrounding system, but a clean personal change is enough here.",
    starModel: {
      situation:
        "In a retro, a designer said reviews with me felt like a courtroom: I arrived with a list of problems and started talking before anyone finished the demo. A teammate agreed. I had thought I was being efficient.",
      task:
        "I needed to take the feedback without asking them to soften it, and change the way I showed up to critique and to pull requests, because both were slowing the squad.",
      action:
        "I asked for one recent example so I could see it, and they pointed at a review where I had opened with six nits before acknowledging the user flow. I wrote a personal rule: first comment is what works or what I understood, then the blocking issue, and nits go last or not at all. I said the rule out loud in the next retro so it was checkable. For two weeks I asked the designer at the end of critique whether I had jumped. I also stopped reviewing large pull requests in the last hour of the day, which was when I was most abrupt.",
      result:
        "The designer told me critiques were easier to stay in. One teammate started using the same “blocking versus nit” split. I still miss it when I am rushed, and the check at the end of the meeting is what catches me.",
      reflection:
        "I had equated speed with rigor. The feedback was that my speed was costing other people’s thinking time. The observable rule mattered more than agreeing in the moment.",
    },
  }),
  story({
    id: "beh-gave-feedback",
    topic: "beh-giving-critical-feedback--tell-me-about-a-time",
    level: "senior",
    title: "Giving feedback about skipped accessibility work",
    tags: ["feedback", "coaching"],
    competencies: ["coaching", "communication", "accessibility"],
    prompt:
      "Tell me about a time you gave someone difficult feedback. How did you say it, and what happened afterward?",
    hints: [
      "Feedback about the work, with an example, beats feedback about character.",
      "Include their response, including if they disagreed.",
    ],
    approach:
      "Private conversation, specific examples, the impact, a clear ask, and a follow-up that is not a surprise performance review.",
    solution:
      "Show you prepared, you did not vent in a public channel, and you offered to help with the skill. A story where they immediately transformed is less credible than one where the behavior partially changed.",
    interviewerNotes:
      "Senior bar includes care for the person and a standard you are willing to hold. Public shaming, or endless hints with no ask, both fail.",
    starModel: {
      situation:
        "A strong mid-level engineer on my squad was shipping forms quickly and leaving labels, errors, and focus for a follow-up that did not happen. Two of their forms had reached production that way. They were up for a level review and believed quality meant test coverage.",
      task:
        "I needed to tell them the pattern was below the bar we had written down, early enough that they could change it before the review, without ambushing them in a pull request comment.",
      action:
        "I scheduled a one-to-one and opened with the forms by name. I said the tests were real and the missing piece was that a keyboard user could not complete them. I showed one form and the checklist we already had. I asked them to bring the next form to me before review with that checklist filled in, and I offered to pair on the first one. I told them I would mention the gap in the review if it was still the pattern, and that I would also mention the change if it stuck. They were quiet, then said they had treated the checklist as optional polish.",
      result:
        "The next form came with the checklist done, and they asked for a review of the error summary specifically. One later form slipped. I pointed at it privately the same day, and they fixed it before merge. The level review noted both the early gap and the change.",
      reflection:
        "I had been leaving the same comment on each pull request and calling that feedback. It was a hint. The direct conversation, with the review consequence stated calmly, was what made the expectation real.",
    },
  }),
  story({
    id: "beh-build-vs-buy",
    topic: "beh-build-vs-buy-decision--tell-me-about-a-time",
    level: "staff",
    title: "Build versus buy for a rich text editor",
    tags: ["strategy", "platform"],
    competencies: ["systems-thinking", "judgment", "influence"],
    prompt:
      "Tell me about a time you led a build-versus-buy decision that other teams would have to live with.",
    hints: [
      "Name the users of the decision, not only the technical criteria.",
      "Show the option you rejected and why it was tempting.",
    ],
    approach:
      "Constraints, options, a written decision, the adoption plan, and what you learned after a team actually used it. Staff answers include the political or organizational cost.",
    solution:
      "A staff-level story makes the trade explicit: time-to-market, licensing, accessibility, bundle, and the team’s ability to own bugs. The decision record matters more than the tool name.",
    interviewerNotes:
      "Listen for reversibility and for whether other teams were consulted before the choice was announced. A solo spike presented as a platform decision is not staff scope.",
    starModel: {
      situation:
        "Three products needed rich text: support macros, a CMS blurb, and an in-app comment box. One team had started a custom editor. Another wanted to paste in a heavy commercial editor. I was the frontend platform lead. Nobody owned the decision, so each team was about to ship a different content model.",
      task:
        "I needed a single recommendation the product teams could adopt without a six-month rewrite, including a rule for who was allowed to diverge.",
      action:
        "I wrote a one-page note with the jobs: limited marks, mentions, and safe HTML, not a full document suite. I compared a small open library, the commercial editor, and continuing the custom one, on accessibility of the toolbar, bundle on the comment box, license cost, and how hard it was to sanitize output. I asked each product team for their must-have marks before I scored the options. The commercial editor won the demo and lost the comment box on weight and license. The custom editor had no toolbar semantics. We chose the small library, wrapped it in our own component so the dependency sat in one place, and set a rule: a team could diverge only with a written job the wrapper could not do. I staffed office hours for the first migration.",
      result:
        "Two of the three surfaces moved within a quarter. The CMS kept one custom embed block behind the escape hatch, documented. We avoided three sanitizer implementations. A later request for collaborative cursors was rejected against the written jobs list instead of reopening the whole decision.",
      reflection:
        "The useful part was the job list, not the matrix of logos. Once the jobs were narrow, the heavy tool stopped looking like the serious choice and started looking like a different product.",
    },
  }),
];
