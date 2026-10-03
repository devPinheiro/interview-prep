import type { Level, Question } from "@/lib/types";

const refs = [
  { site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" },
];

type Script = NonNullable<Question["scripts"]>[number];

/**
 * Each question replaces exactly one catalog stub, `neg-{theme}--{angle}`.
 * The other angles for that theme stay as stubs.
 */
function play(input: {
  id: string;
  topic: string;
  level: Level;
  title: string;
  tags: string[];
  prompt: string;
  hints: [string, string];
  approach: string;
  solution: string;
  notes: string;
  scripts: Script[];
  fields: string[];
}): Question {
  return {
    id: input.id,
    track: "negotiation",
    level: input.level,
    title: input.title,
    tags: input.tags,
    status: "ready",
    canonicalTopic: input.topic,
    prompt: input.prompt,
    hints: input.hints,
    approach: input.approach,
    solution: input.solution,
    interviewerNotes: input.notes,
    sourceRefs: refs,
    scripts: input.scripts,
    worksheetFields: input.fields,
  };
}

export const negotiationWave2: Question[] = [
  play({
    id: "neg2-early-salary-email",
    topic: "neg-early-salary-question-deflect--email-draft-for",
    level: "mid",
    title: "Emailing back when a recruiter asks for your number",
    tags: ["recruiter", "email"],
    prompt:
      "A recruiter emails: “Before we schedule the next round, what are your salary expectations?” You would rather not answer on a call you have not prepared for. Draft the reply.",
    hints: [
      "Email gives you time to research. Use it.",
      "Ask for the range first. If you must give a number, give a range anchored on the top of what you researched.",
    ],
    approach:
      "Thank them, restate your interest, ask for the budgeted range for the level, and offer a researched range only if they cannot share theirs.",
    solution:
      "The reply has four jobs: stay warm, keep the process moving, avoid naming your current pay, and avoid anchoring below the band.\n\nStart with interest in the role so the message reads as engagement, not evasion. Then ask for the budgeted range for the level. Many companies have one and many jurisdictions now require it to be shared before or at the first conversation, so the question is normal.\n\nIf they come back and say they truly need a number, give a range rather than a point. Build it from your research (levels data, peers, job posts that list bands) and put the bottom of your range at a figure you would be happy to accept, not the lowest you would tolerate. Say the figure is total cash for the level and location, and that you expect to adjust once you see equity, bonus, and scope.\n\nNever write your current salary, never invent another offer, and do not attach the number to a level you have not confirmed. Keep it to five lines. Long emails read as anxious.",
    notes:
      "Email is the lowest-pressure channel. Check that the draft asks a question, gives no current pay, and ends with a next step.",
    scripts: [
      {
        title: "First reply",
        when: "They ask for expectations before any offer",
        say: "Thanks for reaching out, I’m excited about the role and the team. To make sure we’re aligned, could you share the budgeted range for this level? I’m happy to discuss numbers once I understand the scope and the full package. Does Thursday at 2pm work for the next conversation?",
        avoid: "Pasting a single number or your current salary",
      },
      {
        title: "Second reply, if they insist",
        when: "They say they cannot proceed without a figure",
        say: "Understood. Based on what I’m seeing for this level and location, I’m looking at $X to $Y in total cash, depending on equity and bonus structure. I’m flexible on the mix and happy to talk through it once we’ve covered scope.",
        avoid: "A range whose bottom you would not actually accept",
      },
    ],
    fields: ["Market p50 total cash", "Market p75 total cash", "Range bottom you would accept", "Range top", "Confirmed level"],
  }),

  play({
    id: "neg2-current-comp-pressure",
    topic: "neg-current-compensation-disclosure-pressure--script-for",
    level: "mid",
    title: "Refusing to disclose current compensation",
    tags: ["recruiter", "scripts"],
    prompt:
      "A recruiter says the system will not let them proceed without your current salary. What do you say, and what do you know about the rules?",
    hints: [
      "Your past pay is not a measure of this job’s value.",
      "Many jurisdictions restrict asking about pay history. Check yours before the call.",
    ],
    approach:
      "Decline politely, reframe on the role’s band, and offer expectations in place of history. Escalate only if they refuse to proceed.",
    solution:
      "Current pay is an anchor that helps the employer and rarely helps you. It captures where you were hired in a different market, under a different manager, at a different time. Offers built from it tend to be a small raise on a number that was already low.\n\nSay it plainly and kindly: you prefer not to share current compensation, you are happy to talk about what you are targeting for this role, and you would like to hear their range. Most recruiters have heard this before and have a field for it that accepts a placeholder.\n\nKnow the law where you live. A growing number of US states and cities restrict salary-history questions, and EU member states are implementing pay transparency rules that limit them too. If the question is unlawful where the role is based, you can say that you understand they are not permitted to ask. You do not need to make it adversarial. If the recruiter is not allowed to ask, a calm sentence is enough.\n\nNever lie. If asked directly about a figure on a form that might be verified later, decline rather than inflate. A misstatement can be cited as grounds for rescinding an offer.",
    notes:
      "Look for: declines without apology, offers expectation instead of history, never lies, mentions the legal context lightly.",
    scripts: [
      {
        title: "Decline and redirect",
        when: "Recruiter asks for current pay on a call",
        say: "I’d rather not share my current compensation, it reflects a different role and market. I’m targeting $X to $Y in total cash for this level. What range have you been given?",
        avoid: "Rounding your current salary up or down",
      },
      {
        title: "If a form requires it",
        when: "An ATS field is mandatory",
        say: "That field is mandatory in your system. Could you enter ‘prefer not to disclose’ or my target range, and I’ll confirm the range by email?",
        avoid: "Entering a made-up number so the form submits",
      },
    ],
    fields: ["Jurisdiction of the role", "Does it restrict pay history?", "Target total cash", "Fallback phrase you will say aloud"],
  }),

  play({
    id: "neg2-leveling-down-risks",
    topic: "neg-leveling-down-offer--risks-in",
    level: "senior",
    title: "Risks in accepting a level below the one you interviewed for",
    tags: ["level", "risk"],
    prompt:
      "You interviewed for Senior and the recruiter calls with an offer at the level below, with a note that you can be promoted in a year. What are the risks and what do you ask?",
    hints: [
      "Level sets the band, the equity target, and the scope people assume you can own.",
      "‘Promotion in a year’ is a hope unless it is written down with criteria.",
    ],
    approach:
      "Find out why the committee levelled you down, what the gap is, and what changes in pay and scope between levels. Then decide whether to push back on level, price the gap, or walk.",
    solution:
      "A lower level is the most expensive part of an offer because it compounds. The base band, bonus target, equity grant, and refresh target are all tied to level. A year in a lower band can cost more than any sign-on can repair.\n\nFirst, ask for the reason. If feedback in a loop led to it (for example, system design signals fell short), that is information you can address by asking for a re-evaluation, a different loop, or a written plan. If the reason is that they are hiring for a specific headcount, the level is negotiable only by finding a different role.\n\nSecond, ask for specifics: the band at each level, how many people are promoted from that level into the next each cycle, typical time-to-promote, and who decides. A promise from a recruiter is not a promise from a promotion committee.\n\nThird, price the gap. If the lower level is acceptable, bring the cash and equity to the level you would have received, or ask for a written 6- or 12-month level review with criteria. If they refuse all three, treat the lower level as the true offer and compare it with your alternatives on that basis.\n\nAlso consider scope. A lower level can mean you are not invited to design reviews or leadership tracks and the mismatch can be permanent.",
    notes:
      "Strong answer separates why, price, and process. Weak answer accepts the promise of a promotion verbally.",
    scripts: [
      {
        title: "Ask why",
        when: "They tell you the offer is one level lower",
        say: "Thanks for the offer. Could you help me understand what led to the lower level, and what the feedback says about the gap? I want to understand what would move it.",
        avoid: "Reacting emotionally on the first call",
      },
      {
        title: "Price it or review it",
        when: "You would accept if the package reflects the gap",
        say: "If we proceed at this level, I’d like the cash and equity to reflect the senior band, or a written level review in six months with agreed criteria. Is either possible?",
        avoid: "Accepting a verbal promotion promise",
      },
    ],
    fields: ["Offered level", "Interviewed level", "Band at offered level", "Band at target level", "Written review in offer?"],
  }),

  play({
    id: "neg2-leveling-up-script",
    topic: "neg-leveling-up-ask--script-for",
    level: "senior",
    title: "Asking to be considered for a higher level",
    tags: ["level", "scripts"],
    prompt:
      "You believe your scope and loop performance justify a level above the offer. How do you ask without sounding entitled?",
    hints: [
      "Anchor on scope and evidence, not on what you want to earn.",
      "Ask what would be needed to be considered, not for an outcome you cannot control.",
    ],
    approach:
      "Name two or three scope signals that map to the higher level’s expectations, then ask whether a re-evaluation is possible and what input they need from you.",
    solution:
      "Companies have written level rubrics. The argument that works is a mapping: for each expectation at the higher level, show evidence from your career and from your loop. For example, a staff-level rubric might ask for ownership across more than one team, technical direction that outlasts you, and visible influence on roadmap. Bring two examples that show each.\n\nFrame it as a question about process. Ask whether level can be reconsidered, who decides, and what they would need from you. Offer to send a one-page summary of scope, impact, and references. This makes it easy for the recruiter to forward to a hiring committee.\n\nAvoid arguing from salary. ‘I want more money’ gets a counter on the same level. ‘My last role matches the next level’s scope’ opens a level discussion.\n\nPrepare for three outcomes. They agree to re-evaluate (give them what they need quickly). They say the level is fixed but offer more cash or equity within the band (weigh that against the compounding cost of level). Or they refuse. In that case decide whether the role is worth it at the offered level, and do not threaten to leave if you are not ready to.",
    notes:
      "Check for evidence-based framing and a process question. Penalise any ultimatum without an alternative.",
    scripts: [
      {
        title: "Level reconsideration",
        when: "After the offer, before you accept",
        say: "I’m excited about the role. Based on the scope I’ve owned, which maps closely to the next level’s expectations, I’d like to ask whether the committee could reconsider the level. I can send a one-page summary of scope and impact today.",
        avoid: "Linking the level to your current salary",
      },
    ],
    fields: ["Offered level", "Target level", "Rubric items you meet", "Evidence for each", "Referee available"],
  }),

  play({
    id: "neg2-competing-offers-tree",
    topic: "neg-competing-offers-timing--decision-tree",
    level: "senior",
    title: "Decision tree: when to reveal a competing process",
    tags: ["offers", "timing"],
    prompt:
      "You are in three processes at different stages. When do you mention the others, and what changes at each stage?",
    hints: [
      "The right time to disclose is when it changes the other side’s decision.",
      "A process at first-round has less weight than one with a written offer.",
    ],
    approach:
      "Branch on stage: before onsite, after onsite, with offer in hand. At each node decide what to say and what to withhold.",
    solution:
      "Think of competing processes as information. It is worth sharing only when it is true and relevant to the decision.\n\nBefore the onsite: mention timelines, not leverage. If another company has an onsite next week, tell the recruiter so they can speed up scheduling. Do not name numbers or companies unless asked, and do not imply an offer you do not have.\n\nAfter the onsite, before an offer: you can say you are in late stages elsewhere with a decision expected on a date. This tends to accelerate the loop and the offer. Still no numbers.\n\nWith a written offer elsewhere: this is your strongest position. Say you have a written offer, with an expiry date, and that this company is your preference if the package can get close. It is normal to share the total, though not required. Do not share confidential letter text if you promised not to.\n\nIf you are ahead at one company and behind at another, ask the slower one for an expedited process, explain that you must give an answer by a date, and be willing to lose the slower option. Leverage that you are unwilling to use is a bluff.\n\nAfter every conversation, write down exactly what you said so you stay consistent across recruiters.",
    notes:
      "Strong candidates never invent. Look for stage-appropriate disclosure and explicit written notes.",
    scripts: [
      {
        title: "Late stage elsewhere",
        when: "Onsite finished, no offer yet",
        say: "I want to let you know I’m in final rounds elsewhere and expect to decide by the 18th. This team is high on my list. Is there anything we can do to align timelines?",
        avoid: "Implying an offer exists",
      },
    ],
    fields: ["Company A stage", "Company B stage", "Company C stage", "Decision deadline", "What you will share"],
  }),

  play({
    id: "neg2-exploding-offer-script",
    topic: "neg-exploding-offer-deadline--script-for",
    level: "senior",
    title: "Responding to an exploding offer",
    tags: ["offers", "deadline"],
    prompt:
      "You receive an offer that expires in 48 hours, before your other final round. What do you say?",
    hints: [
      "Most deadlines are soft. Ask directly.",
      "Give a reason and a date, not a refusal.",
    ],
    approach:
      "Express interest, state the constraint honestly, ask for a specific extension date, and set a fallback.",
    solution:
      "A short deadline is often a pressure tactic, but it can also reflect a real hiring constraint such as a quarter-end or an approved headcount that expires. The way to tell is to ask.\n\nSay you are interested, say you need a few more days to complete a decision process you already have in progress, and name the date. Ask whether that works. Being specific shows you are decisive. Vague requests for ‘more time’ signal indecision and are easier to refuse.\n\nIf they refuse, you have a real decision. Compare the package against your best alternative at that moment. If you would not take this offer over a possible better one, you may need to accept the risk of losing it. Never sign something you do not want to avoid a risk you can survive.\n\nDo not manufacture a competing offer to extend the deadline. If you have a real process, tell the other company you have an offer with a deadline and ask them to move faster. Companies often can.\n\nGet the extension in writing, including the new date and whether terms stay the same.",
    notes:
      "Check for honesty, a specific date, and a plan if the extension is refused.",
    scripts: [
      {
        title: "Ask for a date",
        when: "Offer expires in under three days",
        say: "Thank you, I’m really excited about this. I’m finishing one more conversation I committed to earlier. Could we extend the deadline to next Wednesday? I can give you a firm answer that day.",
        avoid: "‘I need more time to think’ with no date",
      },
      {
        title: "Ask the other company to speed up",
        when: "You have a written offer and a pending process",
        say: "I have a written offer with a decision date of Friday. Your team is a strong preference. Is there any way to complete the remaining rounds before then?",
        avoid: "Inflating the offer you hold",
      },
    ],
    fields: ["Offer expiry", "Other process stage", "Requested new date", "Would you accept as is?"],
  }),

  play({
    id: "neg2-best-and-final-call",
    topic: "neg-best-and-final-response--recruiter-call",
    level: "senior",
    title: "Recruiter call: ‘this is our best and final offer’",
    tags: ["offers", "recruiter"],
    prompt:
      "After your counter, the recruiter says this is the best and final. How do you test it and decide?",
    hints: [
      "Best and final is a negotiating phrase, not always a fact.",
      "You can still ask about the parts that are cheap for them.",
    ],
    approach:
      "Acknowledge it, ask what is fixed and what is flexible, and move to non-base items before deciding.",
    solution:
      "When someone says ‘final’, the base and level may well be fixed. Other levers often are not: sign-on, start date, equity refresh details, a review date, remote cadence, or learning budget. Ask which categories are flexible instead of repeating your last ask.\n\nUseful questions: Is the equity number fixed, or only the cash? Is there room on sign-on? Can we agree a compensation review at six months? What would it take to move the level?\n\nIf they say nothing is flexible, thank them and ask for the offer in writing with a decision date. Then decide using your walk-away number. The decision should rest on the offer against your best alternative, not on whether you ‘won’ the negotiation.\n\nIf it is below your walk-away, say so politely and without drama: you appreciate the effort and cannot accept at this number. They may come back. If they do not, you lose nothing you would have wanted.\n\nIf it is above, accept warmly. Accepting well matters because your manager hears how the offer ended.",
    notes:
      "Assess whether the candidate explores other levers and knows their walk-away before the call.",
    scripts: [
      {
        title: "Which parts are flexible?",
        when: "They say best and final",
        say: "I appreciate that. Could you help me understand which parts are fixed? If base is fixed, is there any room on sign-on, equity, or a six-month compensation review?",
        avoid: "Repeating the same number louder",
      },
      {
        title: "Closing",
        when: "Offer meets your walk-away",
        say: "Thank you for working on this. I’m happy to accept at this package. Could you send the final letter so I can sign by Friday?",
        avoid: "Re-opening terms after agreeing",
      },
    ],
    fields: ["Walk-away total cash", "Fixed items they named", "Flexible items", "Decision date"],
  }),

  play({
    id: "neg2-sign-on-risks",
    topic: "neg-sign-on-bonus-ask--risks-in",
    level: "mid",
    title: "Risks and fine print in a sign-on bonus",
    tags: ["offers", "risk"],
    prompt:
      "They offer a $30k sign-on. What do you check before treating it as part of your compensation?",
    hints: [
      "Ask what happens if you leave inside the first year.",
      "Net is not gross.",
    ],
    approach:
      "Read the clawback, the tax treatment, the payment timing, and whether it replaces something recurring.",
    solution:
      "A sign-on is real money with strings. Check four things.\n\nClawback: how long must you stay, and is the repayment pro-rated? Is it the gross amount or the after-tax amount? A full gross repayment for a one-year cliff is a bad deal if you might be laid off or the role changes.\n\nTax: in the US, bonuses are often withheld at a flat supplemental rate, so the amount on your first payslip can look much smaller than the headline. Ask about relocation-style gross-ups if relevant. In other countries, check any special treatment. Treat the number you can spend as net.\n\nTiming: is it paid in your first paycheque, after 30 days, or after a probation period? Delays matter if you are forfeiting a bonus that pays earlier.\n\nSubstitution: ask whether a sign-on is being offered instead of a higher base or a larger equity grant. A sign-on is one-off while base and equity recur. Compare the four-year totals, not year one.\n\nLastly, make sure the terms are in the offer letter and not only in an email from the recruiter.",
    notes:
      "Look for explicit mention of clawback gross vs net, tax drag, and recurring vs one-time comparison.",
    scripts: [
      {
        title: "Clarify clawback",
        when: "Sign-on appears in the offer",
        say: "Thanks, that helps. Could you confirm the repayment terms: how long is the commitment, is it pro-rated, and is repayment gross or net of tax?",
        avoid: "Assuming terms match last company’s",
      },
    ],
    fields: ["Gross sign-on", "Estimated net", "Clawback months", "Pro-rated?", "Replaces what recurring item?"],
  }),

  play({
    id: "neg2-equity-refresh-worksheet",
    topic: "neg-equity-refresh-clarification--worksheet",
    level: "senior",
    title: "Worksheet: four-year equity value with and without refreshers",
    tags: ["equity", "worksheet"],
    prompt:
      "Two offers have different grant sizes and different refresh practices. How do you compare them on one page?",
    hints: [
      "Convert each grant to an annual value over the vest period.",
      "Add refreshers only at the level the company can describe.",
    ],
    approach:
      "Build a four-year table per offer: base, bonus, annualised initial grant, expected refresh, and total. Mark each line as contractual, target, or guess.",
    solution:
      "Start by annualising. A $400k RSU grant vesting over four years is $100k a year at the grant price. Compare it to a $300k grant plus an $80k annual refresh target that starts in year two, and the totals look closer than the headline.\n\nLabel every number with its certainty. Base and the initial grant are contractual. Bonus is a target and typically pays out at a percentage. Refreshes are a target at best and discretionary at worst. Use zero for any refresh the company cannot describe.\n\nFor private companies, treat equity as a risky claim: apply a discount to reflect liquidity and dilution, and look at the strike price or the grant price assumption. For public companies, check the vest cadence (quarterly versus annual after a cliff) and whether the grant is denominated in dollars or shares. A fixed share count rises and falls with the stock. A dollar-denominated grant is converted at a date you should confirm.\n\nFill the worksheet for each offer, then compute the year-four cash-equivalent. Decide using that figure and your risk tolerance, not the first-year headline.",
    notes:
      "Good answers distinguish contractual from target numbers and treat private equity with a discount.",
    scripts: [
      {
        title: "Ask for the data",
        when: "You want inputs for the worksheet",
        say: "To compare accurately, could you share the vest schedule, whether the grant is in shares or dollars, and the typical annual refresh target for this level?",
        avoid: "Assuming a target refresh is guaranteed",
      },
    ],
    fields: ["Initial grant value", "Vest cadence", "Annualised grant", "Refresh target", "Refresh certainty (0-100%)", "Year-4 total"],
  }),

  play({
    id: "neg2-rsu-vs-options-practice",
    topic: "neg-rsus-vs-options-education--practice-aloud",
    level: "senior",
    title: "Practice aloud: explain RSUs vs options in 60 seconds",
    tags: ["equity", "practice"],
    prompt:
      "A friend asks, ‘one offer has RSUs, the other has options. What is the difference?’ Say your answer aloud in a minute.",
    hints: [
      "RSUs are shares you receive. Options are a right to buy shares at a fixed price.",
      "Mention tax timing and the cost to exercise.",
    ],
    approach:
      "Two sentences on what each is, two on tax and cash, one on how to compare.",
    solution:
      "RSUs are a promise of shares delivered as they vest. When they vest, they are taxed as income at the market value, and you keep the rest as shares. You pay no purchase price. At public companies this is the standard form.\n\nStock options give you the right to buy shares at the strike price. You only profit if the share price rises above the strike. To use them you must pay the strike price in cash, and depending on the type and country you may owe tax at exercise or at sale. In the US, ISOs can receive special tax treatment but can trigger the alternative minimum tax at exercise. NSOs are taxed on the spread at exercise.\n\nPrivate companies often grant options because the shares are cheap to buy and the tax can be deferred. Late-stage companies often grant RSUs with a liquidity-event condition.\n\nTo compare, turn each into the value you keep after cost and tax in a few scenarios. RSUs are worth less in a bad year but always worth something. Options can be worth nothing, and they can also cost money to hold.\n\nPractice until you can say it without hedging. Note: this is general information, not tax advice, and rules vary by country.",
    notes:
      "Listen for: no purchase price for RSUs, strike price and exercise cost for options, tax timing, and an honest disclaimer.",
    scripts: [
      {
        title: "Sixty-second version",
        when: "Practise aloud, then record yourself",
        say: "RSUs are shares you receive as they vest, no purchase price, taxed as income when they vest. Options are the right to buy at a fixed strike, so you pay to exercise and only profit above the strike. I compare them by what I’d keep after cost and tax in a bad, normal, and good scenario.",
        avoid: "Calling either one ‘free money’",
      },
    ],
    fields: ["Grant type", "Strike price (if options)", "Vest schedule", "Exercise window after leaving", "Scenario value: bad / base / good"],
  }),

  play({
    id: "neg2-strike-price-script",
    topic: "neg-strike-price-questions--script-for",
    level: "senior",
    title: "Questions to ask about strike price and option terms",
    tags: ["equity", "scripts"],
    prompt:
      "A startup offers 40,000 options. What questions get you the facts needed to value them?",
    hints: [
      "A number of options means little without the share count and preference stack.",
      "Ask about the exercise window after you leave.",
    ],
    approach:
      "Ask for strike price, fully diluted share count, last preferred price, the most recent 409A or equivalent, option type, vesting, exercise window, and early exercise.",
    solution:
      "A grant of 40,000 options is meaningless alone. Ask for these pieces.\n\nStrike price and the most recent 409A valuation. The strike is set from the common-stock value, which is usually much lower than the price investors paid for preferred shares. Ask what the last preferred round price was so you can see how the common is valued.\n\nFully diluted shares outstanding. This lets you convert your options into a percentage ownership. Companies often share this number, although some will not. Know that a percentage ignores later dilution.\n\nOption type: ISO or NSO, and, in the US, whether early exercise with an 83(b) election is allowed.\n\nExercise window after leaving. The default of 90 days can force you to either pay a large sum quickly or lose the options. Some companies offer extended windows of several years. This single term can be worth more than a bump in grant size.\n\nVesting and acceleration. Ask about the cliff, the schedule, and any acceleration on acquisition.\n\nAlso ask what has happened in recent funding and the last time the company did a secondary sale. If you will need to pay tax or exercise costs, run the numbers before agreeing. For tax questions consult a professional in your country.",
    notes:
      "Strong answers mention 409A, fully diluted shares, option type, and post-termination exercise window.",
    scripts: [
      {
        title: "Equity fact-finding",
        when: "You see an options grant in the offer",
        say: "Could you share the strike price, the current fully diluted share count, the last preferred round price, and the post-termination exercise window? I’d like to value the grant properly.",
        avoid: "Treating the grant count as the value",
      },
      {
        title: "Ask for a longer window",
        when: "The default is 90 days",
        say: "Would the company consider an extended exercise window, say five years, for employees who stay a minimum period? That would meaningfully change how I value the grant.",
        avoid: "Demanding it without a reason",
      },
    ],
    fields: ["Options granted", "Strike price", "Fully diluted shares", "Ownership %", "Exercise window", "Option type"],
  }),

  play({
    id: "neg2-401k-email",
    topic: "neg-401k-match-negotiation--email-draft-for",
    level: "mid",
    title: "Email: asking about the retirement match and vesting",
    tags: ["benefits", "email"],
    prompt:
      "The offer mentions a 401(k) but not the match or vesting terms. Write the email that gets the details.",
    hints: [
      "Match formulas are usually fixed company-wide. Ask for clarity first, negotiation second.",
      "Vesting and true-up rules change the real value.",
    ],
    approach:
      "Ask for the formula, vesting schedule, and whether a true-up exists. If the match is weak, trade it against another lever.",
    solution:
      "Benefits are less negotiable than cash, because they are written into plan documents. That makes the email a fact-finding exercise first.\n\nAsk for the match formula (for example 50% of the first 6% of pay), the annual cap, the vesting schedule (immediate, or over several years), and whether there is a true-up for people who hit the contribution limit early in the year. A front-loaded saver can miss part of the match without a true-up.\n\nEstimate the value in dollars. A 4% match on $180,000 is $7,200 a year, which is comparable to a modest sign-on. If the plan is weaker than your current employer’s, treat the difference as a pay cut and compare it with the other levers.\n\nIf you want to negotiate, do it on cash, where flexibility exists: ask for a base increase or a sign-on that offsets the gap. Do not ask a recruiter to change the plan formula, since they usually cannot.\n\nIn other countries the equivalent is a pension contribution. The same questions apply: employer percentage, vesting, and whether the contribution is salary-sacrifice.",
    notes:
      "Check that the candidate prices the benefit and redirects to cash rather than demanding a plan change.",
    scripts: [
      {
        title: "Fact-finding email",
        when: "Offer lacks retirement details",
        say: "Thanks for the offer. Could you confirm the retirement plan details: the employer match formula and annual cap, the vesting schedule, and whether there is a true-up at year end? I’m comparing benefits and want to make sure I have the numbers right.",
        avoid: "Asking them to rewrite the plan",
      },
    ],
    fields: ["Match formula", "Annual cap in $", "Vesting schedule", "True-up?", "Gap vs current employer"],
  }),

  play({
    id: "neg2-pto-call",
    topic: "neg-pto-buy-flexibility--recruiter-call",
    level: "mid",
    title: "Recruiter call: more PTO or a flexible schedule",
    tags: ["benefits", "recruiter"],
    prompt:
      "Cash is fixed. You value time off. How do you ask for more days or flexibility?",
    hints: [
      "Unlimited PTO has no number to negotiate. Ask how much is actually taken.",
      "Extra days are cheap for a company in cash terms.",
    ],
    approach:
      "Ask how PTO works in practice, request a specific number of extra days or a flexible arrangement, and get it in the letter.",
    solution:
      "Time off is often the cheapest thing for a company to give and the most valuable for you. Be concrete.\n\nIf the policy is a fixed allotment, ask for a specific number of extra days, say five. State your reason briefly: you have a standing commitment, you are used to a certain amount, or you would trade some cash for time.\n\nIf the policy is unlimited, ask the hiring manager how much time the team typically takes and whether there is a minimum. Unlimited can mean fewer days in practice. If you want a floor, ask for it in writing as a minimum leave guarantee, or negotiate a fixed number in the letter.\n\nAlso ask about adjacent flexibility: a four-day week, a sabbatical after a number of years, summer hours, or the right to work from another country for a month. These often exist in policy and need only a formal exception.\n\nPut the agreement in the offer letter. A manager’s verbal yes is not durable across reorgs. Confirm the start date for accrual and whether unused days roll over or pay out.",
    notes:
      "Assess whether the candidate names a number, checks the real practice, and writes it into the letter.",
    scripts: [
      {
        title: "Ask for days",
        when: "Cash is fixed and PTO is capped",
        say: "I understand cash is at the top of the band. I’d value five additional days of PTO a year, which would help me accept. Is that something we can include in the letter?",
        avoid: "Accepting a verbal promise",
      },
    ],
    fields: ["Standard PTO days", "Requested extra days", "Rollover policy", "Written in letter?"],
  }),

  play({
    id: "neg2-remote-stipend-script",
    topic: "neg-remote-work-stipend--script-for",
    level: "mid",
    title: "Asking for a remote-work stipend",
    tags: ["non-cash", "scripts"],
    prompt:
      "You will work from home full time. What do you ask for beyond a laptop?",
    hints: [
      "Break the ask into monthly and one-time costs.",
      "Check whether it is paid as taxable income or reimbursed.",
    ],
    approach:
      "Name the categories (internet, desk, coworking), give a monthly figure, and ask how it is paid.",
    solution:
      "Remote work shifts costs to the employee. A stipend is a fair request and often exists in policy even when the offer is silent.\n\nDecide the categories: home internet, phone, a coworking day pass if your home is not suitable, and a one-time furniture budget. Look at your real costs and ask for a monthly figure that covers them. If the company has a standard amount, ask whether it applies to you and whether it can be higher.\n\nAsk how it is delivered. A flat monthly allowance is usually taxable income. A reimbursed expense is usually not, though it needs receipts. Reimbursement is often better after tax for equal headline amounts.\n\nConfirm whether equipment such as a monitor and chair is owned by the company or by you, and what happens to it if you leave.\n\nKeep the ask proportionate. A request of $100 to $200 a month with a one-time $1,500 desk budget reads as reasonable in many markets. Frame it as making you productive from day one, not as a favour.",
    notes:
      "Candidate should separate recurring from one-time and ask about tax and ownership.",
    scripts: [
      {
        title: "Stipend ask",
        when: "Full-time remote role",
        say: "Since I’ll be fully remote, could we include a monthly home-office allowance of $150 and a one-time $1,500 setup budget? I’d also like to confirm whether it’s reimbursed or paid as part of salary.",
        avoid: "Asking only after you have signed",
      },
    ],
    fields: ["Monthly internet and phone", "Coworking costs", "One-time setup", "Paid or reimbursed?", "Who owns equipment"],
  }),

  play({
    id: "neg2-home-office-worksheet",
    topic: "neg-home-office-budget--worksheet",
    level: "beginner",
    title: "Worksheet: pricing your home-office setup",
    tags: ["non-cash", "worksheet"],
    prompt:
      "Before you ask for a setup budget, what do you list and how do you present it?",
    hints: [
      "A clear list beats a round number.",
      "Prefer items the company can buy for you.",
    ],
    approach:
      "List every item with a price, mark must-have versus nice-to-have, and ask for the must-have total.",
    solution:
      "Concrete asks get concrete answers. Build the list before the conversation.\n\nMust-haves: a chair that supports eight hours, a desk or a stand, a monitor, and a reliable webcam and microphone if the role is meeting-heavy. Nice-to-haves: a second monitor, a standing option, a dock, or a noise-cancelling headset.\n\nAsk the company to buy equipment directly where possible. This avoids tax questions and ensures the company owns the assets. If they prefer a budget, ask for the must-have total and keep the nice-to-haves as a stretch.\n\nAsk when the budget is available. Having it in your first week matters more than a bigger number in month three.\n\nAlso check whether ergonomic assessments are available. Some companies offer them, and they unlock specific items without needing a negotiation.\n\nPresent the list as one short paragraph or a short table. A manager can approve a figure easily and a long wish list gets a ‘let me check’.",
    notes:
      "Prefer candidates who itemise and prioritise instead of asking for a round number.",
    scripts: [
      {
        title: "Itemised ask",
        when: "Before your start date",
        say: "I’ve put together a short list: chair, desk, monitor, and headset, about $1,800 in total. Could the company purchase these, or provide a setup budget of that amount in my first week?",
        avoid: "A vague ‘some budget’",
      },
    ],
    fields: ["Chair", "Desk", "Monitor", "Audio/video", "Must-have total", "Nice-to-have total"],
  }),

  play({
    id: "neg2-learning-budget-script",
    topic: "neg-learning-budget--script-for",
    level: "mid",
    title: "Asking for a learning and development budget",
    tags: ["non-cash", "scripts"],
    prompt:
      "The offer does not mention training. How do you ask for a learning budget and make it stick?",
    hints: [
      "Ask what exists first. Many companies have a policy no one mentions.",
      "Tie the ask to the work, not to personal interest.",
    ],
    approach:
      "Ask about the existing budget, request a figure and protected time, and connect it to team goals.",
    solution:
      "A budget is only useful with permission to use it. Ask about both.\n\nFirst ask what the company offers: an annual amount, an approval process, and whether time is protected. If the policy is generous, there is nothing to negotiate and you can move on.\n\nIf not, request a specific amount, such as $2,000 a year, plus a few days of protected learning time. Link it to the role: a course on the framework the team is migrating to, a certification the customer requires, or a conference where the team recruits.\n\nAsk about conditions. Some companies require you to stay for a period after spending, with repayment on departure. This is similar to a clawback and should be stated.\n\nGet the amount and the time in writing. A learning budget that exists only in a conversation tends to vanish at the first budget cut.\n\nFinally, plan to use it. Unused budgets signal that it is not needed, and your manager will remember.",
    notes:
      "Look for connection to job outcomes and awareness of repayment terms.",
    scripts: [
      {
        title: "Learning budget",
        when: "Offer is silent on training",
        say: "Could you tell me what the company offers for learning and development? If there isn’t a standard budget, I’d like to propose $2,000 a year and four protected days, which I’d use on courses directly tied to the team’s roadmap.",
        avoid: "Framing it as a perk instead of a work tool",
      },
    ],
    fields: ["Existing budget", "Requested amount", "Protected days", "Repayment terms", "Written?"],
  }),

  play({
    id: "neg2-conference-risks",
    topic: "neg-conference-budget--risks-in",
    level: "mid",
    title: "Risks in relying on a conference budget",
    tags: ["non-cash", "risk"],
    prompt:
      "You were promised conference travel. What can go wrong, and how do you protect it?",
    hints: [
      "Budgets are the first thing cut.",
      "Attendance and speaking often need separate approval.",
    ],
    approach:
      "Clarify what is covered, who approves, how it is paid, and what is the policy for speaking and for time off.",
    solution:
      "Promises about conferences are fragile because the budget belongs to a manager’s cost centre. Plan for four failure modes.\n\nBudget cuts: a team budget can disappear in a bad quarter. Ask whether there is a company-wide policy or only a team-level one. A policy is more durable.\n\nScope: does the budget cover the ticket only, or flights, hotel, and meals? Does it cover international events? Many people are surprised when the ticket is approved and the hotel is not.\n\nApproval: who signs, how long does it take, and does it need to be before early-bird pricing ends? Slow approvals can double the cost.\n\nSpeaking: if you plan to present, ask whether your talk requires legal or comms review, whether you can use work examples, and whether you keep any speaker fee or travel reimbursement from the organiser.\n\nAlso ask whether conference days count as working days or PTO. Put the key terms in the offer letter or an email from the hiring manager that HR has seen. If you are leaving for this benefit, ask for a minimum commitment, for example one conference per year.",
    notes:
      "Check awareness of fragility and specific clarifying questions about scope and approval.",
    scripts: [
      {
        title: "Pin it down",
        when: "Manager mentioned conferences",
        say: "I’d like to confirm how this works. Is there a company-wide budget or just a team one? Does it cover travel and lodging? And who approves requests? I’d like to plan for one conference a year.",
        avoid: "Treating a casual comment as a commitment",
      },
    ],
    fields: ["Budget source", "What is covered", "Approver", "Speaking policy", "Conference days count as work?"],
  }),

  play({
    id: "neg2-visa-risks",
    topic: "neg-visa-sponsorship-clarity--risks-in",
    level: "senior",
    title: "Risks and questions on visa sponsorship",
    tags: ["visa", "risk"],
    prompt:
      "You need sponsorship to work. What do you ask before accepting, and what can go wrong?",
    hints: [
      "Ask what the company has done before, not only what it says it will do.",
      "Timeline and cost ownership matter more than the headline promise.",
    ],
    approach:
      "Verify the type of sponsorship, who pays, the timeline, the fallback plan, and what the offer is contingent on.",
    solution:
      "Sponsorship is not one thing. Be specific about your situation and ask for precise answers. Note: this is general information. Consult an immigration attorney for your case, as rules change often.\n\nWhat route? In the US, common routes include H-1B (capped and lottery-based unless the employer is cap-exempt), a transfer if you are already on H-1B, O-1, TN for some nationalities, L-1 for intra-company moves, and OPT or STEM OPT for recent graduates. Policy changes in recent years have added fees and constraints for some petitions, so ask what the company knows about current rules. Other countries have their own regimes, such as the UK’s Skilled Worker route (requires a licensed sponsor) or Ireland’s Critical Skills permit.\n\nWho pays? Ask which fees and attorney costs the company covers, including for dependants and renewals, and whether any are repayable if you leave.\n\nTimeline and fallback: if the application fails or is delayed, can you start remotely from another country? Is the offer rescinded or delayed? Is your start date flexible?\n\nTrack record: how many people have they sponsored, and do they have an immigration firm on retainer?\n\nGreen card: ask when sponsorship starts and whether there is a service requirement before it begins.\n\nPut the commitments in writing. Do not resign until the work authorisation is in place or your fallback is agreed.",
    notes:
      "Assess specificity about route, cost ownership, fallback, and the advice to consult counsel.",
    scripts: [
      {
        title: "Sponsorship questions",
        when: "Before accepting",
        say: "To plan properly, could you tell me which visa route you would use, who covers legal fees including for my spouse, what the timeline looks like, and what happens if the filing is delayed or unsuccessful?",
        avoid: "Accepting ‘we sponsor’ without specifics",
      },
    ],
    fields: ["Visa route", "Employer pays what", "Expected timeline", "Fallback if delayed", "Green card start"],
  }),

  play({
    id: "neg2-relocation-worksheet",
    topic: "neg-relocation-package--worksheet",
    level: "mid",
    title: "Worksheet: building a relocation package ask",
    tags: ["relocation", "worksheet"],
    prompt:
      "You are moving cities for the job. How do you price the move and decide between lump-sum and managed relocation?",
    hints: [
      "List real costs, not a guess.",
      "A lump sum is taxed. A managed move often is not, depending on country.",
    ],
    approach:
      "List one-time costs, temporary housing, and ongoing differences. Compare lump sum, managed, and reimbursement.",
    solution:
      "A relocation ask works best with a bottom-up estimate.\n\nOne-time costs: movers or shipping, flights, deposits, a car shipping or sale, and overlap rent. Temporary costs: one to three months of furnished housing while you search. Soft costs: house hunting trip, spouse’s job search support, school fees.\n\nThen choose a form. A managed relocation means the company contracts movers and housing directly, which is simpler and often more tax-efficient. A lump sum gives you flexibility to spend as needed, but it is usually taxed as income, so ask whether it is grossed up. Reimbursement against receipts sits between the two.\n\nAsk about clawback: repayment if you leave in the first year is common. Make sure it is pro-rated and based on the net amount.\n\nIf the company has a policy tier, ask which tier applies to you. A senior hire may qualify for a higher tier than the default.\n\nTotal the costs, add 15 percent buffer, and ask for the number. Present it with the list so the recruiter can approve it without escalation.",
    notes:
      "Check bottom-up costing and awareness of tax and clawback differences between lump sum and managed.",
    scripts: [
      {
        title: "Relocation ask",
        when: "Offer includes a flat amount that is too low",
        say: "I’ve estimated the total move at about $18,000 including shipping, temporary housing, and flights. Could we cover that, either as a managed relocation or as a grossed-up lump sum?",
        avoid: "Asking for a round number without a breakdown",
      },
    ],
    fields: ["Shipping", "Flights", "Temporary housing", "Deposits", "Total plus buffer", "Gross-up?", "Clawback terms"],
  }),

  play({
    id: "neg2-start-date-script",
    topic: "neg-start-date-flexibility--script-for",
    level: "mid",
    title: "Negotiating your start date",
    tags: ["offers", "scripts"],
    prompt:
      "You need a later start than the recruiter proposes. What are your reasons, and how do you ask?",
    hints: [
      "Check notice period, bonus date, and vesting date before you propose.",
      "Offer a specific date and a reason.",
    ],
    approach:
      "Check your constraints, propose a date, and explain the benefit of a clean exit.",
    solution:
      "Start date interacts with money, so check the calendar before you ask.\n\nCommon constraints: a contractual notice period (often one to three months in Europe, two weeks in the US), an annual bonus paid on a date after which you can leave without losing it, equity that vests on a particular day, and a gap before health benefits begin at the new employer.\n\nPropose a date, not a range. ‘I can start on the 15th of January’ is easier for a recruiter to take to a hiring manager than ‘as late as possible’. Give a reason that shows professionalism: you are completing a handover and want to leave on good terms.\n\nIf the new employer wants an earlier start, ask whether they will compensate for money you forfeit, such as a bonus or an unvested tranche. This is a legitimate use for a sign-on.\n\nThink about the reverse too. If you need a gap for a break or a move, say so early. Most employers accept a few weeks.\n\nConfirm the date in the offer letter, and confirm when benefits start. If there is a waiting period, ask if they can cover the gap or start benefits on day one.",
    notes:
      "Check awareness of notice, bonus, and vesting dates, and the use of sign-on to bridge the gap.",
    scripts: [
      {
        title: "Propose a date",
        when: "They suggest a start in four weeks",
        say: "I’d love to join. I have a six-week notice period and a handover I want to complete properly. Could we set the start date for the 15th of January?",
        avoid: "‘As late as possible’",
      },
      {
        title: "Bridge forfeited money",
        when: "Earlier start would cost a bonus",
        say: "If an earlier start is important, I’d be forfeiting a bonus that pays on March 1. Could we cover that with a sign-on?",
        avoid: "Hiding the reason and then refusing",
      },
    ],
    fields: ["Notice period", "Bonus pay date", "Next vest date", "Proposed start", "Benefits start"],
  }),

  play({
    id: "neg2-title-level-call",
    topic: "neg-title-vs-level-mismatch--recruiter-call",
    level: "senior",
    title: "Recruiter call: the title says Senior but the level is lower",
    tags: ["level", "recruiter"],
    prompt:
      "The offer title is ‘Senior Engineer’, but you learn the internal level is the middle one. What do you ask?",
    hints: [
      "Pay and equity follow the internal level, not the title.",
      "Titles matter for your next job, levels for your pay.",
    ],
    approach:
      "Ask the internal level, its band, and how the company maps title to level. Then decide what to prioritise.",
    solution:
      "Companies use different systems. Some give a title that matches the market and an internal level that is lower. Others do the reverse. Both can be legitimate, but you need to understand which you are being offered.\n\nAsk for the internal level and the band for it. Ask how title maps to level, who in the company has the same title, and what the promotion path looks like. Compare the band to market data for the level you believe you operate at.\n\nThen decide what you care about. A senior title helps with future job searches. A senior level means a senior pay band and equity. If you can only have one, take the level in most cases, because pay compounds and titles can be negotiated later or described on a resume with a short note.\n\nIf the title is more senior than the level, ask whether the company’s external title can change. Some companies allow it for hiring or sales reasons.\n\nIf the level is the one you want but the title is lower, ask for a title that matches. Costs nothing, and it is frequently flexible.\n\nWrite the final title and level in the offer letter or have the recruiter confirm in an email.",
    notes:
      "Look for the distinction between title and level and a prioritisation of pay over label.",
    scripts: [
      {
        title: "Ask for the mapping",
        when: "Title and level seem different",
        say: "Could you help me understand how the title maps to your internal levels? What is my level and what is the band? I’d like to compare against the scope we discussed.",
        avoid: "Assuming title equals level",
      },
    ],
    fields: ["Offer title", "Internal level", "Band", "Level you operate at", "Title in letter?"],
  }),

  play({
    id: "neg2-verbal-offer-script",
    topic: "neg-manager-soft-verbal-offer--script-for",
    level: "mid",
    title: "When a manager gives a soft verbal offer",
    tags: ["offers", "scripts"],
    prompt:
      "After the final round, the hiring manager says: ‘We’d love to have you, expect something soon.’ What do you do in the meantime?",
    hints: [
      "A verbal yes is not an offer.",
      "Do not resign or turn down other processes yet.",
    ],
    approach:
      "Respond warmly, ask about the timeline and process, and keep other conversations moving until you have a signed letter.",
    solution:
      "Enthusiasm from a hiring manager is a good sign and also not a contract. Offers usually need compensation approval, a headcount check, references or a background check, and sometimes executive sign-off. Any of those can change the number or delay the letter.\n\nReply with thanks and ask what the remaining steps are and when you can expect the written offer. Ask specifically whether any approvals remain. Do not ask for a number yet and do not give one. Wait for the letter.\n\nKeep other processes alive. Tell recruiters elsewhere that you are in late stages and ask about their timeline. If you drop other options because of a friendly comment, you lose leverage and, in the worst case, your alternatives.\n\nDo not resign until you have a signed offer and any contingencies, such as a background check or visa, are cleared. Check whether the offer is conditional on references, and ensure you have the terms on paper.\n\nIf a week passes with no letter, send a short check-in to the recruiter, not the manager. Recruiters own the process.\n\nWhen the written offer arrives, read it against what you were told verbally and ask for any difference to be fixed before signing.",
    notes:
      "Strong answers do not resign, keep options open, and compare the letter to verbal promises.",
    scripts: [
      {
        title: "Warm reply",
        when: "Manager says offer is coming",
        say: "Thank you, I’m really excited about the team. Could you tell me what the next steps are on your side and when I can expect the written offer?",
        avoid: "Giving notice before the letter is signed",
      },
      {
        title: "Check-in",
        when: "A week has passed",
        say: "Hi, I wanted to check in on the timeline for the written offer. I have another decision date on the 20th and would like to make the best decision with the full picture.",
        avoid: "Pestering the manager directly",
      },
    ],
    fields: ["What manager said", "Approvals remaining", "Expected letter date", "Other decision dates"],
  }),
];
