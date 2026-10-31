/**
 * STRATA Server-Side Private Problem Judge Data
 *
 * CRITICAL SECURITY INVARIANT:
 * This file and its contents MUST NEVER be sent to the browser or leaked via API.
 * It contains:
 * - Optimal reference solutions (multi-language)
 * - Independent brute-force solutions (for cross-checking and TLE benchmarking)
 * - Full hidden test suites (at least 15 comprehensive test cases per problem)
 * - Custom checkers for multi-answer / order-insensitive problems
 * - Locked editorial text and hints
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. TWO SUM
// ─────────────────────────────────────────────────────────────────────────────
const TWO_SUM_DATA = {
    id: "two-sum",
    hintsCount: 3,
    hints: [
        "A really brute force way would be to search for all possible pairs of numbers, but that would be O(n^2). Can you do better?",
        "Can we use extra space? We can use a hash map to store elements we've seen so far.",
        "As we iterate through nums, check if (target - nums[i]) already exists in our map. If so, return its index and the current index."
    ],
    editorial: {
        approach: `### Approach: Single-Pass Hash Map\n\nWhile the brute force approach compares every pair in $O(n^2)$ time, we can trade $O(n)$ space for $O(n)$ runtime.\n\nAs we iterate through \`nums\`, for each element \`nums[i]\`, the complement we need is \`target - nums[i]\`.\nWe check if this complement already exists in our hash map. If it does, we return the stored index and \`i\`. If not, we record \`map[nums[i]] = i\` and continue.\n\nBecause we look up elements in the map in $O(1)$ average time, the entire algorithm completes in a single linear pass.`,
        complexity: {
            time: "O(n) — We traverse the list containing n elements only once. Each lookup in the hash map takes O(1) time.",
            space: "O(n) — The extra space required depends on the number of items stored in the hash map, which stores at most n elements."
        },
        code: {
            javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
            python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []`,
            cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
            java: `import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
        }
    },
    referenceSolutions: {
        optimal: {
            javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
            python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []`
        },
        bruteForce: {
            javascript: `function twoSum(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) {\n                return [i, j];\n            }\n        }\n    }\n    return [];\n}`
        }
    },
    // Custom checker allows returning indices in any order [i, j] or [j, i]
    checker: (input, actual, expected) => {
        if (!Array.isArray(actual) || actual.length !== 2) {
            return { pass: false, reason: "Expected array of 2 indices" };
        }
        const [i, j] = actual;
        const nums = input.nums;
        const target = input.target;
        if (i === j) {
            return { pass: false, reason: `Cannot use the same element twice (index ${i})` };
        }
        if (i < 0 || i >= nums.length || j < 0 || j >= nums.length) {
            return { pass: false, reason: `Index out of bounds: [${i}, ${j}] for length ${nums.length}` };
        }
        if (nums[i] + nums[j] !== target) {
            return { pass: false, reason: `nums[${i}] (${nums[i]}) + nums[${j}] (${nums[j]}) = ${nums[i] + nums[j]} != target (${target})` };
        }
        return { pass: true };
    },
    validator: (input) => {
        return Array.isArray(input.nums) && input.nums.length >= 2 && typeof input.target === 'number';
    },
    hiddenTestCases: [
        { id: 1, name: "Sample 1: standard positive", input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { id: 2, name: "Sample 2: non-sorted answer", input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { id: 3, name: "Sample 3: identical values", input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
        { id: 4, name: "Negatives only", input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] },
        { id: 5, name: "Mixed positive and negative", input: { nums: [-10, 7, 12, -3, 5], target: 2 }, expected: [0, 2] },
        { id: 6, name: "Target zero with zeros", input: { nums: [0, 4, 3, 0], target: 0 }, expected: [0, 3] },
        { id: 7, name: "Target zero with opposites", input: { nums: [-5, 2, 5, 8], target: 0 }, expected: [0, 2] },
        { id: 8, name: "Large numbers (10^9)", input: { nums: [1000000000, 500, 1000000000], target: 2000000000 }, expected: [0, 2] },
        { id: 9, name: "Minimal size (2 elements)", input: { nums: [10, 20], target: 30 }, expected: [0, 1] },
        { id: 10, name: "First and last elements form target", input: { nums: [5, 1, 2, 3, 4, 5], target: 10 }, expected: [0, 5] },
        { id: 11, name: "Adjacent at end of list", input: { nums: [1, 3, 5, 7, 9, 11], target: 20 }, expected: [4, 5] },
        { id: 12, name: "Duplicate values not forming target", input: { nums: [1, 1, 1, 2, 3], target: 5 }, expected: [3, 4] },
        { id: 13, name: "Descending numbers", input: { nums: [20, 15, 10, 5, 0], target: 20 }, expected: [0, 4] },
        { id: 14, name: "Moderate size with target in middle", input: { nums: [100, 25, 42, 13, 99, 88, 77, 66, 12, 18], target: 30 }, expected: [8, 9] },
        { id: 15, name: "Large array (1000 elements)", input: { nums: Array.from({ length: 1000 }, (_, idx) => idx + 1), target: 1999 }, expected: [998, 999] },
        { id: 16, name: "Large constraint (3000 elements) O(n^2) TLE check", input: { nums: Array.from({ length: 3000 }, (_, idx) => idx * 2), target: 11994 }, expected: [2998, 2999] }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS
// ─────────────────────────────────────────────────────────────────────────────
const LONGEST_SUBSTRING_DATA = {
    id: "longest-substring-without-repeating-characters",
    hintsCount: 3,
    hints: [
        "Use a sliding window with two pointers: left and right.",
        "Store the most recent index where each character was seen in a hash map.",
        "When you encounter a character already in the window, jump the left pointer to the right of its previous index."
    ],
    editorial: {
        approach: `### Approach: Sliding Window with Last Seen Map\n\nWe maintain a sliding window defined by two pointers, \`left\` and \`right\`.\n\nAs we advance \`right\`, we check if \`s[right]\` has already appeared inside our current window (\`map.get(s[right]) >= left\`).\nIf so, we shift \`left = map.get(s[right]) + 1\` to exclude the duplicate.\n\nWe record the new position \`map.set(s[right], right)\` and update \`maxLen = Math.max(maxLen, right - left + 1)\`.\nThis visits each character at most twice, providing optimal $O(n)$ time complexity.`,
        complexity: {
            time: "O(n) — Each character is visited at most twice (once by right, once by left).",
            space: "O(min(n, m)) — Size of the hash map is bounded by the alphabet size m (e.g. 128 ASCII or 256 extended)."
        },
        code: {
            javascript: `function lengthOfLongestSubstring(s) {\n    let maxLen = 0, left = 0;\n    const map = new Map();\n    for (let right = 0; right < s.length; right++) {\n        if (map.has(s[right]) && map.get(s[right]) >= left) {\n            left = map.get(s[right]) + 1;\n        }\n        map.set(s[right], right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`,
            python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        char_index = {}\n        left = 0\n        max_len = 0\n        for right, char in enumerate(s):\n            if char in char_index and char_index[char] >= left:\n                left = char_index[char] + 1\n            char_index[char] = right\n            max_len = max(max_len, right - left + 1)\n        return max_len`,
            cpp: `#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_map<char, int> charMap;\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.length(); right++) {\n            if (charMap.count(s[right]) && charMap[s[right]] >= left) {\n                left = charMap[s[right]] + 1;\n            }\n            charMap[s[right]] = right;\n            maxLen = max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n};`,
            java: `import java.util.HashMap;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        HashMap<Character, Integer> map = new HashMap<>();\n        int maxLen = 0, left = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (map.containsKey(c) && map.get(c) >= left) {\n                left = map.get(c) + 1;\n            }\n            map.put(c, right);\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}`
        }
    },
    referenceSolutions: {
        optimal: {
            javascript: `function lengthOfLongestSubstring(s) {\n    let maxLen = 0, left = 0;\n    const map = new Map();\n    for (let right = 0; right < s.length; right++) {\n        if (map.has(s[right]) && map.get(s[right]) >= left) {\n            left = map.get(s[right]) + 1;\n        }\n        map.set(s[right], right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`,
            python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        char_index = {}\n        left = 0\n        max_len = 0\n        for right, char in enumerate(s):\n            if char in char_index and char_index[char] >= left:\n                left = char_index[char] + 1\n            char_index[char] = right\n            max_len = max(max_len, right - left + 1)\n        return max_len`
        },
        bruteForce: {
            javascript: `function lengthOfLongestSubstring(s) {\n    let maxLen = 0;\n    for (let i = 0; i < s.length; i++) {\n        const seen = new Set();\n        for (let j = i; j < s.length; j++) {\n            if (seen.has(s[j])) break;\n            seen.add(s[j]);\n            maxLen = Math.max(maxLen, j - i + 1);\n        }\n    }\n    return maxLen;\n}`
        }
    },
    checker: (input, actual, expected) => {
        const num = typeof actual === 'number' ? actual : parseInt(actual, 10);
        if (num === expected) return { pass: true };
        return { pass: false, reason: `Expected ${expected}, got ${actual}` };
    },
    validator: (input) => typeof input.s === 'string',
    hiddenTestCases: [
        { id: 1, name: "Sample 1: abcabcbb", input: { s: "abcabcbb" }, expected: 3 },
        { id: 2, name: "Sample 2: bbbbb", input: { s: "bbbbb" }, expected: 1 },
        { id: 3, name: "Sample 3: pwwkew", input: { s: "pwwkew" }, expected: 3 },
        { id: 4, name: "Empty string", input: { s: "" }, expected: 0 },
        { id: 5, name: "Single character", input: { s: "a" }, expected: 1 },
        { id: 6, name: "All unique characters", input: { s: "abcdef" }, expected: 6 },
        { id: 7, name: "Duplicate at boundary: aab", input: { s: "aab" }, expected: 2 },
        { id: 8, name: "Duplicate at end: abb", input: { s: "abb" }, expected: 2 },
        { id: 9, name: "Whitespace string", input: { s: "   " }, expected: 1 },
        { id: 10, name: "Alternating characters: ababab", input: { s: "ababab" }, expected: 2 },
        { id: 11, name: "Symbols and digits", input: { s: "123!@#123" }, expected: 6 },
        { id: 12, name: "Embedded repeat: tmmzuxt", input: { s: "tmmzuxt" }, expected: 5 },
        { id: 13, name: "Repeated prefix with unique core", input: { s: "aaaaaxyzaaaaa" }, expected: 4 },
        { id: 14, name: "Long palindrome: ananana", input: { s: "ananana" }, expected: 2 },
        { id: 15, name: "String with spaces in between", input: { s: "a b c a" }, expected: 3 },
        { id: 16, name: "Large repetitive string O(n^2) TLE check", input: { s: "abcdefghijklmnopqrstuvwxyz".repeat(150) }, expected: 26 }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. LRU CACHE ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────
const LRU_CACHE_DATA = {
    id: "lru-cache",
    hintsCount: 3,
    hints: [
        "To achieve O(1) time complexity for both get and put, a hash map alone is not enough to maintain order.",
        "Combine a Hash Map with a Doubly Linked List. The hash map maps keys to doubly linked list nodes.",
        "When an item is accessed or updated, move its node to the head of the list. When capacity is exceeded, remove from the tail."
    ],
    editorial: {
        approach: `### Approach: Hash Map + Doubly Linked List\n\nTo achieve strictly $O(1)$ operations for both \`get\` and \`put\`:\n1. A **Doubly Linked List** allows $O(1)$ removal and addition of nodes when given a node reference.\n2. A **Hash Map** maps each key to its corresponding Node in the list in $O(1)$ time.\n\n- \`get(key)\`: Look up node in map. If not found, return -1. If found, unlink node and insert at head, then return value.\n- \`put(key, value)\`: If key exists, update value and move to head. If not, create node, add to head, and store in map. If size > capacity, remove tail node from list and map.`,
        complexity: {
            time: "O(1) for both get and put — All operations are direct pointer manipulation or hash map lookup.",
            space: "O(capacity) — Stores at most capacity nodes in both the list and the hash map."
        },
        code: {
            javascript: `class Node {\n    constructor(key, val) {\n        this.key = key;\n        this.val = val;\n        this.prev = null;\n        this.next = null;\n    }\n}\n\nclass LRUCache {\n    constructor(capacity) {\n        this.cap = capacity;\n        this.map = new Map();\n        this.head = new Node(0, 0);\n        this.tail = new Node(0, 0);\n        this.head.next = this.tail;\n        this.tail.prev = this.head;\n    }\n\n    _remove(node) {\n        node.prev.next = node.next;\n        node.next.prev = node.prev;\n    }\n\n    _add(node) {\n        node.next = this.head.next;\n        node.prev = this.head;\n        this.head.next.prev = node;\n        this.head.next = node;\n    }\n\n    get(key) {\n        if (!this.map.has(key)) return -1;\n        const node = this.map.get(key);\n        this._remove(node);\n        this._add(node);\n        return node.val;\n    }\n\n    put(key, value) {\n        if (this.map.has(key)) {\n            this._remove(this.map.get(key));\n        }\n        const node = new Node(key, value);\n        this._add(node);\n        this.map.set(key, node);\n        if (this.map.size > this.cap) {\n            const lru = this.tail.prev;\n            this._remove(lru);\n            this.map.delete(lru.key);\n        }\n    }\n}`,
            python: `class DLinkedNode:\n    def __init__(self, key=0, value=0):\n        self.key = key\n        self.value = value\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cache = {}\n        self.head = DLinkedNode()\n        self.tail = DLinkedNode()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n        self.capacity = capacity\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add(node)\n        return node.value\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = DLinkedNode(key, value)\n        self._add(node)\n        self.cache[key] = node\n        if len(self.cache) > self.capacity:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.cache[lru.key]`
        }
    },
    referenceSolutions: {
        optimal: {
            javascript: `class Node {\n    constructor(key, val) {\n        this.key = key;\n        this.val = val;\n        this.prev = null;\n        this.next = null;\n    }\n}\n\nclass LRUCache {\n    constructor(capacity) {\n        this.cap = capacity;\n        this.map = new Map();\n        this.head = new Node(0, 0);\n        this.tail = new Node(0, 0);\n        this.head.next = this.tail;\n        this.tail.prev = this.head;\n    }\n\n    _remove(node) {\n        node.prev.next = node.next;\n        node.next.prev = node.prev;\n    }\n\n    _add(node) {\n        node.next = this.head.next;\n        node.prev = this.head;\n        this.head.next.prev = node;\n        this.head.next = node;\n    }\n\n    get(key) {\n        if (!this.map.has(key)) return -1;\n        const node = this.map.get(key);\n        this._remove(node);\n        this._add(node);\n        return node.val;\n    }\n\n    put(key, value) {\n        if (this.map.has(key)) {\n            this._remove(this.map.get(key));\n        }\n        const node = new Node(key, value);\n        this._add(node);\n        this.map.set(key, node);\n        if (this.map.size > this.cap) {\n            const lru = this.tail.prev;\n            this._remove(lru);\n            this.map.delete(lru.key);\n        }\n    }\n}`
        },
        bruteForce: {
            javascript: `class LRUCache {\n    constructor(capacity) {\n        this.cap = capacity;\n        this.map = new Map();\n    }\n    get(key) {\n        if (!this.map.has(key)) return -1;\n        const val = this.map.get(key);\n        this.map.delete(key);\n        this.map.set(key, val);\n        return val;\n    }\n    put(key, value) {\n        if (this.map.has(key)) this.map.delete(key);\n        this.map.set(key, value);\n        if (this.map.size > this.cap) {\n            const oldestKey = this.map.keys().next().value;\n            this.map.delete(oldestKey);\n        }\n    }\n}`
        }
    },
    checker: (input, actual, expected) => {
        if (!Array.isArray(actual)) return { pass: false, reason: "Expected array of operation outputs" };
        if (actual.length !== expected.length) return { pass: false, reason: `Length mismatch: expected ${expected.length}, got ${actual.length}` };
        for (let i = 0; i < expected.length; i++) {
            if (actual[i] !== expected[i]) {
                return { pass: false, reason: `Operation ${i} mismatch: expected ${expected[i]}, got ${actual[i]}` };
            }
        }
        return { pass: true };
    },
    validator: (input) => Array.isArray(input.ops) && Array.isArray(input.args),
    hiddenTestCases: [
        {
            id: 1,
            name: "Sample 1: standard sequence",
            input: { ops: ["put", "put", "get", "put", "get", "put", "get", "get", "get"], args: [[1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]], capacity: 2 },
            expected: [null, null, 1, null, -1, null, -1, 3, 4]
        },
        {
            id: 2,
            name: "Capacity 1 cache",
            input: { ops: ["put", "get", "put", "get", "get"], args: [[1, 10], [1], [2, 20], [1], [2]], capacity: 1 },
            expected: [null, 10, null, -1, 20]
        },
        {
            id: 3,
            name: "Get non-existent key returns -1",
            input: { ops: ["get", "put", "get"], args: [[5], [5, 50], [5]], capacity: 2 },
            expected: [-1, null, 50]
        },
        {
            id: 4,
            name: "Overwrite existing key value",
            input: { ops: ["put", "put", "get"], args: [[1, 1], [1, 2], [1]], capacity: 2 },
            expected: [null, null, 2]
        },
        {
            id: 5,
            name: "Repeated gets keep item fresh",
            input: { ops: ["put", "put", "get", "get", "put", "get", "get"], args: [[1, 1], [2, 2], [1], [1], [3, 3], [2], [1]], capacity: 2 },
            expected: [null, null, 1, 1, null, -1, 1]
        },
        {
            id: 6,
            name: "Capacity 3: fill without eviction",
            input: { ops: ["put", "put", "put", "get", "get", "get"], args: [[1, 1], [2, 2], [3, 3], [1], [2], [3]], capacity: 3 },
            expected: [null, null, null, 1, 2, 3]
        },
        {
            id: 7,
            name: "Capacity 3: eviction order",
            input: { ops: ["put", "put", "put", "put", "get", "get", "get", "get"], args: [[1, 1], [2, 2], [3, 3], [4, 4], [1], [2], [3], [4]], capacity: 3 },
            expected: [null, null, null, null, -1, 2, 3, 4]
        },
        {
            id: 8,
            name: "Zero as key and value",
            input: { ops: ["put", "get", "put", "get"], args: [[0, 0], [0], [0, 100], [0]], capacity: 2 },
            expected: [null, 0, null, 100]
        },
        {
            id: 9,
            name: "Put update does not trigger eviction",
            input: { ops: ["put", "put", "put", "get", "get"], args: [[1, 1], [2, 2], [1, 10], [1], [2]], capacity: 2 },
            expected: [null, null, null, 10, 2]
        },
        {
            id: 10,
            name: "Rapid alternating gets",
            input: { ops: ["put", "put", "get", "put", "get"], args: [[10, 100], [20, 200], [10], [30, 300], [20]], capacity: 2 },
            expected: [null, null, 100, null, -1]
        },
        {
            id: 11,
            name: "Large capacity no evictions",
            input: { ops: ["put", "put", "put", "put", "get", "get"], args: [[1, 10], [2, 20], [3, 30], [4, 40], [1], [4]], capacity: 10 },
            expected: [null, null, null, null, 10, 40]
        },
        {
            id: 12,
            name: "Evict all keys sequentially",
            input: { ops: ["put", "put", "put", "put", "get", "get"], args: [[1, 1], [2, 2], [3, 3], [4, 4], [1], [2]], capacity: 2 },
            expected: [null, null, null, null, -1, -1]
        },
        {
            id: 13,
            name: "Single key toggled multiple times",
            input: { ops: ["put", "get", "put", "get", "put", "get"], args: [[7, 70], [7], [7, 71], [7], [7, 72], [7]], capacity: 1 },
            expected: [null, 70, null, 71, null, 72]
        },
        {
            id: 14,
            name: "Capacity 4 balanced accesses",
            input: { ops: ["put", "put", "put", "put", "get", "put", "get"], args: [[1, 1], [2, 2], [3, 3], [4, 4], [2], [5, 5], [1]], capacity: 4 },
            expected: [null, null, null, null, 2, null, -1]
        },
        {
            id: 15,
            name: "Consecutive duplicate get calls",
            input: { ops: ["put", "get", "get", "get"], args: [[42, 420], [42], [42], [42]], capacity: 2 },
            expected: [null, 420, 420, 420]
        },
        {
            id: 16,
            name: "Capacity 2 comprehensive sequence",
            input: { ops: ["put", "put", "get", "put", "get", "put", "get", "get", "get"], args: [[2, 1], [1, 1], [2], [4, 1], [1], [2, 2], [2], [4], [1]], capacity: 2 },
            expected: [null, null, 1, null, -1, null, 2, 1, -1]
        }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MERGE INTERVALS
// ─────────────────────────────────────────────────────────────────────────────
const MERGE_INTERVALS_DATA = {
    id: "merge-intervals",
    hintsCount: 3,
    hints: [
        "If intervals are sorted by their start time, all intervals that can be merged will be adjacent.",
        "Sort intervals by start point: intervals.sort((a, b) => a[0] - b[0]).",
        "Iterate through sorted intervals: if the current interval starts before or at the end of the previous merged interval, merge them."
    ],
    editorial: {
        approach: `### Approach: Sorting by Start Time\n\nIf we sort the intervals by their start point \`intervals.sort((a, b) => a[0] - b[0])\`, any overlapping intervals are guaranteed to appear consecutively.\n\nWe initialize our merged list with the first interval.\nFor each subsequent interval \`curr\`:\n- If \`curr[0] <= merged.last[1]\`, they overlap. We update \`merged.last[1] = Math.max(merged.last[1], curr[1])\`.\n- Otherwise, they are disjoint, so we append \`curr\` to \`merged\`.\n\nThis runs in $O(n \\log n)$ time due to sorting, followed by a linear $O(n)$ scan.`,
        complexity: {
            time: "O(n log n) — Sorting the intervals dominates the runtime.",
            space: "O(n) — Required to store the merged output intervals."
        },
        code: {
            javascript: `function merge(intervals) {\n    if (!intervals.length) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const last = merged[merged.length - 1];\n        const curr = intervals[i];\n        if (curr[0] <= last[1]) {\n            last[1] = Math.max(last[1], curr[1]);\n        } else {\n            merged.push(curr);\n        }\n    }\n    return merged;\n}`,
            python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n        for interval in intervals:\n            if not merged or merged[-1][1] < interval[0]:\n                merged.append(interval)\n            else:\n                merged[-1][1] = max(merged[-1][1], interval[1])\n        return merged`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> merged = {intervals[0]};\n        for (size_t i = 1; i < intervals.size(); i++) {\n            if (intervals[i][0] <= merged.back()[1]) {\n                merged.back()[1] = max(merged.back()[1], intervals[i][1]);\n            } else {\n                merged.push_back(intervals[i]);\n            }\n        }\n        return merged;\n    }\n};`,
            java: `import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.List;\n\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> result = new ArrayList<>();\n        int[] current = intervals[0];\n        result.add(current);\n        for (int[] interval : intervals) {\n            if (interval[0] <= current[1]) {\n                current[1] = Math.max(current[1], interval[1]);\n            } else {\n                current = interval;\n                result.add(current);\n            }\n        }\n        return result.toArray(new int[result.size()][]);\n    }\n}`
        }
    },
    referenceSolutions: {
        optimal: {
            javascript: `function merge(intervals) {\n    if (!intervals.length) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const last = merged[merged.length - 1];\n        const curr = intervals[i];\n        if (curr[0] <= last[1]) {\n            last[1] = Math.max(last[1], curr[1]);\n        } else {\n            merged.push(curr);\n        }\n    }\n    return merged;\n}`,
            python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n        for interval in intervals:\n            if not merged or merged[-1][1] < interval[0]:\n                merged.append(interval)\n            else:\n                merged[-1][1] = max(merged[-1][1], interval[1])\n        return merged`
        },
        bruteForce: {
            javascript: `function merge(intervals) {\n    if (!intervals.length) return [];\n    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);\n    const res = [];\n    let i = 0;\n    while (i < sorted.length) {\n        let start = sorted[i][0];\n        let end = sorted[i][1];\n        let j = i + 1;\n        while (j < sorted.length && sorted[j][0] <= end) {\n            end = Math.max(end, sorted[j][1]);\n            j++;\n        }\n        res.push([start, end]);\n        i = j;\n    }\n    return res;\n}`
        }
    },
    // Custom checker verifies that:
    // 1. All output intervals are non-overlapping: out[i][1] < out[i+1][0]
    // 2. Output matches canonical merged intervals
    checker: (input, actual, expected) => {
        if (!Array.isArray(actual)) return { pass: false, reason: "Expected 2D array of intervals" };
        const sorted = [...actual].sort((a, b) => a[0] - b[0]);
        // Verify no internal overlap
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i][1] >= sorted[i + 1][0]) {
                return { pass: false, reason: `Merged intervals contain remaining overlap: [${sorted[i]}] and [${sorted[i+1]}]` };
            }
        }
        // Match against expected
        const sortedExpected = [...expected].sort((a, b) => a[0] - b[0]);
        if (sorted.length !== sortedExpected.length) {
            return { pass: false, reason: `Interval count mismatch: expected ${sortedExpected.length}, got ${sorted.length}` };
        }
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i][0] !== sortedExpected[i][0] || sorted[i][1] !== sortedExpected[i][1]) {
                return { pass: false, reason: `Mismatch at interval ${i}: expected [${sortedExpected[i]}], got [${sorted[i]}]` };
            }
        }
        return { pass: true };
    },
    validator: (input) => Array.isArray(input.intervals),
    hiddenTestCases: [
        { id: 1, name: "Sample 1: partial overlaps", input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expected: [[1, 6], [8, 10], [15, 18]] },
        { id: 2, name: "Sample 2: touching boundaries", input: { intervals: [[1, 4], [4, 5]] }, expected: [[1, 5]] },
        { id: 3, name: "Single interval", input: { intervals: [[1, 4]] }, expected: [[1, 4]] },
        { id: 4, name: "Two disjoint intervals", input: { intervals: [[1, 2], [3, 4]] }, expected: [[1, 2], [3, 4]] },
        { id: 5, name: "Completely contained intervals", input: { intervals: [[1, 10], [2, 3], [4, 5]] }, expected: [[1, 10]] },
        { id: 6, name: "All identical intervals", input: { intervals: [[1, 4], [1, 4], [1, 4]] }, expected: [[1, 4]] },
        { id: 7, name: "Unsorted input list", input: { intervals: [[5, 6], [1, 2], [3, 4]] }, expected: [[1, 2], [3, 4], [5, 6]] },
        { id: 8, name: "Single point intervals [x, x]", input: { intervals: [[1, 1], [2, 2], [3, 3]] }, expected: [[1, 1], [2, 2], [3, 3]] },
        { id: 9, name: "Point overlapping full interval", input: { intervals: [[1, 2], [2, 2], [2, 3]] }, expected: [[1, 3]] },
        { id: 10, name: "Zero boundaries", input: { intervals: [[0, 0], [0, 2], [1, 3]] }, expected: [[0, 3]] },
        { id: 11, name: "Large numbers (10^6)", input: { intervals: [[1000000, 2000000], [1500000, 3000000]] }, expected: [[1000000, 3000000]] },
        { id: 12, name: "All intervals chain into one", input: { intervals: [[1, 3], [2, 5], [4, 7], [6, 9]] }, expected: [[1, 9]] },
        { id: 13, name: "Disjoint pairs", input: { intervals: [[1, 2], [2, 3], [5, 6], [6, 7]] }, expected: [[1, 3], [5, 7]] },
        { id: 14, name: "Reverse sorted input", input: { intervals: [[15, 18], [8, 10], [2, 6], [1, 3]] }, expected: [[1, 6], [8, 10], [15, 18]] },
        { id: 15, name: "Nested interval inside multiple", input: { intervals: [[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]] }, expected: [[1, 10]] },
        { id: 16, name: "Large chain (500 intervals) O(n^2) check", input: { intervals: Array.from({ length: 500 }, (_, idx) => [idx * 2, idx * 2 + 3]) }, expected: [[0, 1001]] }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. TRAPPING RAIN WATER
// ─────────────────────────────────────────────────────────────────────────────
const TRAPPING_RAIN_WATER_DATA = {
    id: "trapping-rain-water",
    hintsCount: 3,
    hints: [
        "For each position, the trapped water is determined by the minimum of the highest bar to its left and right, minus its own height.",
        "Instead of calculating prefix and suffix maximums in separate arrays, can you do this in place using two pointers?",
        "Maintain left and right pointers. Track leftMax and rightMax. Advance the pointer with the smaller maximum."
    ],
    editorial: {
        approach: `### Approach: Two Pointers (Optimal O(1) Space)\n\nWater trapped above any bar at index $i$ is:\n$$\\text{water}[i] = \\max(0, \\min(\\text{leftMax}, \\text{rightMax}) - \\text{height}[i])$$\n\nUsing two converging pointers \`left\` and \`right\`:\n- If \`height[left] < height[right]\`:\n  - If \`height[left] >= leftMax\`, update \`leftMax = height[left]\`.\n  - Else, we can trap \`leftMax - height[left]\` units of water.\n  - Advance \`left++\`.\n- Else:\n  - If \`height[right] >= rightMax\`, update \`rightMax = height[right]\`.\n  - Else, we can trap \`rightMax - height[right]\` units of water.\n  - Advance \`right--\`.\n\nThis achieves $O(n)$ time complexity and $O(1)$ auxiliary space.`,
        complexity: {
            time: "O(n) — A single pass with two converging pointers.",
            space: "O(1) — Only a few primitive pointer and max trackers."
        },
        code: {
            javascript: `function trap(height) {\n    let left = 0, right = height.length - 1;\n    let leftMax = 0, rightMax = 0;\n    let water = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            if (height[left] >= leftMax) leftMax = height[left];\n            else water += leftMax - height[left];\n            left++;\n        } else {\n            if (height[right] >= rightMax) rightMax = height[right];\n            else water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}`,
            python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max, right_max = 0, 0\n        water = 0\n        while left < right:\n            if height[left] < height[right]:\n                if height[left] >= left_max:\n                    left_max = height[left]\n                else:\n                    water += left_max - height[left]\n                left += 1\n            else:\n                if height[right] >= right_max:\n                    right_max = height[right]\n                else:\n                    water += right_max - height[right]\n                right -= 1\n        return water`,
            cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n};`,
            java: `class Solution {\n    public int trap(int[] height) {\n        int left = 0, right = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n}`
        }
    },
    referenceSolutions: {
        optimal: {
            javascript: `function trap(height) {\n    let left = 0, right = height.length - 1;\n    let leftMax = 0, rightMax = 0;\n    let water = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            if (height[left] >= leftMax) leftMax = height[left];\n            else water += leftMax - height[left];\n            left++;\n        } else {\n            if (height[right] >= rightMax) rightMax = height[right];\n            else water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}`,
            python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        left, right = 0, len(height) - 1\n        left_max, right_max = 0, 0\n        water = 0\n        while left < right:\n            if height[left] < height[right]:\n                if height[left] >= left_max:\n                    left_max = height[left]\n                else:\n                    water += left_max - height[left]\n                left += 1\n            else:\n                if height[right] >= right_max:\n                    right_max = height[right]\n                else:\n                    water += right_max - height[right]\n                right -= 1\n        return water`
        },
        bruteForce: {
            javascript: `function trap(height) {\n    let water = 0;\n    for (let i = 0; i < height.length; i++) {\n        let leftMax = 0, rightMax = 0;\n        for (let j = i; j >= 0; j--) leftMax = Math.max(leftMax, height[j]);\n        for (let j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);\n        water += Math.min(leftMax, rightMax) - height[i];\n    }\n    return water;\n}`
        }
    },
    checker: (input, actual, expected) => {
        const num = typeof actual === 'number' ? actual : parseInt(actual, 10);
        if (num === expected) return { pass: true };
        return { pass: false, reason: `Expected ${expected}, got ${actual}` };
    },
    validator: (input) => Array.isArray(input.height),
    hiddenTestCases: [
        { id: 1, name: "Sample 1: multi-basin [0,1,0,2,1,0,1,3,2,1,2,1]", input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6 },
        { id: 2, name: "Sample 2: deep basin [4,2,0,3,2,5]", input: { height: [4, 2, 0, 3, 2, 5] }, expected: 9 },
        { id: 3, name: "Empty array", input: { height: [] }, expected: 0 },
        { id: 4, name: "Single bar", input: { height: [1] }, expected: 0 },
        { id: 5, name: "Two bars", input: { height: [2, 0] }, expected: 0 },
        { id: 6, name: "Monotonically increasing", input: { height: [1, 2, 3, 4, 5] }, expected: 0 },
        { id: 7, name: "Monotonically decreasing", input: { height: [5, 4, 3, 2, 1] }, expected: 0 },
        { id: 8, name: "Flat bars", input: { height: [3, 3, 3, 3] }, expected: 0 },
        { id: 9, name: "Simple V-shape: [3, 0, 3]", input: { height: [3, 0, 3] }, expected: 3 },
        { id: 10, name: "Simple U-shape: [3, 0, 0, 3]", input: { height: [3, 0, 0, 3] }, expected: 6 },
        { id: 11, name: "Stepped valley: [5, 2, 1, 2, 5]", input: { height: [5, 2, 1, 2, 5] }, expected: 10 },
        { id: 12, name: "Two separate basins: [3, 0, 3, 0, 3]", input: { height: [3, 0, 3, 0, 3] }, expected: 6 },
        { id: 13, name: "All zeros: [0, 0, 0, 0]", input: { height: [0, 0, 0, 0] }, expected: 0 },
        { id: 14, name: "High wall with uneven floor", input: { height: [5, 4, 1, 2] }, expected: 1 },
        { id: 15, name: "Deep canyon: [100000, 0, 100000]", input: { height: [100000, 0, 100000] }, expected: 100000 },
        { id: 16, name: "Large array (1000 elements) O(n^2) check", input: { height: Array.from({ length: 1000 }, (_, idx) => (idx % 2 === 0 ? 5 : 1)) }, expected: 1996 }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY MAP
// ─────────────────────────────────────────────────────────────────────────────
const PROBLEM_JUDGE_REGISTRY = {
    "two-sum": TWO_SUM_DATA,
    "longest-substring-without-repeating-characters": LONGEST_SUBSTRING_DATA,
    "lru-cache": LRU_CACHE_DATA,
    "merge-intervals": MERGE_INTERVALS_DATA,
    "trapping-rain-water": TRAPPING_RAIN_WATER_DATA
};

class ProblemJudgeService {
    static getJudgeData(problemId) {
        return PROBLEM_JUDGE_REGISTRY[problemId] || null;
    }

    static getAllPublishedProblemIds() {
        return Object.keys(PROBLEM_JUDGE_REGISTRY);
    }

    static getHintsCount(problemId) {
        const data = PROBLEM_JUDGE_REGISTRY[problemId];
        return data ? data.hintsCount || data.hints.length : 0;
    }

    static getHint(problemId, hintIndex) {
        const data = PROBLEM_JUDGE_REGISTRY[problemId];
        if (!data || !data.hints) return null;
        if (hintIndex < 0 || hintIndex >= data.hints.length) return null;
        return {
            hintIndex,
            totalHints: data.hints.length,
            text: data.hints[hintIndex]
        };
    }

    static getEditorial(problemId) {
        const data = PROBLEM_JUDGE_REGISTRY[problemId];
        if (!data || !data.editorial) return null;
        return data.editorial;
    }

    static getHiddenTestCases(problemId) {
        const data = PROBLEM_JUDGE_REGISTRY[problemId];
        return data ? data.hiddenTestCases : [];
    }

    static checkResult(problemId, input, actual, expected) {
        const data = PROBLEM_JUDGE_REGISTRY[problemId];
        if (data && typeof data.checker === 'function') {
            return data.checker(input, actual, expected);
        }
        // Default deep equality check
        try {
            const pass = JSON.stringify(actual) === JSON.stringify(expected);
            return { pass, reason: pass ? undefined : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}` };
        } catch {
            const pass = actual === expected;
            return { pass, reason: pass ? undefined : `Expected ${expected}, got ${actual}` };
        }
    }
}

module.exports = {
    PROBLEM_JUDGE_REGISTRY,
    ProblemJudgeService,
    TWO_SUM_DATA,
    LONGEST_SUBSTRING_DATA,
    LRU_CACHE_DATA,
    MERGE_INTERVALS_DATA,
    TRAPPING_RAIN_WATER_DATA
};
