const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../db/database.js');
const STORE_FILE = path.join(__dirname, '../db/store.json');
const COMPANY_FILE = path.join(__dirname, '../ingestion/sources/companyProblems.js');

console.log("=== MIGRATING PROBLEM DATA TO STRIP ALL SOLUTIONS ===");

// 1. Clean starter code definitions
const CLEAN_STARTERS = {
    "two-sum": {
        javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // TODO: Implement solution\n    return [];\n}`,
        python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # TODO: Implement solution\n        pass`,
        cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // TODO: Implement solution\n        return {};\n    }\n};`,
        java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: Implement solution\n        return new int[]{};\n    }\n}`
    },
    "longest-substring-without-repeating-characters": {
        javascript: `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    // TODO: Implement solution\n    return 0;\n}`,
        python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # TODO: Implement solution\n        pass`,
        cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // TODO: Implement solution\n        return 0;\n    }\n};`,
        java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // TODO: Implement solution\n        return 0;\n    }\n}`
    },
    "lru-cache": {
        javascript: `/**\n * Your LRUCache object will be instantiated and called as such:\n * var obj = new LRUCache(capacity)\n * var param_1 = obj.get(key)\n * obj.put(key,value)\n */\nclass LRUCache {\n    /**\n     * @param {number} capacity\n     */\n    constructor(capacity) {\n        // TODO: Initialize data structures\n    }\n\n    /** \n     * @param {number} key\n     * @return {number}\n     */\n    get(key) {\n        // TODO: Implement get\n        return -1;\n    }\n\n    /** \n     * @param {number} key \n     * @param {number} value\n     * @return {void}\n     */\n    put(key, value) {\n        // TODO: Implement put\n    }\n}`,
        python: `class LRUCache:\n    def __init__(self, capacity: int):\n        # TODO: Initialize data structures\n        pass\n\n    def get(self, key: int) -> int:\n        # TODO: Implement get\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        # TODO: Implement put\n        pass`,
        cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // TODO: Initialize data structures\n    }\n    \n    int get(int key) {\n        // TODO: Implement get\n        return -1;\n    }\n    \n    void put(int key, int value) {\n        // TODO: Implement put\n    }\n};`,
        java: `class LRUCache {\n    public LRUCache(int capacity) {\n        // TODO: Initialize data structures\n    }\n    \n    public int get(int key) {\n        // TODO: Implement get\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        // TODO: Implement put\n    }\n}`
    },
    "merge-intervals": {
        javascript: `/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n    // TODO: Implement solution\n    return [];\n}`,
        python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # TODO: Implement solution\n        pass`,
        cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // TODO: Implement solution\n        return {};\n    }\n};`,
        java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // TODO: Implement solution\n        return new int[][]{};\n    }\n}`
    },
    "trapping-rain-water": {
        javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n    // TODO: Implement solution\n    return 0;\n}`,
        python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        # TODO: Implement solution\n        pass`,
        cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // TODO: Implement solution\n        return 0;\n    }\n};`,
        java: `class Solution {\n    public int trap(int[] height) {\n        // TODO: Implement solution\n        return 0;\n    }\n}`
    }
};

// 2. Clean store.json
if (fs.existsSync(STORE_FILE)) {
    const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    if (store.codingProblems) {
        store.codingProblems = store.codingProblems.map(p => {
            const clean = { ...p };
            delete clean.testCases;
            delete clean.solution;
            delete clean.editorial;
            delete clean.referenceSolutions;
            if (CLEAN_STARTERS[clean.id]) {
                clean.starterCode = CLEAN_STARTERS[clean.id];
            }
            return clean;
        });
        fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
        console.log("✅ Cleaned store.json codingProblems");
    }
}
