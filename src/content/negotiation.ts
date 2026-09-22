import type { Question } from "@/lib/types";

export const negotiationQuestions: Question[] = [
  {
    id: "neg-salary-question",
    track: "negotiation",
    level: "mid",
    title: "Deflecting the early salary question",
    tags: ["recruiter", "scripts"],
    status: "ready",
    canonicalTopic: "salary-question",
    prompt:
      "A recruiter asks for your current compensation and desired salary before you have an offer. How do you respond?",
    hints: [
      "Avoid anchoring yourself low.",
      "Ask for their range; emphasize fit first.",
    ],
    approach:
      "Goal: stay in process without locking a number.\nTactics: redirect to range, total rewards, and mutual fit.\nNever lie about competing offers.",
    solution:
      "Prefer: ask for the budgeted range for the level, say you are focused on role fit, and that you expect a competitive offer for the band.\nIf pressed, give a researched range for the level/location — not your current pay.",
    interviewerNotes:
      "This is self-prep, not an interview round — practice out loud until it feels natural.",
    sourceRefs: [
      { site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" },
    ],
    scripts: [
      {
        title: "Range redirect",
        when: "Recruiter asks desired salary early",
        say: "I’m most focused on finding the right role and level. Happy to talk numbers once we both see fit — could you share the range budgeted for this level?",
        avoid: "Naming your current salary first",
      },
      {
        title: "If they insist",
        when: "They say they need a number to continue",
        say: "Based on market data for this level in this location, I’m targeting something in the X–Y total cash range, depending on equity and bonus structure.",
        avoid: "Inventing competing offers",
      },
    ],
    worksheetFields: [
      "Market p50 base",
      "Market p75 base",
      "Your walk-away total cash",
      "Target total cash",
      "Equity expectations",
      "Notes on level (L4/L5/etc.)",
    ],
  },
  {
    id: "neg-counter-offer",
    track: "negotiation",
    level: "senior",
    title: "Writing a strong counteroffer",
    tags: ["offer", "counter"],
    status: "ready",
    canonicalTopic: "counteroffer",
    prompt:
      "You received a written offer. Walk through how you evaluate total compensation and craft a single clear counter.",
    hints: [
      "Separate base, bonus, equity, sign-on, PTO.",
      "One coherent ask with rationale.",
    ],
    approach:
      "Compute expected value of equity.\nDecide walk-away vs stretch.\nCounter once with specifics; keep recruiter as ally.",
    solution:
      "Email structure: gratitude → enthusiasm → researched ask (base/equity/sign-on) → flexibility → clear next step.\nKeep hiring manager relationship warm; money talk primarily with recruiter.",
    interviewerNotes: "Practice with your real numbers in the worksheet (local only).",
    sourceRefs: [
      { site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" },
      { site: "hbs", url: "https://online.hbs.edu/blog/post/salary-negotiation-tips" },
    ],
    scripts: [
      {
        title: "Counter email core",
        when: "After written offer, within 24–48h",
        say: "I’m excited about the team and the mission. Based on market data for this level and the scope we discussed, I’d like to explore base closer to $X and equity of Y shares/units. Happy to be flexible across the package if we can land near that total.",
        avoid: "Abrasive ultimatums on first counter",
      },
      {
        title: "Best and final",
        when: "They say best and final",
        say: "Thank you for stretching on this. I’ll review the full package tonight and confirm tomorrow morning.",
        avoid: "Immediately accepting under pressure without a pause",
      },
    ],
    worksheetFields: [
      "Offer base",
      "Offer bonus %",
      "Offer equity (units + strike/FMV notes)",
      "Sign-on",
      "Your counter base",
      "Your counter equity",
      "Walk-away line",
      "Non-cash must-haves",
    ],
  },
  {
    id: "neg-leveling",
    track: "negotiation",
    level: "staff",
    title: "Negotiating level, not just cash",
    tags: ["leveling", "staff"],
    status: "ready",
    canonicalTopic: "level-negotiation",
    prompt:
      "The offer is strong financially but one level below what you believe is fair. How do you negotiate?",
    hints: [
      "Level affects trajectory more than a small base bump.",
      "Bring evidence: scope, artifacts, peer comps.",
    ],
    approach:
      "Ask what would evidence the higher level.\nOffer a scoped 30/60/90 plan.\nSometimes take cash now with a written early promo review.",
    solution:
      "Lead with scope: 'The role we discussed matches L6 expectations because of X/Y/Z.' Request re-calibration packet. Fallback: written review at 6 months with clear criteria. Do not badmouth the loop.",
    interviewerNotes: "Staff/principal candidates should prioritize level and scope.",
    sourceRefs: [
      { site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" },
    ],
    scripts: [
      {
        title: "Level ask",
        when: "Offer level feels low vs scope",
        say: "Compensation is meaningful, but level and scope matter for the impact you hired me to drive. Given the cross-team ownership we discussed, can we revisit calibration for the higher level — or define a written early-review path?",
        avoid: "Threatening to withdraw unless they panic-raise",
      },
    ],
    worksheetFields: [
      "Offered level",
      "Target level",
      "Evidence bullets (3)",
      "Fallback: early review date",
      "Fallback: cash/equity trade",
    ],
  },
];
