const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../db/database.js');
let content = fs.readFileSync(DB_FILE, 'utf8');

const startMarker = 'const SEED_CODING_PROBLEMS = [';
const endMarker = '];\n\n// Seed Sprints and Benchmarks';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers in database.js!");
    process.exit(1);
}

const NEW_SEED_CODING_PROBLEMS = `const SEED_CODING_PROBLEMS = [
    {
        id: "two-sum",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        acceptance: "51.2%",
        category: "Arrays & Hash Tables",
        tags: ["Array", "Hash Table", "Two Pointers"],
        companyTags: ["Amazon", "Google", "Microsoft", "TCS Prime", "Infosys DSE"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: \`Given an array of integers \\\`nums\\\` and an integer \\\`target\\\`, return **indices of the two numbers such that they add up to \\\`target\\\`**.\\n\\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\\n\\nYou can return the answer in any order.\\n\\n### Algorithmic Objective\\nAchieve strictly **O(n) time complexity** and **O(n) space complexity** using a single-pass hash map.\`,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "nums[1] + nums[2] == 2 + 4 == 6, return [1, 2]."
            },
            {
                input: "nums = [3,3], target = 6",
                output: "[0,1]",
                explanation: "nums[0] + nums[1] == 3 + 3 == 6, return [0, 1]."
            }
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Exactly one valid answer exists."
        ],
        starterCode: {
            javascript: \`/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction twoSum(nums, target) {\\n    // TODO: Implement solution\\n    return [];\\n}\`,
            python: \`class Solution:\\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\\n        # TODO: Implement solution\\n        pass\`,
            cpp: \`#include <vector>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        // TODO: Implement solution\\n        return {};\\n    }\\n};\`,
            java: \`class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        // TODO: Implement solution\\n        return new int[]{};\\n    }\\n}\`
        }
    },
    {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        acceptance: "34.8%",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        companyTags: ["Amazon", "Microsoft", "Adobe", "Razorpay"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: \`Given a string \\\`s\\\`, find the length of the **longest substring** without repeating characters.\\n\\n### Complexity Benchmark\\n- **Target Time Complexity**: O(n)\\n- **Target Space Complexity**: O(min(m, n)) where m is charset size.\`,
        examples: [
            {
                input: 's = "abcabcbb"',
                output: "3",
                explanation: 'The answer is "abc", with the length of 3.'
            },
            {
                input: 's = "bbbbb"',
                output: "1",
                explanation: 'The answer is "b", with the length of 1.'
            },
            {
                input: 's = "pwwkew"',
                output: "3",
                explanation: 'The answer is "wke", with the length of 3. Notice "pwke" is a subsequence, not a substring.'
            }
        ],
        constraints: [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        starterCode: {
            javascript: \`/**\\n * @param {string} s\\n * @return {number}\\n */\\nfunction lengthOfLongestSubstring(s) {\\n    // TODO: Implement solution\\n    return 0;\\n}\`,
            python: \`class Solution:\\n    def lengthOfLongestSubstring(self, s: str) -> int:\\n        # TODO: Implement solution\\n        pass\`,
            cpp: \`#include <string>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    int lengthOfLongestSubstring(string s) {\\n        // TODO: Implement solution\\n        return 0;\\n    }\\n};\`,
            java: \`class Solution {\\n    public int lengthOfLongestSubstring(String s) {\\n        // TODO: Implement solution\\n        return 0;\\n    }\\n}\`
        }
    },
    {
        id: "lru-cache",
        title: "LRU Cache Architecture",
        slug: "lru-cache",
        difficulty: "Hard",
        acceptance: "42.1%",
        category: "System Data Structures",
        tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
        companyTags: ["Google", "Amazon", "Apple", "Uber", "Flipkart"],
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: \`Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.\\n\\nImplement the \\\`LRUCache\\\` class:\\n- \\\`LRUCache(int capacity)\\\`: Initialize LRU cache with positive size capacity.\\n- \\\`int get(int key)\\\`: Return the value of the key if key exists, otherwise return \\\`-1\\\`.\\n- \\\`void put(int key, int value)\\\`: Update the value of the key if present. Otherwise, insert the key-value pair. If keys exceed capacity, evict the least recently used key.\\n\\n### Requirement\\nBoth \\\`get\\\` and \\\`put\\\` functions MUST run in **O(1) average time complexity**.\`,
        examples: [
            {
                input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
                output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
                explanation: "Key 2 is evicted when key 3 is added. Key 1 is evicted when key 4 is added."
            }
        ],
        constraints: [
            "1 <= capacity <= 3000",
            "0 <= key <= 10^4",
            "0 <= value <= 10^5",
            "At most 2 * 10^5 calls will be made to get and put."
        ],
        starterCode: {
            javascript: \`/**\\n * Your LRUCache object will be instantiated and called as such:\\n * var obj = new LRUCache(capacity)\\n * var param_1 = obj.get(key)\\n * obj.put(key,value)\\n */\\nclass LRUCache {\\n    /**\\n     * @param {number} capacity\\n     */\\n    constructor(capacity) {\\n        // TODO: Initialize data structures\\n    }\\n\\n    /** \\n     * @param {number} key\\n     * @return {number}\\n     */\\n    get(key) {\\n        // TODO: Implement get\\n        return -1;\\n    }\\n\\n    /** \\n     * @param {number} key \\n     * @param {number} value\\n     * @return {void}\\n     */\\n    put(key, value) {\\n        // TODO: Implement put\\n    }\\n}\`,
            python: \`class LRUCache:\\n    def __init__(self, capacity: int):\\n        # TODO: Initialize data structures\\n        pass\\n\\n    def get(self, key: int) -> int:\\n        # TODO: Implement get\\n        return -1\\n\\n    def put(self, key: int, value: int) -> None:\\n        # TODO: Implement put\\n        pass\`,
            cpp: \`class LRUCache {\\npublic:\\n    LRUCache(int capacity) {\\n        // TODO: Initialize data structures\\n    }\\n    \\n    int get(int key) {\\n        // TODO: Implement get\\n        return -1;\\n    }\\n    \\n    void put(int key, int value) {\\n        // TODO: Implement put\\n    }\\n};\`,
            java: \`class LRUCache {\\n    public LRUCache(int capacity) {\\n        // TODO: Initialize data structures\\n    }\\n    \\n    public int get(int key) {\\n        // TODO: Implement get\\n        return -1;\\n    }\\n    \\n    public void put(int key, int value) {\\n        // TODO: Implement put\\n    }\\n}\`
        }
    },
    {
        id: "merge-intervals",
        title: "Merge Intervals",
        slug: "merge-intervals",
        difficulty: "Medium",
        acceptance: "47.1%",
        category: "Interval Scheduling",
        tags: ["Array", "Sorting", "Intervals"],
        companyTags: ["Meta", "Google", "Amazon", "Uber", "TCS Digital"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: \`Given an array of \\\`intervals\\\` where \\\`intervals[i] = [start_i, end_i]\\\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all intervals in the input*.\\n\\n### Complexity Constraint\\nTarget **O(n log n)** time complexity due to sorting.\`,
        examples: [
            {
                input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                output: "[[1,6],[8,10],[15,18]]",
                explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
            },
            {
                input: "intervals = [[1,4],[4,5]]",
                output: "[[1,5]]",
                explanation: "Intervals [1,4] and [4,5] are considered overlapping at point 4."
            }
        ],
        constraints: [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= start_i <= end_i <= 10^4"
        ],
        starterCode: {
            javascript: \`/**\\n * @param {number[][]} intervals\\n * @return {number[][]}\\n */\\nfunction merge(intervals) {\\n    // TODO: Implement solution\\n    return [];\\n}\`,
            python: \`class Solution:\\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\\n        # TODO: Implement solution\\n        pass\`,
            cpp: \`#include <vector>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\\n        // TODO: Implement solution\\n        return {};\\n    }\\n};\`,
            java: \`class Solution {\\n    public int[][] merge(int[][] intervals) {\\n        // TODO: Implement solution\\n        return new int[][]{};\\n    }\\n}\`
        }
    },
    {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        slug: "trapping-rain-water",
        difficulty: "Hard",
        acceptance: "60.4%",
        category: "Two Pointers & Geometry",
        tags: ["Array", "Two Pointers", "Dynamic Programming", "Monotonic Stack"],
        companyTags: ["Google", "Amazon", "Atlassian", "Goldman Sachs"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: \`Given \\\`n\\\` non-negative integers representing an elevation map where the width of each bar is \\\`1\\\`, compute how much water it can trap after raining.\\n\\n### Requirement\\nAchieve **O(n) time** and **O(1) auxiliary space** using two converging pointers.\`,
        examples: [
            {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation: "The above elevation map traps 6 units of rain water."
            }
        ],
        constraints: [
            "n == height.length",
            "1 <= n <= 2 * 10^4",
            "0 <= height[i] <= 10^5"
        ],
        starterCode: {
            javascript: \`/**\\n * @param {number[]} height\\n * @return {number}\\n */\\nfunction trap(height) {\\n    // TODO: Implement solution\\n    return 0;\\n}\`,
            python: \`class Solution:\\n    def trap(self, height: list[int]) -> int:\\n        # TODO: Implement solution\\n        pass\`,
            cpp: \`#include <vector>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    int trap(vector<int>& height) {\\n        // TODO: Implement solution\\n        return 0;\\n    }\\n};\`,
            java: \`class Solution {\\n    public int trap(int[] height) {\\n        // TODO: Implement solution\\n        return 0;\\n    }\\n}\`
        }
    }`;

content = content.slice(0, startIndex) + NEW_SEED_CODING_PROBLEMS + content.slice(endIndex);
fs.writeFileSync(DB_FILE, content, 'utf8');
console.log("✅ Successfully replaced SEED_CODING_PROBLEMS in database.js!");
