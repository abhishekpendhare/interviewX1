---
title: "Java Collections Framework Cheat Sheet and Internals"
slug: "java-collections-cheat-sheet"
summary: "Detailed analysis of ArrayList, LinkedList, HashMap bucket collision handling, TreeMap red-black balancing, and ConcurrentHashMap locking."
category: "Tech Explainers"
tags: ["Java", "Collections", "HashMap", "Data Structures", "Backend"]
author: "InterviewX Editorial Team"
coverImage: "/assets/articles/covers/java-collections-cheat-sheet.svg"
coverAlt: "Java Collections Framework hierarchy and HashMap internals"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
reviewedAt: "2026-10-31"
status: "published"
sources:
  - title: "Oracle Java Standard Edition 21 API Specification: java.util"
    url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html"
    accessedDate: "2026-10-30"
  - title: "Effective Java (3rd Edition) by Joshua Bloch"
    url: "https://www.pearson.com"
    accessedDate: "2026-10-30"
relatedModules:
  - title: "Two Sum Problem (HashMap Optimization)"
    url: "/compiler/two-sum"
    type: "problem"
  - title: "Java Core Technical Assessment"
    url: "/practice?topic=java"
    type: "practice"
---

# Java Collections Framework Cheat Sheet and Internals

In technical interviews for Java backend positions, interviewers rarely ask you to recite definitions. Instead, they probe deep into internal data structures and memory layouts: *"What happens inside a `HashMap` when two keys produce the same hash code?"*, *"Why does an `ArrayList` expand by 50% instead of 100%?"*, and *"How does `ConcurrentHashMap` avoid locking the entire map during writes?"*

This cheat sheet breaks down the mechanical implementation of core Java collections, their asymptotic complexities, and how to answer advanced concurrency questions.

> **Key takeaways:**
> - `ArrayList` provides $O(1)$ indexed reads and amortized $O(1)$ appends, resizing by $1.5\times$ (bit-shift `oldCapacity + (oldCapacity >> 1)`).
> - In Java 8+, `HashMap` buckets convert from a linked list to a Red-Black Tree (`TreeNode`) when collisions reach the `TREEIFY_THRESHOLD` of 8 and capacity is at least 64.
> - `ConcurrentHashMap` eliminates table-level synchronization by using compare-and-swap (CAS) for empty bucket insertions and synchronizing only the head node of a collided bucket.

## 1. Quick Complexity Matrix

| Collection | Underlying Structure | Access / Get | Insert | Delete | Thread-Safe? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ArrayList` | Dynamic Object Array | $O(1)$ | Amortized $O(1)$ | $O(n)$ | ❌ No |
| `LinkedList` | Doubly-Linked List | $O(n)$ | $O(1)$ at ends | $O(1)$ at ends | ❌ No |
| `HashMap` | Array of Buckets (List/RB-Tree) | $O(1)$ average | $O(1)$ average | $O(1)$ average | ❌ No |
| `TreeMap` | Red-Black Balanced BST | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | ❌ No |
| `ConcurrentHashMap` | Segmented CAS + Synced Node | $O(1)$ lock-free | $O(1)$ bucket lock | $O(1)$ bucket lock | ✅ Yes |

## 2. HashMap Collision Internals

A `HashMap` stores data in an array of `Node<K,V>` buckets. When you call `map.put(key, value)`:
1. **Hash Calculation**: `key.hashCode()` is computed and passed through a supplemental hash function:
   `(h = key.hashCode()) ^ (h >>> 16)`
   This spreads the higher-order bits into the lower bits to minimize collisions on small table capacities.
2. **Index Computation**: `index = (n - 1) & hash`, where $n$ is a power of 2.
3. **Collision Handling**:
   - If the bucket is empty, the new node is inserted directly.
   - If the bucket contains existing nodes, it traverses the linked list. If a key with identical hash and `equals()` is found, its value is overwritten.
   - If 8 nodes collide in a single bucket and the total table capacity is $\ge 64$, the bucket is converted into a balanced Red-Black Tree (`TreeNode`), reducing worst-case lookup from $O(n)$ to $O(\log n)$.

### Verified Java Traversal and Safe Modification

```java
import java.util.HashMap;
import java.util.Map;

public class CollectionsDemo {
    public static void main(String[] args) {
        Map<String, Integer> wordCounts = new HashMap<>();
        String[] words = {"apple", "banana", "apple", "orange", "banana", "apple"};

        for (String w : words) {
            wordCounts.put(w, wordCounts.getOrDefault(w, 0) + 1);
        }

        System.out.println("Apple frequency: " + wordCounts.get("apple"));
        System.out.println("Total distinct items: " + wordCounts.size());
    }
}
```

## 3. Practice Collections Under Real Interview Constraints

Test your understanding of hash maps and array invariants in the code arena:
- [Solve Two Sum Using a Single-Pass Hash Map](/compiler/two-sum)
- [Review Core Java Practice Assessments](/practice?topic=java)
