import type { Level, Question } from "@/lib/types";

const refs = [{ site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" }];

function problem(input: {
  id: string;
  topic: string;
  level: Level;
  title: string;
  tags: string[];
  pattern: string;
  prompt: string;
  hints: string[];
  approach: string;
  solution: string;
  interviewerNotes: string;
  starter: string;
  tests: string;
}): Question {
  return {
    id: input.id,
    track: "dsa",
    level: input.level,
    title: input.title,
    tags: input.tags,
    status: "ready",
    canonicalTopic: input.topic,
    pattern: input.pattern,
    prompt: input.prompt,
    hints: input.hints,
    approach: input.approach,
    solution: input.solution,
    interviewerNotes: input.interviewerNotes,
    sourceRefs: refs,
    sandbox: {
      template: "test-ts",
      files: [
        { path: "/index.ts", active: true, code: input.starter },
        { path: "/index.test.ts", hidden: true, code: input.tests },
      ],
    },
  };
}

export const dsaWave2: Question[] = [
  problem({
    id: "reverse-linked-list",
    topic: "reverse-linked-list",
    level: "beginner",
    title: "Reverse Linked List",
    tags: ["linked-list"],
    pattern: "Pointer rewiring",
    prompt:
      "Reverse a singly linked list in place and return the new head. Implement `reverseList(head)`.",
    hints: [
      "Keep three pointers: previous, current, and the next node you are about to orphan.",
      "The old head becomes the tail, so its next must end as null.",
    ],
    approach:
      "Walk once. For each node, point it at the previous node, then advance. O(n) time, O(1) extra space. Recursion is fine if you can name the stack cost.",
    solution: `Save \`next\` before you overwrite \`current.next\`. Then set \`current.next = previous\`, advance previous to current, and current to the saved next. When current is null, previous is the new head.

\`\`\`ts
type Node = { value: number; next: Node | null };

export function reverseList(head: Node | null): Node | null {
  let previous: Node | null = null;
  let current = head;
  while (current) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}
\`\`\`

A recursive version returns the new head from the end of the list and sets \`head.next.next = head\` on the way back. Say that it uses O(n) stack.`,
    interviewerNotes:
      "Draw three nodes. The bug is losing the rest of the list by writing next too early. Ask whether they want the list mutated.",
    starter: `type Node = { value: number; next: Node | null };

export function reverseList(head: Node | null): Node | null {
  return head;
}
`,
    tests: `import { reverseList } from './index';

function fromArray(values: number[]) {
  let head: { value: number; next: any } | null = null;
  for (let i = values.length - 1; i >= 0; i--) head = { value: values[i], next: head };
  return head;
}
function toArray(head: { value: number; next: any } | null) {
  const out: number[] = [];
  const seen = new Set<object>();
  while (head) {
    if (seen.has(head)) throw new Error('cycle');
    seen.add(head);
    out.push(head.value);
    head = head.next;
  }
  return out;
}

test('empty', () => expect(reverseList(null)).toBeNull());
test('one', () => expect(toArray(reverseList(fromArray([1])))).toEqual([1]));
test('several', () => expect(toArray(reverseList(fromArray([1, 2, 3, 4])))).toEqual([4, 3, 2, 1]));
`,
  }),
  problem({
    id: "max-depth",
    topic: "maximum-depth-of-binary-tree",
    level: "beginner",
    title: "Maximum Depth of Binary Tree",
    tags: ["trees", "recursion"],
    pattern: "Tree DFS",
    prompt:
      "Return the number of nodes on the longest root-to-leaf path. An empty tree has depth 0. Implement `maxDepth(root)`.",
    hints: ["A leaf’s depth is 1 plus nothing below it.", "The answer is 1 plus the deeper child."],
    approach:
      "DFS: depth(null) = 0, otherwise 1 + max(left, right). An iterative BFS that counts levels is the same result. O(n) time. Recursion uses O(height) stack.",
    solution: `The depth of a node is one more than the deeper subtree. The empty child contributes 0, so a leaf returns 1.

\`\`\`ts
type Node = { value: number; left: Node | null; right: Node | null };

export function maxDepth(root: Node | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
\`\`\`

A skewed tree makes the recursive version O(n) stack. If the interviewer cares, switch to an explicit stack or to BFS and count layers. Do not count edges unless they asked for edges; this problem counts nodes on the path.`,
    interviewerNotes:
      "Agree on null = 0 versus a single node = 1 before writing the base case. Those off-by-ones are the whole question.",
    starter: `type Node = { value: number; left: Node | null; right: Node | null };

export function maxDepth(root: Node | null): number {
  return 0;
}
`,
    tests: `import { maxDepth } from './index';

const leaf = (value: number) => ({ value, left: null, right: null });

test('empty', () => expect(maxDepth(null)).toBe(0));
test('leaf', () => expect(maxDepth(leaf(1))).toBe(1));
test('skewed', () => {
  const root = leaf(1);
  root.right = leaf(2);
  root.right.right = leaf(3);
  expect(maxDepth(root)).toBe(3);
});
test('balanced', () => {
  const root = leaf(1);
  root.left = leaf(2);
  root.right = leaf(3);
  root.left.left = leaf(4);
  expect(maxDepth(root)).toBe(3);
});
`,
  }),
  problem({
    id: "climbing-stairs",
    topic: "climbing-stairs",
    level: "beginner",
    title: "Climbing Stairs",
    tags: ["dynamic-programming"],
    pattern: "Fibonacci recurrence",
    prompt:
      "You climb 1 or 2 stairs at a time. Return how many distinct ways to reach the top of n stairs. Implement `climbStairs(n)`.",
    hints: ["To arrive at n you came from n-1 or n-2.", "You only need the last two counts."],
    approach:
      "ways(n) = ways(n-1) + ways(n-2), with ways(1) = 1 and ways(2) = 2. Compute it forward in O(n) time and O(1) space. The closed Fibonacci form is optional and easy to get wrong.",
    solution: `Let f(n) be the number of ways to reach step n. The last move is a single step from n-1 or a double from n-2, and those sets do not overlap.

\`\`\`ts
export function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev = 1;
  let curr = 2;
  for (let i = 3; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}
\`\`\`

f(1) = 1 (one single). f(2) = 2 (two singles, or one double). Recursion without a cache is exponential. If n can be huge, mention that the answer grows exponentially and may need big integers; for interview n it fits in a JS number.`,
    interviewerNotes:
      "Ask them to compute n = 3 by hand (three ways: 1+1+1, 1+2, 2+1) so the recurrence is earned.",
    starter: `export function climbStairs(n: number): number {
  return 0;
}
`,
    tests: `import { climbStairs } from './index';

test('one', () => expect(climbStairs(1)).toBe(1));
test('two', () => expect(climbStairs(2)).toBe(2));
test('three', () => expect(climbStairs(3)).toBe(3));
test('five', () => expect(climbStairs(5)).toBe(8));
`,
  }),
  problem({
    id: "longest-substring",
    topic: "longest-substring-without-repeating-characters",
    level: "mid",
    title: "Longest Substring Without Repeating Characters",
    tags: ["strings", "sliding-window"],
    pattern: "Sliding window",
    prompt:
      "Return the length of the longest substring that contains no repeated characters. Implement `lengthOfLongestSubstring(s)`.",
    hints: [
      "A window is valid while every character in it is unique.",
      "When a character repeats, move the left edge past its previous index.",
    ],
    approach:
      "Maintain a window [left, right] and the last index of each character. When s[right] was seen inside the window, jump left to lastIndex + 1. Track the best width. O(n) time, O(k) space for the alphabet in the string.",
    solution: `The window grows on the right. A repeat shrinks the left edge to just after the previous copy, but never move left backward: an earlier copy outside the window is irrelevant.

\`\`\`ts
export function lengthOfLongestSubstring(s: string): number {
  const last = new Map<string, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const prev = last.get(s[right]);
    if (prev !== undefined && prev >= left) left = prev + 1;
    last.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
\`\`\`

“abcabcbb” is 3. “bbbb” is 1. “” is 0. “pwwkew” is 3 (“wke”), not 4. A set plus a left pointer that walks one step at a time is also O(n) if each index enters and leaves once. Don’t nest a fresh scan from the start for every character.`,
    interviewerNotes:
      "The bug is moving left to lastIndex + 1 even when that index is left of the window, which reopens a character you already passed.",
    starter: `export function lengthOfLongestSubstring(s: string): number {
  return 0;
}
`,
    tests: `import { lengthOfLongestSubstring } from './index';

test('empty', () => expect(lengthOfLongestSubstring('')).toBe(0));
test('repeats', () => expect(lengthOfLongestSubstring('abcabcbb')).toBe(3));
test('same', () => expect(lengthOfLongestSubstring('bbbbb')).toBe(1));
test('gap', () => expect(lengthOfLongestSubstring('pwwkew')).toBe(3));
test('older index', () => expect(lengthOfLongestSubstring('abba')).toBe(2));
`,
  }),
  problem({
    id: "house-robber",
    topic: "house-robber",
    level: "mid",
    title: "House Robber",
    tags: ["dynamic-programming", "arrays"],
    pattern: "Take or skip",
    prompt:
      "Each house has an amount. You cannot rob two adjacent houses. Return the maximum you can rob. Implement `rob(nums)`.",
    hints: [
      "At each house, the choice is rob it plus the best two doors back, or skip it.",
      "You only need the previous two answers.",
    ],
    approach:
      "dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Roll that with two variables. O(n) time, O(1) space. An empty street is 0.",
    solution: `Robbing house i excludes i-1. Skipping house i keeps the best through i-1.

\`\`\`ts
export function rob(nums: number[]): number {
  let skip = 0;
  let take = 0;
  for (const amount of nums) {
    const nextSkip = Math.max(skip, take);
    const nextTake = skip + amount;
    skip = nextSkip;
    take = nextTake;
  }
  return Math.max(skip, take);
}
\`\`\`

Example [2, 7, 9, 3, 1] → 2+9+1 = 12, which beats 7+3. Do not sort. Adjacency is positional. If the street is a circle (first and last also adjacent), that is a different problem: run this twice, once excluding the first house and once excluding the last.`,
    interviewerNotes:
      "Have them explain why the skip variable is the best of the previous take and skip before adding the current house.",
    starter: `export function rob(nums: number[]): number {
  return 0;
}
`,
    tests: `import { rob } from './index';

test('empty', () => expect(rob([])).toBe(0));
test('one', () => expect(rob([5])).toBe(5));
test('two', () => expect(rob([2, 7])).toBe(7));
test('classic', () => expect(rob([2, 7, 9, 3, 1])).toBe(12));
test('adjacent better', () => expect(rob([1, 2, 3, 1])).toBe(4));
`,
  }),
  problem({
    id: "min-stack",
    topic: "min-stack",
    level: "mid",
    title: "Min Stack",
    tags: ["stack"],
    pattern: "Auxiliary stack",
    prompt:
      "Design a stack with push, pop, top, and getMin, each O(1). getMin returns the smallest value currently on the stack. Implement the class `MinStack`.",
    hints: [
      "A second stack can remember the minimum at every height.",
      "Pop has to restore the previous minimum, so you must have stored it.",
    ],
    approach:
      "Push the value onto the data stack and push min(value, currentMin) onto a parallel stack. Pop both. top and getMin read the ends. All four operations are O(1). Empty pop is out of contract; say so.",
    solution: `The parallel stack is the minimum of the prefix ending at that height. It is not a set of all values.

\`\`\`ts
export class MinStack {
  private values: number[] = [];
  private mins: number[] = [];

  push(value: number) {
    this.values.push(value);
    const previous = this.mins.length ? this.mins[this.mins.length - 1] : value;
    this.mins.push(Math.min(previous, value));
  }

  pop() {
    this.mins.pop();
    return this.values.pop();
  }

  top() {
    return this.values[this.values.length - 1];
  }

  getMin() {
    return this.mins[this.mins.length - 1];
  }
}
\`\`\`

Storing the delta from the minimum saves a word only if you enjoy the interview less. Two arrays are the answer to defend. Duplicates of the minimum must be pushed again, otherwise one pop forgets that the minimum is still present.`,
    interviewerNotes:
      "Ask for a sequence: push 2, push 1, push 1, pop, getMin. The answer stays 1. That is the duplicate case.",
    starter: `export class MinStack {
  push(_value: number) {}
  pop(): number | undefined { return undefined; }
  top(): number | undefined { return undefined; }
  getMin(): number | undefined { return undefined; }
}
`,
    tests: `import { MinStack } from './index';

test('tracks the minimum through duplicates', () => {
  const stack = new MinStack();
  stack.push(2);
  stack.push(1);
  stack.push(1);
  expect(stack.getMin()).toBe(1);
  expect(stack.top()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(1);
  stack.pop();
  expect(stack.getMin()).toBe(2);
  expect(stack.top()).toBe(2);
});

test('negative values', () => {
  const stack = new MinStack();
  stack.push(0);
  stack.push(-2);
  expect(stack.getMin()).toBe(-2);
  stack.pop();
  expect(stack.getMin()).toBe(0);
});
`,
  }),
  problem({
    id: "memoize",
    topic: "implement-memoize",
    level: "mid",
    title: "Implement memoize",
    tags: ["javascript", "functions"],
    pattern: "Cache by arguments",
    prompt:
      "Write `memoize(fn)` that returns a function caching results by its arguments. Same arguments must not call `fn` again. Assume arguments are primitives.",
    hints: [
      "A cache key has to include every argument, not only the first.",
      "Different argument lists that join to the same string will collide if you pick a bad separator.",
    ],
    approach:
      "Close over a Map. Build a key that cannot confuse (1, 2) with (12) or (1, '2'). JSON.stringify of the args array is a clear interview answer for primitives. Call fn only on a miss, then store the return value.",
    solution: `The wrapper has the same arity contract as fn for the inputs you cache. The cache lives in the closure, not on the function the caller passed in.

\`\`\`ts
export function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: never[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const value = fn(...args) as ReturnType<T>;
    cache.set(key, value);
    return value;
  }) as T;
}
\`\`\`

Say the limits out loud. JSON keys collide for values that stringify the same way, and they drop \`undefined\` array holes. Object arguments need a stable serialization or an identity cache, which is a different problem. An unbounded Map leaks if the caller passes forever-unique args; a max size is the follow-up, not the first version. Do not cache thrown exceptions unless the product wants that.`,
    interviewerNotes:
      "They should show a counter on fn so a second call is a cache hit. Ask what happens with object args before they claim it is general.",
    starter: `export function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
  return fn;
}
`,
    tests: `import { memoize } from './index';

test('calls through once per argument list', () => {
  let calls = 0;
  const add = memoize((a: number, b: number) => {
    calls += 1;
    return a + b;
  });
  expect(add(1, 2)).toBe(3);
  expect(add(1, 2)).toBe(3);
  expect(calls).toBe(1);
  expect(add(2, 1)).toBe(3);
  expect(calls).toBe(2);
});

test('does not confuse numeric joins', () => {
  const seen: string[] = [];
  const fn = memoize((a: number, b: number) => {
    seen.push(a + ':' + b);
    return a;
  });
  fn(1, 23);
  fn(12, 3);
  expect(seen).toEqual(['1:23', '12:3']);
});
`,
  }),
  problem({
    id: "group-by",
    topic: "implement-groupby",
    level: "mid",
    title: "Implement groupBy",
    tags: ["javascript", "arrays"],
    pattern: "Hash grouping",
    prompt:
      "Write `groupBy(items, getKey)` that returns an object whose keys are the strings `getKey` returned, and whose values are the items in original order.",
    hints: [
      "Each item goes in exactly one bucket.",
      "Creating the bucket on first sight keeps the order inside a group.",
    ],
    approach:
      "One pass. Coerce the key to string the way an object key would, or document that getKey already returns a string. Push onto the existing array or start one. O(n) time.",
    solution: `Order inside a group is the order of appearance. Key order in modern JS objects follows first insertion.

\`\`\`ts
export function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = getKey(item);
    const bucket = groups[key];
    if (bucket) bucket.push(item);
    else groups[key] = [item];
  }
  return groups;
}
\`\`\`

Do not sort unless asked. If getKey can return objects, they are not object keys; require a string or use a Map and say so. An empty input returns {}. Items with the same key stay stable, which matters for a feed grouped by day.`,
    interviewerNotes:
      "Ask whether key order matters. A Map preserves it more honestly than older objects did. A modern object is acceptable if they mention insertion order.",
    starter: `export function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  return {};
}
`,
    tests: `import { groupBy } from './index';

test('groups and keeps order', () => {
  const items = [
    { id: 1, day: 'mon' },
    { id: 2, day: 'tue' },
    { id: 3, day: 'mon' },
  ];
  expect(groupBy(items, (item) => item.day)).toEqual({
    mon: [items[0], items[2]],
    tue: [items[1]],
  });
});

test('empty', () => expect(groupBy([], () => 'a')).toEqual({}));
`,
  }),
];
