import type { Question } from "@/lib/types";

const refs = [
  { site: "blind75", url: "https://www.techinterviewhandbook.org/grind75" },
];

export const dsaWave: Question[] = [
  {
    id: "valid-palindrome",
    track: "dsa",
    level: "beginner",
    title: "Valid Palindrome",
    tags: ["strings", "two-pointers"],
    status: "ready",
    canonicalTopic: "valid-palindrome",
    pattern: "Two pointers",
    prompt:
      "Given a string, return true if it is a palindrome after ignoring non-alphanumeric characters and case. Implement `isPalindrome(s)`.",
    hints: ["Move a left and right index toward the center.", "Skip characters that are not letters or digits."],
    approach: "Two pointers. Compare lowercase alphanumeric characters. O(n) time, O(1) extra space besides the input.",
    solution:
      "Walk i from the left and j from the right. Skip non-alphanumeric chars. Compare the lowercased pair. If any pair differs, return false. If the pointers meet, it is a palindrome.",
    interviewerNotes: "Clarify Unicode vs ASCII. The skip-while-not-alphanumeric loop is the bug magnet.",
    sourceRefs: refs,
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function isPalindrome(s: string): boolean {
  return false;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { isPalindrome } from './index';
test('phrase', () => expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true));
test('no', () => expect(isPalindrome('race a car')).toBe(false));
test('empty', () => expect(isPalindrome(' ')).toBe(true));
`,
        },
      ],
    },
  },
  {
    id: "roman-to-integer",
    track: "dsa",
    level: "beginner",
    title: "Roman to Integer",
    tags: ["strings"],
    status: "ready",
    canonicalTopic: "roman-to-integer",
    pattern: "Strings",
    prompt: "Convert a valid Roman numeral string to an integer. Implement `romanToInt(s)`.",
    hints: ["Map I V X L C D M to values.", "If a smaller value appears before a larger one, subtract it."],
    approach: "Scan left to right. Add the current value, but subtract twice the previous value when the current symbol is larger (undo the add, then subtract).",
    solution:
      "Values: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Subtractive pairs are IV, IX, XL, XC, CD, CM. One pass that subtracts when s[i] < s[i+1] matches the rules.",
    interviewerNotes: "State the assumption that the input is a valid Roman numeral.",
    sourceRefs: refs,
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function romanToInt(s: string): number {
  return 0;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { romanToInt } from './index';
test('III', () => expect(romanToInt('III')).toBe(3));
test('LVIII', () => expect(romanToInt('LVIII')).toBe(58));
test('MCMXCIV', () => expect(romanToInt('MCMXCIV')).toBe(1994));
`,
        },
      ],
    },
  },
  {
    id: "binary-search",
    track: "dsa",
    level: "beginner",
    title: "Binary Search",
    tags: ["binary-search"],
    status: "ready",
    canonicalTopic: "binary-search",
    pattern: "Binary search",
    prompt: "Given a sorted array of unique numbers, return the index of target or -1. Implement `search(nums, target)`.",
    hints: ["Keep a half-open or inclusive range.", "Use mid = lo + Math.floor((hi-lo)/2) to avoid overflow thinking, even in JS."],
    approach: "Halve the search range each step. O(log n) time, O(1) space.",
    solution:
      "Set lo = 0 and hi = n - 1. While lo <= hi, compare nums[mid] to target and move lo to mid+1 or hi to mid-1. If the range empties, return -1.",
    interviewerNotes: "Off-by-one on the inclusive bounds is the usual miss. Say the array must already be sorted.",
    sourceRefs: refs,
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function search(nums: number[], target: number): number {
  return -1;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { search } from './index';
test('hit', () => expect(search([-1,0,3,5,9,12], 9)).toBe(4));
test('miss', () => expect(search([-1,0,3,5,9,12], 2)).toBe(-1));
`,
        },
      ],
    },
  },
  {
    id: "move-zeroes",
    track: "dsa",
    level: "beginner",
    title: "Move Zeroes",
    tags: ["arrays", "two-pointers"],
    status: "ready",
    canonicalTopic: "move-zeroes",
    pattern: "Two pointers",
    prompt: "Move all zeros in `nums` to the end while keeping the order of non-zero numbers. Mutate in place. Implement `moveZeroes(nums): number[]`.",
    hints: ["Write non-zeros into a slow pointer.", "Fill the tail with zeros."],
    approach: "One pass to compact non-zeros, then a fill. O(n) time, O(1) extra space.",
    solution:
      "Let write = 0. For each value, if it is non-zero, place it at nums[write] and increment write. Then set nums[write..] to 0.",
    interviewerNotes: "Stability of non-zero order is required. In-place is the constraint.",
    sourceRefs: refs,
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function moveZeroes(nums: number[]): number[] {
  return nums;
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { moveZeroes } from './index';
test('basic', () => expect(moveZeroes([0,1,0,3,12])).toEqual([1,3,12,0,0]));
test('none', () => expect(moveZeroes([1,2])).toEqual([1,2]));
`,
        },
      ],
    },
  },
  {
    id: "longest-common-prefix",
    track: "dsa",
    level: "beginner",
    title: "Longest Common Prefix",
    tags: ["strings"],
    status: "ready",
    canonicalTopic: "longest-common-prefix",
    pattern: "Strings",
    prompt: "Given an array of strings, return their longest common prefix, or '' if there is none. Implement `longestCommonPrefix(strs)`.",
    hints: ["Compare against the first string character by character.", "Stop at the first mismatch or the end of the shortest string."],
    approach: "Horizontal scan. O(total characters) time.",
    solution:
      "If the list is empty, return ''. Use strs[0] as the candidate and shorten it whenever a later string does not start with that candidate, or walk columns until one string disagrees.",
    interviewerNotes: "Empty array and single-element array are the checks.",
    sourceRefs: refs,
    sandbox: {
      template: "test-ts",
      files: [
        {
          path: "/index.ts",
          active: true,
          code: `export function longestCommonPrefix(strs: string[]): string {
  return '';
}
`,
        },
        {
          path: "/index.test.ts",
          hidden: true,
          code: `import { longestCommonPrefix } from './index';
test('fl', () => expect(longestCommonPrefix(['flower','flow','flight'])).toBe('fl'));
test('none', () => expect(longestCommonPrefix(['dog','racecar','car'])).toBe(''));
`,
        },
      ],
    },
  },
];
