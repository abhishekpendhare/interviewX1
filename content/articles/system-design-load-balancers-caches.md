---
title: "System Design Basics: Load Balancers, Caches, and Queues"
slug: "system-design-load-balancers-caches"
summary: "Foundational building blocks of distributed backend systems: L4/L7 load balancing algorithms, Redis caching strategies, and message queues."
category: "Tech Explainers"
tags: ["System Design", "Load Balancer", "Redis", "Caching", "Message Queue"]
author: "InterviewX Editorial Team"
coverImage: "/assets/articles/covers/system-design-load-balancers-caches.svg"
coverAlt: "Distributed system design architecture load balancer cache queue diagram"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
reviewedAt: "2026-10-31"
status: "published"
sources:
  - title: "Designing Data-Intensive Applications by Martin Kleppmann, O Reilly Media"
    url: "https://dataintensive.net"
    accessedDate: "2026-10-30"
  - title: "System Design Primer by Donne Martin (Open Source Curriculum)"
    url: "https://github.com/donnemartin/system-design-primer"
    accessedDate: "2026-10-30"
relatedModules:
  - title: "LRU Cache Design Challenge"
    url: "/compiler/lru-cache"
    type: "problem"
  - title: "System Architecture Interview Practice"
    url: "/practice?topic=architecture"
    type: "practice"
---

# System Design Basics: Load Balancers, Caches, and Queues

When interviewing for software engineering roles at top product startups and technology giants, candidates who can articulate high-level architectural trade-offs immediately stand out. Even in SDE-1 interviews, interviewers frequently ask: *"How would you design a system that scales from 1,000 to 1,000,000 daily active users without crashing the database?"*

Scaling a backend requires three foundational distributed primitives: **Load Balancers, Caches, and Message Queues**.

> **Key takeaways:**
> - Load Balancers operate at Layer 4 (Transport / TCP) for raw throughput or Layer 7 (Application / HTTP) for path-based routing and SSL termination.
> - Caching strategies (Cache-Aside, Write-Through, Write-Behind) trade data consistency for orders-of-magnitude reduction in database read latency.
> - Asynchronous message queues (Kafka, RabbitMQ, SQS) decouple critical path ingestion from heavy processing, protecting databases from traffic spikes.

## 1. Load Balancers (L4 vs L7)

A load balancer distributes incoming client traffic across a pool of backend servers to ensure high availability and prevent single-server saturation:

### Layer 4 (L4) Load Balancing
Operates at the transport layer (TCP/UDP). It does not inspect the HTTP payload or headers; it simply forwards packets based on IP addresses and ports. Extremely fast, low CPU overhead (e.g., AWS Network Load Balancer, HAProxy TCP mode).

### Layer 7 (L7) Load Balancing
Operates at the application layer. It parses the HTTP request, inspecting headers, cookies, and URI paths. Enables sophisticated routing:
- Routing `/api/v1/payments` to a dedicated high-security payment cluster.
- Terminating TLS/SSL certificates centrally before passing unencrypted traffic across a private VPC network.

### Common Balancing Algorithms
- **Round Robin**: Dispatches requests sequentially. Works best when servers have identical hardware and requests require uniform processing time.
- **Least Connections**: Forwards requests to the server with the fewest active TCP connections.
- **Consistent Hashing**: Hashes a client identifier (such as `user_id`) to map a user deterministically to the same server while minimizing remapping when nodes are added or removed.

## 2. In-Memory Caching (Redis and Memcached)

Reading data from an SSD or NVMe drive takes microseconds; reading from a relational database with complex joins takes milliseconds. Reading from memory (RAM) takes nanoseconds.

### The Cache-Aside Pattern
The most widely used caching strategy:
1. Application receives a read request.
2. Checks the cache (e.g., Redis). If cache hit, returns data immediately.
3. If cache miss, queries the relational database.
4. Stores the returned data in the cache with a Time-to-Live (TTL) and returns the response.

### Python Simulation: Round-Robin Load Balancer

```python
class RoundRobinBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.current_idx = 0

    def get_server(self):
        if not self.servers:
            return None
        server = self.servers[self.current_idx]
        self.current_idx = (self.current_idx + 1) % len(self.servers)
        return server

# Verify balancer dispatch
cluster = ["10.0.1.1:8080", "10.0.1.2:8080", "10.0.1.3:8080"]
lb = RoundRobinBalancer(cluster)
dispatched = [lb.get_server() for _ in range(6)]
print("Dispatched requests:", dispatched)
```

## 3. Asynchronous Message Queues

In synchronous architectures, if a user uploads a video and the server processes it before responding, the client connection times out. A message queue decouples this workflow:
1. Client submits task; web server pushes message to queue (`video.transcode`) and immediately responds: `202 Accepted`.
2. Dedicated worker pools consume tasks from the queue at a sustainable rate.
3. Backpressure is absorbed by the queue rather than exhausting database connections.

Practice low-level caching design in our code arena:
- [Implement an In-Memory LRU Cache](/compiler/lru-cache)
- [Review Architecture Fundamentals](/practice?topic=architecture)
