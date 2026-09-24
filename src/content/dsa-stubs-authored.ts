import type { Question } from "@/lib/types";

const refs = [{ site: "tech-interview-handbook", url: "https://www.techinterviewhandbook.org/grind75" }];
const feRefs = [{ site: "mdn", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }];

/** Second authoring wave: high-signal DSA and JavaScript implementation prompts. */
export const authoredDsaStubs: Question[] = [
  {
    id: "contains-duplicate", track: "dsa", level: "beginner", title: "Contains Duplicate", tags: ["arrays", "set"], status: "ready", canonicalTopic: "contains-duplicate", pattern: "Set",
    prompt: "Implement `containsDuplicate(nums)` to return true when any number appears at least twice.",
    hints: ["A Set only keeps one copy of a value.", "You can exit as soon as an insertion would repeat a value."],
    approach: "Scan once while tracking seen values. A duplicate is found when the set already contains the current number. Time O(n), space O(n).",
    solution: "```ts\nexport function containsDuplicate(nums: number[]): boolean {\n  const seen = new Set<number>();\n  for (const value of nums) {\n    if (seen.has(value)) return true;\n    seen.add(value);\n  }\n  return false;\n}\n```\nSorting first also works in O(n log n) time, but the Set keeps the linear-time solution clear.",
    interviewerNotes: "State the duplicate policy and why early exit is valid.", sourceRefs: refs,
  },
  {
    id: "best-time-stock", track: "dsa", level: "beginner", title: "Best Time to Buy and Sell Stock", tags: ["arrays", "greedy"], status: "ready", canonicalTopic: "best-time-stock", pattern: "Running minimum",
    prompt: "Given daily prices, choose one buy day before one sell day to maximize profit. Return 0 if no profit is possible.",
    hints: ["The best sell today uses the lowest price seen before today.", "You do not need to test every pair."],
    approach: "Carry the lowest prior price and the best profit so far. At each price, evaluate selling today before updating the minimum. Time O(n), space O(1).",
    solution: "```ts\nexport function maxProfit(prices: number[]): number {\n  let lowest = Infinity;\n  let best = 0;\n  for (const price of prices) {\n    lowest = Math.min(lowest, price);\n    best = Math.max(best, price - lowest);\n  }\n  return best;\n}\n```\nThis solves the one-transaction variant. Multiple transactions require a different rule.",
    interviewerNotes: "Clarify that buying must happen before selling and distinguish the one-transaction variant.", sourceRefs: refs,
  },
  {
    id: "product-except-self", track: "dsa", level: "mid", title: "Product of Array Except Self", tags: ["arrays", "prefix-suffix"], status: "ready", canonicalTopic: "product-except-self", pattern: "Prefix / suffix",
    prompt: "Return an array where each result is the product of every input value except the one at that index. Do it without division in O(n) time.",
    hints: ["Every answer is a left product times a right product.", "The output array can hold the prefix products."],
    approach: "First store the product of values to the left of each position. Walk from the right with a running suffix and multiply it into the output. Time O(n), extra space O(1) excluding output.",
    solution: "```ts\nexport function productExceptSelf(nums: number[]): number[] {\n  const result = Array(nums.length).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < nums.length; i++) {\n    result[i] = prefix;\n    prefix *= nums[i];\n  }\n  let suffix = 1;\n  for (let i = nums.length - 1; i >= 0; i--) {\n    result[i] *= suffix;\n    suffix *= nums[i];\n  }\n  return result;\n}\n```\nIt naturally handles zeroes; division approaches need special cases for them.",
    interviewerNotes: "Call out the output-array space convention and why a zero breaks naive division.", sourceRefs: refs,
  },
  {
    id: "max-subarray", track: "dsa", level: "mid", title: "Maximum Subarray (Kadane)", tags: ["arrays", "dynamic-programming"], status: "ready", canonicalTopic: "max-subarray", pattern: "Kadane's algorithm",
    prompt: "Return the largest possible sum of a contiguous non-empty subarray.",
    hints: ["At each index, either extend the previous subarray or start fresh.", "A negative running sum cannot help a later total."],
    approach: "Track the best sum ending at the current index and the best sum anywhere. Each value either starts a new subarray or extends the previous one. Time O(n), space O(1).",
    solution: "```ts\nexport function maxSubArray(nums: number[]): number {\n  let endingHere = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    endingHere = Math.max(nums[i], endingHere + nums[i]);\n    best = Math.max(best, endingHere);\n  }\n  return best;\n}\n```\nInitializing from the first value matters: an all-negative array should return its least-negative member, not zero.",
    interviewerNotes: "Explain the recurrence in words; do not merely name Kadane’s algorithm.", sourceRefs: refs,
  },
  {
    id: "three-sum", track: "dsa", level: "mid", title: "3Sum", tags: ["arrays", "two-pointers"], status: "ready", canonicalTopic: "3sum", pattern: "Sort + two pointers",
    prompt: "Return every unique triplet in an array whose values sum to zero.",
    hints: ["Sorting makes duplicate skipping and pointer movement possible.", "Fix one number, then solve two sum in the remaining suffix."],
    approach: "Sort, fix each distinct left value, then move two pointers inward. Skip duplicate anchors and duplicate pointer values. Time O(n²), space O(1) excluding output.",
    solution: "```ts\nexport function threeSum(nums: number[]): number[][] {\n  nums.sort((a, b) => a - b);\n  const result: number[][] = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let left = i + 1, right = nums.length - 1;\n    while (left < right) {\n      const sum = nums[i] + nums[left] + nums[right];\n      if (sum < 0) left++;\n      else if (sum > 0) right--;\n      else {\n        result.push([nums[i], nums[left], nums[right]]);\n        while (nums[left] === nums[left + 1]) left++;\n        while (nums[right] === nums[right - 1]) right--;\n        left++; right--;\n      }\n    }\n  }\n  return result;\n}\n```",
    interviewerNotes: "The main failure mode is forgetting duplicate handling after a match.", sourceRefs: refs,
  },
  {
    id: "container-water", track: "dsa", level: "mid", title: "Container With Most Water", tags: ["arrays", "two-pointers"], status: "ready", canonicalTopic: "container-water", pattern: "Two pointers",
    prompt: "Choose two heights that hold the most water, where area is the shorter height times the distance between indices.",
    hints: ["Start at the widest pair.", "Moving the taller wall cannot improve the limiting height while width shrinks."],
    approach: "Evaluate both ends and move the pointer at the shorter wall. That is the only move that can find a taller limiter. Time O(n), space O(1).",
    solution: "```ts\nexport function maxArea(height: number[]): number {\n  let left = 0, right = height.length - 1, best = 0;\n  while (left < right) {\n    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));\n    if (height[left] <= height[right]) left++;\n    else right--;\n  }\n  return best;\n}\n```",
    interviewerNotes: "Justify the pointer move; it is a proof question disguised as an implementation question.", sourceRefs: refs,
  },
  {
    id: "valid-parentheses", track: "dsa", level: "beginner", title: "Valid Parentheses", tags: ["stack", "strings"], status: "ready", canonicalTopic: "valid-parentheses", pattern: "Stack",
    prompt: "Return whether a string of `()[]{}` pairs is balanced and properly nested.",
    hints: ["The most recently opened delimiter must close first.", "Map closing delimiters to their opening pair."],
    approach: "Push opening delimiters. On a closing delimiter, require the matching opener at the top. The stack must be empty at the end. Time O(n), space O(n).",
    solution: "```ts\nexport function isValid(s: string): boolean {\n  const openingFor: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n  const stack: string[] = [];\n  for (const char of s) {\n    if (char in openingFor) {\n      if (stack.pop() !== openingFor[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}\n```",
    interviewerNotes: "Test an early closing delimiter and a leftover opener, not just a happy path.", sourceRefs: refs,
  },
  {
    id: "merge-intervals", track: "dsa", level: "mid", title: "Merge Intervals", tags: ["intervals", "sorting"], status: "ready", canonicalTopic: "merge-intervals", pattern: "Sort + sweep",
    prompt: "Merge every overlapping interval in a list of `[start, end]` pairs.",
    hints: ["Sort by start time.", "Only compare an interval with the latest merged interval."],
    approach: "After sorting, an interval overlaps when its start is not after the last merged end. Extend that end or start a new result interval. Time O(n log n), space O(n) for the result.",
    solution: "```ts\nexport function merge(intervals: number[][]): number[][] {\n  if (intervals.length === 0) return [];\n  const sorted = intervals.toSorted((a, b) => a[0] - b[0]);\n  const result = [sorted[0].slice()];\n  for (const [start, end] of sorted.slice(1)) {\n    const last = result[result.length - 1];\n    if (start <= last[1]) last[1] = Math.max(last[1], end);\n    else result.push([start, end]);\n  }\n  return result;\n}\n```\nDecide with the interviewer whether touching ranges such as `[1, 2]` and `[2, 3]` count as overlapping.",
    interviewerNotes: "Avoid mutating caller-owned nested arrays unless that contract is explicit.", sourceRefs: refs,
  },
  {
    id: "linked-list-cycle", track: "dsa", level: "mid", title: "Linked List Cycle", tags: ["linked-list", "two-pointers"], status: "ready", canonicalTopic: "linked-list-cycle", pattern: "Floyd's cycle detection",
    prompt: "Return whether a singly linked list has a cycle, using constant extra space.",
    hints: ["Use one pointer moving one step and one moving two.", "If there is a cycle, the faster pointer eventually laps the slower one."],
    approach: "Advance slow by one and fast by two while fast can move. A meeting means a cycle; reaching null means none. Time O(n), space O(1).",
    solution: "```ts\ntype Node = { value: number; next: Node | null };\nexport function hasCycle(head: Node | null): boolean {\n  let slow = head, fast = head;\n  while (fast?.next) {\n    slow = slow!.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\n```",
    interviewerNotes: "Use identity comparison, not node value comparison. Follow up with finding the cycle entrance if time permits.", sourceRefs: refs,
  },
  {
    id: "invert-binary-tree", track: "dsa", level: "beginner", title: "Invert Binary Tree", tags: ["trees", "recursion"], status: "ready", canonicalTopic: "invert-binary-tree", pattern: "DFS",
    prompt: "Mirror a binary tree by swapping every node’s left and right children.",
    hints: ["The base case is an empty node.", "Swap then recurse, or recurse then swap."],
    approach: "Visit each node once, swap its children, and recurse into the swapped subtrees. Time O(n); recursive call stack O(h).",
    solution: "```ts\ntype Tree = { value: number; left: Tree | null; right: Tree | null };\nexport function invertTree(root: Tree | null): Tree | null {\n  if (!root) return null;\n  [root.left, root.right] = [root.right, root.left];\n  invertTree(root.left);\n  invertTree(root.right);\n  return root;\n}\n```\nAn iterative stack is equivalent when recursion depth is a concern.",
    interviewerNotes: "Mention that this mutates the tree; create new nodes instead if immutability is required.", sourceRefs: refs,
  },
  {
    id: "level-order", track: "dsa", level: "mid", title: "Binary Tree Level Order Traversal", tags: ["trees", "bfs"], status: "ready", canonicalTopic: "level-order", pattern: "Breadth-first search",
    prompt: "Return a binary tree’s values grouped by depth from left to right.",
    hints: ["A queue preserves breadth-first order.", "Record the current queue length before processing a level."],
    approach: "Seed a queue with the root. For each current queue size, dequeue exactly that many nodes and enqueue their children. Time O(n), space O(w).",
    solution: "```ts\ntype Tree = { value: number; left: Tree | null; right: Tree | null };\nexport function levelOrder(root: Tree | null): number[][] {\n  if (!root) return [];\n  const result: number[][] = [];\n  const queue: Tree[] = [root];\n  for (let head = 0; head < queue.length;) {\n    const levelEnd = queue.length;\n    const level: number[] = [];\n    while (head < levelEnd) {\n      const node = queue[head++];\n      level.push(node.value);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}\n```\nUsing a moving head avoids the O(n) cost of repeatedly calling `shift()`.",
    interviewerNotes: "The queue implementation detail is a nice JavaScript-specific performance signal.", sourceRefs: refs,
  },
  {
    id: "number-of-islands", track: "dsa", level: "mid", title: "Number of Islands", tags: ["graphs", "dfs"], status: "ready", canonicalTopic: "number-of-islands", pattern: "Grid DFS",
    prompt: "Count connected groups of land (`'1'`) in a grid of water (`'0'`) using four-direction adjacency.",
    hints: ["Each unvisited land cell starts one island.", "Mark its whole connected component before continuing."],
    approach: "Scan the grid. When land is found, increment the count and flood-fill its component so it cannot be counted again. Time O(rows × columns).",
    solution: "```ts\nexport function numIslands(grid: string[][]): number {\n  const visit = (r: number, c: number): void => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    visit(r + 1, c); visit(r - 1, c); visit(r, c + 1); visit(r, c - 1);\n  };\n  let count = 0;\n  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) {\n    if (grid[r][c] === '1') { count++; visit(r, c); }\n  }\n  return count;\n}\n```\nUse a separate `visited` set when mutating the input is not permitted.",
    interviewerNotes: "Clarify diagonal adjacency and mutation policy. An explicit stack avoids recursion limits on huge grids.", sourceRefs: refs,
  },
  {
    id: "clone-graph", track: "dsa", level: "mid", title: "Clone Graph", tags: ["graphs", "hashmap"], status: "ready", canonicalTopic: "clone-graph", pattern: "Graph traversal + map",
    prompt: "Deep-clone an undirected graph, preserving cycles and shared neighbors.",
    hints: ["A node can be reached more than once.", "Map original nodes to clones before exploring neighbors."],
    approach: "Memoize every clone as soon as it is created. Recursively or iteratively build its neighbor list from cloned neighbors. Time O(V + E), space O(V).",
    solution: "```ts\ntype Node = { value: number; neighbors: Node[] };\nexport function cloneGraph(node: Node | null): Node | null {\n  if (!node) return null;\n  const copies = new Map<Node, Node>();\n  const clone = (current: Node): Node => {\n    const existing = copies.get(current);\n    if (existing) return existing;\n    const copy: Node = { value: current.value, neighbors: [] };\n    copies.set(current, copy);\n    copy.neighbors = current.neighbors.map(clone);\n    return copy;\n  };\n  return clone(node);\n}\n```",
    interviewerNotes: "Putting the clone in the map before visiting neighbors is what makes cycles safe.", sourceRefs: refs,
  },
  {
    id: "course-schedule", track: "dsa", level: "mid", title: "Course Schedule", tags: ["graphs", "topological-sort"], status: "ready", canonicalTopic: "course-schedule", pattern: "Topological sort",
    prompt: "Given prerequisite pairs `[course, prerequisite]`, return whether every course can be completed.",
    hints: ["A directed cycle makes completion impossible.", "Count each course’s unmet prerequisites."],
    approach: "Build adjacency and indegree counts. Repeatedly take courses with zero prerequisites; if every course is processed, no cycle exists. Time O(V + E).",
    solution: "```ts\nexport function canFinish(count: number, prerequisites: number[][]): boolean {\n  const next = Array.from({ length: count }, () => [] as number[]);\n  const indegree = Array(count).fill(0);\n  for (const [course, prerequisite] of prerequisites) {\n    next[prerequisite].push(course);\n    indegree[course]++;\n  }\n  const queue = indegree.flatMap((degree, course) => degree === 0 ? [course] : []);\n  for (let head = 0; head < queue.length; head++) {\n    for (const course of next[queue[head]]) {\n      if (--indegree[course] === 0) queue.push(course);\n    }\n  }\n  return queue.length === count;\n}\n```",
    interviewerNotes: "Be explicit about the edge direction. DFS coloring is an equally valid cycle-detection solution.", sourceRefs: refs,
  },
  {
    id: "throttle", track: "dsa", level: "mid", title: "Implement throttle", tags: ["javascript", "timing"], status: "ready", canonicalTopic: "throttle", pattern: "UI utilities",
    prompt: "Implement a leading-and-trailing `throttle(fn, wait)` that invokes at most once per wait window while preserving the latest call’s arguments.",
    hints: ["A throttle limits rate; a debounce waits for silence.", "You need both the last invocation time and a trailing timer."],
    approach: "Invoke immediately when the window is open. During the window, remember the latest call and schedule one trailing invocation. Provide cancellation in production code.",
    solution: "```ts\nexport function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {\n  let last = 0;\n  let timer: ReturnType<typeof setTimeout> | undefined;\n  let pending: Parameters<T> | undefined;\n  return function (this: unknown, ...args: Parameters<T>) {\n    const now = Date.now();\n    const remaining = wait - (now - last);\n    if (remaining <= 0) {\n      if (timer) clearTimeout(timer);\n      timer = undefined; last = now; fn.apply(this, args);\n    } else {\n      pending = args;\n      if (!timer) timer = setTimeout(() => {\n        last = Date.now(); timer = undefined;\n        if (pending) fn.apply(this, pending);\n        pending = undefined;\n      }, remaining);\n    }\n  };\n}\n```",
    interviewerNotes: "Clarify leading/trailing behavior before coding; there are several legitimate throttle contracts.", sourceRefs: feRefs,
  },
  {
    id: "promisify", track: "dsa", level: "mid", title: "Promisify a callback API", tags: ["javascript", "async"], status: "ready", canonicalTopic: "promisify", pattern: "Async adapter",
    prompt: "Convert a Node-style callback function `(args..., callback)` where callback receives `(error, value)` into a Promise-returning function.",
    hints: ["Reject on error and resolve otherwise.", "Preserve the receiver with `apply`."],
    approach: "Return a wrapper that creates a Promise and appends a callback. Be clear that this assumes the Node error-first convention and a single success value.",
    solution: "```ts\nexport function promisify<T extends unknown[], R>(\n  fn: (...args: [...T, (error: unknown, value: R) => void]) => void,\n) {\n  return function (this: unknown, ...args: T): Promise<R> {\n    return new Promise((resolve, reject) => {\n      fn.apply(this, [...args, (error, value) => error ? reject(error) : resolve(value)]);\n    });\n  };\n}\n```\nReal APIs may return multiple callback values, call back more than once, or not follow Node’s convention; define that contract before generalizing.",
    interviewerNotes: "Preserving `this` is often missed when adapting instance methods.", sourceRefs: feRefs,
  },
  {
    id: "flatten-array", track: "dsa", level: "mid", title: "Flatten nested arrays", tags: ["javascript", "recursion"], status: "ready", canonicalTopic: "flatten-array", pattern: "Recursive traversal",
    prompt: "Flatten an arbitrarily nested array of numbers without using `Array.prototype.flat`.",
    hints: ["An element is either a number or another array.", "Return one accumulator rather than repeatedly concatenating arrays."],
    approach: "Depth-first traverse nested arrays, pushing scalar values into one output array. Time O(n) across all values, space O(n) plus recursion depth.",
    solution: "```ts\ntype Nested = number | Nested[];\nexport function flatten(values: Nested[]): number[] {\n  const result: number[] = [];\n  const visit = (items: Nested[]) => {\n    for (const item of items) Array.isArray(item) ? visit(item) : result.push(item);\n  };\n  visit(values);\n  return result;\n}\n```\nFor deeply nested untrusted input, use an explicit stack to avoid exhausting the JavaScript call stack.",
    interviewerNotes: "Define whether sparse holes, array-like values, or a maximum depth are in scope.", sourceRefs: feRefs,
  },
  {
    id: "curry", track: "dsa", level: "senior", title: "Implement curry", tags: ["javascript", "functions"], status: "ready", canonicalTopic: "curry", pattern: "Functional utilities",
    prompt: "Implement `curry(fn)` so a fixed-arity function can be called in grouped arguments until all arguments are supplied.",
    hints: ["Keep collected arguments in a closure.", "Use the original function’s arity as the stopping condition."],
    approach: "Each call returns another collector until enough arguments exist, then invoke the original function. Preserve `this` at final invocation.",
    solution: "```ts\nexport function curry<T extends unknown[], R>(fn: (...args: T) => R) {\n  const collect = (received: unknown[]) => function (this: unknown, ...next: unknown[]): unknown {\n    const all = [...received, ...next];\n    return all.length >= fn.length\n      ? fn.apply(this, all as T)\n      : collect(all);\n  };\n  return collect([]) as (...args: Partial<T>) => unknown;\n}\n```\nThis is for fixed arity. Rest-parameter functions have `length === 0`, so their completion rule must be supplied separately.",
    interviewerNotes: "Ask whether empty calls, placeholders, and `this` support are required before overengineering.", sourceRefs: feRefs,
  },
  {
    id: "ui-accessible-modal", track: "dsa", level: "mid", title: "UI: Accessible modal dialog", tags: ["ui-coding", "react", "a11y"], status: "ready", canonicalTopic: "ui-modal", pattern: "Accessible overlay",
    prompt: "Build a modal dialog that opens from a trigger, closes with Escape, returns focus to the trigger, traps focus while open, and does not close when its content is clicked.",
    hints: ["A dialog is a focus-management problem, not just a fixed-position div.", "Store the element that opened it before moving focus inside."],
    approach: "Use a native button trigger and a dialog surface with `role=dialog`, `aria-modal`, and an accessible name. On open, focus the first meaningful control; cycle Tab/Shift+Tab between focusable descendants; restore focus on close.",
    solution: "Render the overlay only while open. Keep a ref to the trigger and the dialog. On mount, move focus into the dialog and register an Escape handler; on cleanup, remove it and restore the trigger. For a small interview implementation, query focusable descendants and cycle on Tab. In production, prefer the native `<dialog>` element where its behavior fits, or a maintained accessible dialog primitive. Support backdrop close only if the product allows it, stop propagation from the panel, lock page scroll carefully, and never use a `div` as the trigger.",
    interviewerNotes: "The bar is keyboard behavior: focus enters, cannot escape with Tab, Escape works, and focus returns. Mention stacked dialogs only if asked.", sourceRefs: feRefs,
    sandbox: { template: "react-ts", files: [{ path: "/App.tsx", active: true, code: `import { useEffect, useRef, useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus the dialog, listen for Escape, and restore trigger focus on cleanup.
  }, [open]);

  return (
    <main>
      <button ref={triggerRef} onClick={() => setOpen(true)}>Open settings</button>
      {open && (
        <div className="backdrop" onMouseDown={() => setOpen(false)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="dialog-title">Settings</h2>
            <input aria-label="Display name" />
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
` }] },
  },
  {
    id: "ui-tabs", track: "dsa", level: "mid", title: "UI: Tabs component", tags: ["ui-coding", "react", "a11y"], status: "ready", canonicalTopic: "ui-tabs", pattern: "Compound widget",
    prompt: "Build a three-tab component with one visible panel at a time. Support click and Left/Right/Home/End keyboard navigation with correct ARIA relationships.",
    hints: ["Tabs and panels need stable ids.", "Decide whether arrow keys activate a tab immediately or only move focus."],
    approach: "Keep an active tab id and a ref array for tab buttons. Use a `tablist`, buttons with `role=tab`, and panels with `role=tabpanel`; map key presses to the next enabled index.",
    solution: "Model tabs as data with stable ids, label, and content. Render a `role=tablist`; each trigger gets `role=tab`, `aria-selected`, `aria-controls`, and `tabIndex={active ? 0 : -1}`. Each panel gets `role=tabpanel`, `aria-labelledby`, and is hidden when inactive. In automatic activation, Left/Right moves focus and sets active together; in manual activation it moves focus only and Enter/Space selects. State the choice and keep it consistent. Use Home/End for first/last, wrap only if the product expects it, and do not implement tabs as anchor navigation unless routing is the actual requirement.",
    interviewerNotes: "Candidates often style the selected tab but omit `aria-selected`, roving tabIndex, and panel labeling. Ask them to narrate the keyboard contract.", sourceRefs: feRefs,
    sandbox: { template: "react-ts", files: [{ path: "/App.tsx", active: true, code: `import { useRef, useState } from 'react';

const tabs = [
  { id: 'overview', label: 'Overview', content: 'Project overview' },
  { id: 'activity', label: 'Activity', content: 'Recent activity' },
  { id: 'settings', label: 'Settings', content: 'Project settings' },
];

export default function App() {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  return (
    <section>
      <div role="tablist" aria-label="Project sections">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={tab.id + '-panel'}
            id={tab.id + '-tab'}
            tabIndex={activeId === tab.id ? 0 : -1}
            onClick={() => setActiveId(tab.id)}
            onKeyDown={() => { /* add roving keyboard behavior */ }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => activeId === tab.id && (
        <div key={tab.id} role="tabpanel" id={tab.id + '-panel'} aria-labelledby={tab.id + '-tab'}>
          {tab.content}
        </div>
      ))}
    </section>
  );
}
` }] },
  },
  {
    id: "ui-dropdown", track: "dsa", level: "mid", title: "UI: Dropdown menu", tags: ["ui-coding", "react", "a11y"], status: "ready", canonicalTopic: "ui-dropdown", pattern: "Menu button",
    prompt: "Build an actions menu opened by a button. It should close on Escape, click outside, and selection; focus should move into the menu and return to the button when it closes.",
    hints: ["Use a menu only for actions; a select/listbox is a different widget.", "Outside click should use a document-level pointer event and containment check."],
    approach: "Use a button with `aria-haspopup=menu` and `aria-expanded`. Keep refs to trigger/menu, put focus on the first enabled item at open, and centralize close behavior.",
    solution: "A menu button controls a short list of command actions. The trigger is a native button with `aria-haspopup=\"menu\"` and current `aria-expanded`. The popup uses `role=menu` and action buttons use `role=menuitem` (or normal buttons if you intentionally choose a simpler non-menu pattern). On open, focus the first item; support Escape, ArrowUp/ArrowDown, Home/End, outside pointer down, and return focus to the trigger on close. Do not use this pattern for choosing a form value—that is a listbox/select problem. For a production app, use an established menu primitive to cover nested menus and complex focus rules.",
    interviewerNotes: "The core distinction between a command menu and a selection control demonstrates sound accessibility judgment.", sourceRefs: feRefs,
    sandbox: { template: "react-ts", files: [{ path: "/App.tsx", active: true, code: `import { useEffect, useRef, useState } from 'react';

const actions = ['Rename', 'Duplicate', 'Archive'];

export default function App() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus first item. Add Escape and outside-pointer handling here.
  }, [open]);

  return (
    <div>
      <button ref={triggerRef} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Actions
      </button>
      {open && <div ref={menuRef} role="menu">
        {actions.map((action) => <button key={action} role="menuitem" onClick={() => setOpen(false)}>{action}</button>)}
      </div>}
    </div>
  );
}
` }] },
  },
  {
    id: "ui-infinite-scroll", track: "dsa", level: "senior", title: "UI: Infinite scroll list", tags: ["ui-coding", "performance", "a11y"], status: "ready", canonicalTopic: "ui-infinite-scroll", pattern: "Pagination + IntersectionObserver",
    prompt: "Build a feed that loads the next cursor page when a sentinel becomes visible. Prevent duplicate fetches, handle errors, preserve accessibility, and include a manual fallback.",
    hints: ["The server needs a cursor and `hasNextPage`, not a page-number guess.", "The observer callback can fire repeatedly while the sentinel is visible."],
    approach: "Use an explicit pagination state machine: idle/loading/success/error plus next cursor. Observe a sentinel only when a next page exists and no request is active; retain a Load more button as fallback.",
    solution: "Keep `items`, `nextCursor`, `hasNextPage`, `status`, and `error` together or in a server-cache abstraction. A `loadMore` function must return early while loading or when exhausted, and should use the cursor that came from the last successful response. Attach an `IntersectionObserver` to a sentinel near the list end with a positive root margin, disconnect it during teardown, and call the same `loadMore` used by a visible Load more button. Announce loaded result counts politely, expose retry on failure, and avoid an endless page that strands keyboard users. For very long feeds, combine cursor pagination with virtualization and preserve scroll anchor when prepending data.",
    interviewerNotes: "Senior details: duplicate observer events, stale cursor closures, aborting obsolete requests, and a keyboard-accessible fallback.", sourceRefs: feRefs,
    sandbox: { template: "react-ts", files: [{ path: "/App.tsx", active: true, code: `import { useEffect, useRef, useState } from 'react';

type Page = { items: string[]; nextCursor: string | null };
async function fetchPage(cursor: string | null): Promise<Page> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const start = cursor ? Number(cursor) : 0;
  return { items: Array.from({ length: 10 }, (_, i) => 'Result ' + (start + i + 1)), nextCursor: start + 10 < 40 ? String(start + 10) : null };
}

export default function App() {
  const [items, setItems] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    // Avoid duplicate requests, fetch using nextCursor, then append and update cursor.
  }

  useEffect(() => { void loadMore(); }, []);
  useEffect(() => {
    // Observe sentinel and call loadMore when appropriate. Disconnect in cleanup.
  }, [nextCursor, loading]);

  return <main><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><div ref={sentinelRef} />{nextCursor && <button onClick={loadMore}>Load more</button>}</main>;
}
` }] },
  },
  {
    id: "ui-form-validation", track: "dsa", level: "mid", title: "UI: Form with validation", tags: ["ui-coding", "react", "forms", "a11y"], status: "ready", canonicalTopic: "ui-form-validation", pattern: "Controlled form",
    prompt: "Build a sign-up form with email and password fields. Validate on blur and submit, show accessible errors, prevent duplicate submission, and keep server errors distinct from field errors.",
    hints: ["Track touched state separately from values and errors.", "A disabled button is not a substitute for submit-time validation."],
    approach: "Use a validation function that returns field errors. Mark a field touched on blur, validate all values on submit, focus the first invalid field, and model submit state separately from field validity.",
    solution: "Store `values`, `touched`, `fieldErrors`, and `submitStatus` explicitly (or use a form library with the same concepts). Labels connect to inputs with `htmlFor`; invalid inputs get `aria-invalid` and `aria-describedby` pointing at a persistent error element. Validate when a touched field changes/loses focus and always validate every field in the submit handler. If invalid, focus the first invalid control. While submitting, prevent concurrent submits but leave the form understandable; show a form-level error for network/account failures rather than pretending it belongs to one field. Never rely only on client validation—the server remains authoritative.",
    interviewerNotes: "Look for error timing, error associations, double-submit prevention, and a distinction between client constraints and server responses.", sourceRefs: feRefs,
    sandbox: { template: "react-ts", files: [{ path: "/App.tsx", active: true, code: `import { FormEvent, useState } from 'react';

type Values = { email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!/^\\S+@\\S+\\.\\S+$/.test(values.email)) errors.email = 'Enter a valid email address.';
  if (values.password.length < 8) errors.password = 'Use at least 8 characters.';
  return errors;
}

export default function App() {
  const [values, setValues] = useState<Values>({ email: '', password: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    // Validate all fields, focus the first invalid input, then submit once.
  }

  return <form onSubmit={submit} noValidate>
    <label htmlFor="email">Email</label>
    <input id="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} onBlur={() => setTouched({ ...touched, email: true })} />
    {touched.email && errors.email && <p id="email-error">{errors.email}</p>}
    <label htmlFor="password">Password</label>
    <input id="password" type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} onBlur={() => setTouched({ ...touched, password: true })} />
    {touched.password && errors.password && <p id="password-error">{errors.password}</p>}
    <button disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
  </form>;
}
` }] },
  },
];
