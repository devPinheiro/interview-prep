import type { Question } from "@/lib/types";

const refs = [
  { site: "hellointerview", url: "https://www.hellointerview.com/learn/salary-negotiation/introduction" },
];

export const negotiationWave: Question[] = [
  {
    id: "neg-competing-offers",
    track: "negotiation",
    level: "senior",
    title: "Using competing offers ethically",
    tags: ["offers"],
    status: "ready",
    canonicalTopic: "competing-offers",
    prompt:
      "You have a second real offer. How do you use it without inventing numbers or burning the relationship?",
    hints: ["Only cite offers you actually have.", "Share level and timing, not a fabricated total."],
    approach: "Tell the recruiter the competing process is real, name the deadline, and ask if they can match the scope and package.",
    solution:
      "A competing offer is leverage only when it exists. Say that you are excited about this team and that another process has reached a written offer with a decision date. Ask whether they can update their package before that date. Do not invent a number, do not name a company you are not talking to, and do not share the other employer’s confidential breakdown if you promised not to. If you do share a figure, share one you can defend.",
    interviewerNotes: "Practice saying the sentence out loud. The failure mode is bluffing.",
    sourceRefs: refs,
    scripts: [
      {
        title: "Deadline notice",
        when: "You have a written competing offer",
        say: "I want to be straightforward: I have another written offer and they asked for a decision by Thursday. This team is my preference. If we can get to a comparable package before then, I can decide with the full picture.",
        avoid: "Naming a company or number you do not have",
      },
    ],
    worksheetFields: ["Competing company (private note)", "Their deadline", "Their level", "Cash you would actually accept here"],
  },
  {
    id: "neg-sign-on",
    track: "negotiation",
    level: "mid",
    title: "Negotiating a sign-on bonus",
    tags: ["offers"],
    status: "ready",
    canonicalTopic: "sign-on",
    prompt: "Base is stuck against a band. When is a sign-on the right ask, and how do you phrase it?",
    hints: ["Sign-on covers a one-time gap, not a low level forever.", "Ask what the clawback period is."],
    approach: "Explain the gap (forgone bonus, relocation, delayed equity) and request a one-time payment with clear repayment terms.",
    solution:
      "Use a sign-on when the ongoing band is fair but you are leaving money on the table this year: an unvested bonus, a delayed start, or relocation. Ask for a one-time amount tied to that gap. Confirm whether you must repay it if you leave inside a year, and get that in the letter. A sign-on does not fix a low level or a low base that compounds every year — call that out and keep the level conversation separate.",
    interviewerNotes: "Clawback and ‘this does not replace level’ are the two checks.",
    sourceRefs: refs,
    scripts: [
      {
        title: "Sign-on ask",
        when: "Band is firm and you are forfeiting a bonus",
        say: "I understand base is at the band. I’m leaving an annual bonus that pays in March. A sign-on of $X would cover that one-time gap. Could we include the repayment window in the letter?",
        avoid: "Using sign-on to hide an under-level offer you still reject",
      },
    ],
    worksheetFields: ["Bonus you will forfeit", "Relocation cost", "Requested sign-on", "Clawback months"],
  },
  {
    id: "neg-remote-flexibility",
    track: "negotiation",
    level: "mid",
    title: "Negotiating remote and flexibility",
    tags: ["non-cash"],
    status: "ready",
    canonicalTopic: "remote-flexibility",
    prompt: "The cash number is acceptable. How do you lock remote days or a relocation exception in writing?",
    hints: ["Verbal manager promises expire when managers change.", "Ask which policy the offer letter will cite."],
    approach: "Agree the cash, then confirm location, days on site, and equipment in the written offer.",
    solution:
      "Treat location as compensation. If the loop assumed two office days, ask the recruiter to put that cadence, the office, and any temporary remote exception in the offer. A hallway promise from a hiring manager is not a policy. If flexibility is the reason you would take a lower cash number, say that explicitly so they do not ‘flex’ it away after you sign. Also confirm stipend, equipment, and which timezone you are expected to overlap.",
    interviewerNotes: "Written > verbal. Tie flexibility to the decision if it is a real constraint.",
    sourceRefs: refs,
    scripts: [
      {
        title: "Write it into the offer",
        when: "Remote cadence mattered in interviews",
        say: "Cash works for me if the working pattern we discussed is part of the offer: two days in the Dublin office, remainder remote, overlapping 10:00–16:00 local. Can that be written in?",
        avoid: "Assuming a Slack message survives a reorg",
      },
    ],
    worksheetFields: ["Office days", "Timezone overlap", "Equipment / stipend", "Must be in the letter?"],
  },
  {
    id: "neg-equity-refresh",
    track: "negotiation",
    level: "senior",
    title: "Asking about equity refreshers",
    tags: ["equity"],
    status: "ready",
    canonicalTopic: "equity-refresh",
    prompt: "The new-hire grant looks large. What do you ask so you understand pay in year three?",
    hints: ["Initial grants cliff and vest.", "Refreshers are how ongoing equity is supposed to work at many companies."],
    approach: "Ask the target annual equity, the refresh cadence, and whether performance multiplies the target.",
    solution:
      "A big new-hire grant can front-load year one and two and then fall off. Ask: what is the target annual equity for this level, when refresh grants typically happen, and whether the target is a range tied to performance. You are not demanding a promise of a future grant. You are checking that the year-four picture is a real plan and not a cliff. Write notes privately. If they cannot describe a refresh program at all, price the initial grant as a four-year number and do not assume another drop arrives.",
    interviewerNotes: "This is a comprehension question, not a demand that they guarantee refreshers.",
    sourceRefs: refs,
    scripts: [
      {
        title: "Refresh question",
        when: "Reviewing the equity paragraph",
        say: "Help me understand the ongoing picture. After this new-hire grant vests, what is the typical annual refresh target for this level, and when is it granted?",
        avoid: "Treating a target as a contractual grant",
      },
    ],
    worksheetFields: ["New-hire grant units", "Vest schedule", "Stated annual refresh target", "Year-4 estimate"],
  },
];
