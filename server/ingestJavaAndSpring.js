const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db/store.json');

// ─────────────────────────────────────────────────────────────────────────────
// 1. JAVA FOUNDATION QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const JAVA_FOUNDATION_QUESTIONS = [
    {
        id: "q-java-01",
        subject: "Java Foundation",
        topic: "Object-Oriented Programming in Java",
        subtopic: "Polymorphism & Method Overriding",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Method Overriding vs Method Hiding with Static Methods",
        description: "What happens in Java when a subclass defines a static method with the exact same signature as a static method in its superclass?",
        options: [
            "It is polymorphic method overriding resolved dynamically at runtime using the vtable",
            "It is method hiding (shadowing) resolved statically at compile time based on the reference type",
            "It results in a compile-time error because static methods cannot share names across hierarchy",
            "The superclass method is permanently replaced across all classloaders"
        ],
        correctAnswerIndex: 1,
        explanation: "In Java, static methods belong to the class, not the instance. When a subclass declares a static method with identical signature, it hides the superclass method. The method invoked is determined at compile-time by the declared reference type, not the runtime object.",
        hints: ["Think about whether static methods participate in runtime dynamic dispatch via virtual tables."],
        conceptTags: ["java", "oop", "static-methods", "method-hiding"]
    },
    {
        id: "q-java-02",
        subject: "Java Foundation",
        topic: "Java Collections Framework",
        subtopic: "Concurrent Collections & Internals",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "ConcurrentHashMap Synchronization Mechanism in Java 8+",
        description: "How does Java 8+ `ConcurrentHashMap` achieve thread-safe put/get operations without locking the entire map like `Hashtable`?",
        options: [
            "It uses 16 distinct Segment locks (ReentrantLock) across the bucket array",
            "It uses lock-free CAS (Compare-And-Swap) for empty bucket insertion and `synchronized` blocks on only the specific bucket head node for collisions",
            "It uses ReadWriteLock across each quadrant of the table",
            "It creates an immutable copy of the array on every write (Copy-On-Write)"
        ],
        correctAnswerIndex: 1,
        explanation: "Java 8 replaced segment locking with CAS (Unsafe.compareAndSwapObject) for the first node in an empty bucket. For collisions, it synchronizes only on the head node of that specific bucket chain/tree, maximizing write concurrency across non-colliding buckets. Reads are fully lock-free via volatile val and next pointers.",
        hints: ["How does Java 8 avoid holding any locks when a bucket is initially empty?"],
        conceptTags: ["java", "collections", "concurrenthashmap", "cas", "multithreading"]
    },
    {
        id: "q-java-03",
        subject: "Java Foundation",
        topic: "Java Memory Model & JVM Internals",
        subtopic: "Garbage Collection & Memory Regions",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "G1 Garbage Collector Region Partitioning & Pause Time Target",
        description: "How does the G1 (Garbage-First) GC differ fundamentally from traditional CMS/Parallel GC in its heap memory organization?",
        options: [
            "It eliminates Young generation and stores all objects in a single contiguous Tenured space",
            "It splits the entire heap into equal-sized non-contiguous virtual memory regions (1MB–32MB) that can dynamically act as Eden, Survivor, or Old generation",
            "It uses reference counting on object headers instead of reachability graphs",
            "It only collects memory when the JVM process receives a SIGTERM signal"
        ],
        correctAnswerIndex: 1,
        explanation: "G1 GC divides the heap into 2048 equal-sized regions (1MB to 32MB). Generations (Eden, Survivor, Old) are logical sets of non-contiguous regions rather than fixed physical blocks. G1 tracks region liveness and prioritizes collecting regions with the most garbage ('Garbage-First') within a user-specified pause time target (-XX:MaxGCPauseMillis).",
        hints: ["Are Eden and Old generations in G1 physically contiguous in RAM?"],
        conceptTags: ["java", "jvm", "garbage-collection", "g1gc", "memory-management"]
    },
    {
        id: "q-java-04",
        subject: "Java Foundation",
        topic: "Multithreading & Concurrency",
        subtopic: "Volatile Keyword & Memory Barriers",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "The `volatile` Keyword and Happens-Before Invariant",
        description: "What guarantees does declaring a variable `volatile` in Java provide according to the Java Memory Model (JMM)?",
        options: [
            "Atomic increment operations (e.g. count++) without locking",
            "Visibility (flushes CPU cache to main memory) and ordering (prevents instruction reordering across volatile reads/writes via memory barriers)",
            "Automatic mutual exclusion across multiple threads during complex multi-step updates",
            "Stores the variable on the CPU register permanently"
        ],
        correctAnswerIndex: 1,
        explanation: "`volatile` guarantees visibility (all threads read the most recent write directly from main memory) and establishes a 'happens-before' relationship preventing compiler/CPU instruction reordering. However, it does NOT guarantee atomicity for compound operations like `i++` (which requires AtomicInteger or locks).",
        hints: ["Why is volatile alone not enough to implement a thread-safe counter?"],
        conceptTags: ["java", "multithreading", "volatile", "jmm", "memory-barriers"]
    },
    {
        id: "q-java-05",
        subject: "Java Foundation",
        topic: "Exception Handling & Resource Management",
        subtopic: "Try-with-Resources & AutoCloseable",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Suppressed Exceptions in Java Try-with-Resources",
        description: "In a Java `try-with-resources` block, what happens if both the `try` block and the resource's `close()` method throw an exception?",
        options: [
            "The `close()` exception overrides and discards the `try` block exception completely",
            "The `try` block exception is thrown, and the `close()` exception is attached to it as a suppressed exception accessible via `getSuppressed()`",
            "The JVM terminates immediately with an uncatchable FatalError",
            "Both exceptions are merged into a single chained SQLException"
        ],
        correctAnswerIndex: 1,
        explanation: "Try-with-resources preserves the primary exception thrown by the try block. Any subsequent exceptions thrown during automatic resource closing are added as 'suppressed exceptions' (Throwable.getSuppressed()), preventing critical root-cause stack traces from being swallowed.",
        hints: ["Which exception is the root cause of the business logic failure?"],
        conceptTags: ["java", "exceptions", "try-with-resources", "autocloseable"]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. SPRING & SPRING BOOT QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SPRING_QUESTIONS = [
    {
        id: "q-spring-01",
        subject: "Spring & Spring Boot",
        topic: "Dependency Injection & IoC Container",
        subtopic: "Bean Scopes & Lifecycle",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Injecting a Prototype-Scoped Bean into a Singleton-Scoped Bean",
        description: "What happens when a Spring `@Scope(\"prototype\")` bean is directly `@Autowired` into a default `@Scope(\"singleton\")` service bean?",
        options: [
            "A new prototype bean instance is created on every client HTTP request to the singleton service",
            "The prototype bean is instantiated only ONCE during singleton initialization, behaving effectively as a singleton unless `@Lookup` or `ObjectProvider` is used",
            "Spring throws a BeanCreationException at application startup due to conflicting lifecycle scopes",
            "The singleton bean is automatically converted into a prototype bean"
        ],
        correctAnswerIndex: 1,
        explanation: "Because the singleton bean is only instantiated once during startup, its dependencies are injected only once. The prototype bean injected during that initialization remains fixed for the lifetime of the singleton. To get a new prototype instance per method call, you must use `@Lookup` method injection or `ObjectProvider<T>` / `ApplicationContext.getBean()`.",
        hints: ["How many times does the IoC container instantiate and wire the singleton bean?"],
        conceptTags: ["spring", "ioc", "bean-scopes", "singleton", "prototype"]
    },
    {
        id: "q-spring-02",
        subject: "Spring & Spring Boot",
        topic: "Spring Data JPA & Hibernate",
        subtopic: "N+1 Query Problem & Fetch Strategies",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "Mitigating the N+1 Select Problem in Spring Data JPA",
        description: "You have an `Author` entity with `@OneToMany(fetch = FetchType.LAZY) List<Book> books`. When executing `authorRepository.findAll()`, 1 query loads 100 authors, and iterating each triggers 100 additional queries. What is the standard production solution in Spring Data JPA?",
        options: [
            "Change fetch type to `FetchType.EAGER` across all relationships",
            "Use a `@Query` with `JOIN FETCH a.books` or an `@EntityGraph(attributePaths = {\"books\"})` to fetch authors and books in a single SQL query",
            "Wrap the repository call in `@Transactional(readOnly = true)` without changing the query",
            "Disable Hibernate second-level cache in application.properties"
        ],
        correctAnswerIndex: 1,
        explanation: "`JOIN FETCH` and `@EntityGraph` instruct Hibernate to generate a single SQL query with an inner/left join fetching the child collection eagerly in one round-trip, completely resolving the N+1 select problem. Changing to FetchType.EAGER does NOT solve N+1 on `findAll()` calls and causes unwanted queries elsewhere.",
        hints: ["Which JPA keyword overrides lazy loading for a specific repository query using an explicit SQL join?"],
        conceptTags: ["spring", "spring-data-jpa", "hibernate", "n-plus-1", "performance"]
    },
    {
        id: "q-spring-03",
        subject: "Spring & Spring Boot",
        topic: "REST Controllers & Architecture",
        subtopic: "Global Exception Handling",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "`@RestControllerAdvice` and RFC 7807 Problem Details",
        description: "How does Spring Boot 3 handle centralized error responses consistently across all `@RestController` endpoints?",
        options: [
            "By writing a servlet Filter that wraps HttpServletResponse output stream",
            "Using `@RestControllerAdvice` with `@ExceptionHandler` methods returning Spring's `ProblemDetail` class conforming to RFC 7807",
            "Catching exceptions in each individual controller method using try-catch blocks",
            "Configuring server.error.include-stacktrace=always in YAML"
        ],
        correctAnswerIndex: 1,
        explanation: "`@RestControllerAdvice` acts as a global interceptor for exceptions thrown from controller methods. Spring Boot 3 integrates RFC 7807 (Problem Details for HTTP APIs) through the `ProblemDetail` class, providing standard structured error payloads with type, title, status, detail, and custom properties.",
        hints: ["Which annotation combines @ControllerAdvice and @ResponseBody for centralized REST error handling?"],
        conceptTags: ["spring-boot", "rest-api", "exception-handling", "rfc7807"]
    },
    {
        id: "q-spring-04",
        subject: "Spring & Spring Boot",
        topic: "Spring Security & Filter Chains",
        subtopic: "Stateless JWT Authentication",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "Spring Security Filter Chain Positioning for JWT Validation",
        description: "In a stateless Spring Boot REST API using JWT tokens, where should the custom `JwtAuthenticationFilter` be positioned in the `SecurityFilterChain`?",
        options: [
            "After `LogoutFilter` and before `AnonymousAuthenticationFilter`",
            "Before `UsernamePasswordAuthenticationFilter.class` so the `SecurityContext` is populated before standard authorization checks",
            "As an interceptor in `WebMvcConfigurer` instead of the Security filter chain",
            "At the very end of the filter chain after response serialization"
        ],
        correctAnswerIndex: 1,
        explanation: "By registering `http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`, the JWT filter parses the Authorization header, validates the signature, and sets the authenticated `UsernamePasswordAuthenticationToken` in the `SecurityContextHolder` before downstream security filters evaluate access rules.",
        hints: ["Where must authentication credentials be set before role-based authorization filters check permissions?"],
        conceptTags: ["spring-security", "jwt", "filter-chain", "authentication"]
    },
    {
        id: "q-spring-05",
        subject: "Spring & Spring Boot",
        topic: "Spring Core & Transactions",
        subtopic: "@Transactional Proxies & Self-Invocation",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "`@Transactional` Self-Invocation Gotcha in Spring",
        description: "In a Spring service class, method `public void processOrder()` (without `@Transactional`) calls another method in the same class: `public void savePayment()` (which is annotated with `@Transactional`). What happens when `processOrder()` executes?",
        options: [
            "A new transaction is created and committed around `savePayment()` via CGLIB proxy dispatch",
            "No transaction is started for `savePayment()` because internal method calls bypass the Spring AOP proxy (`this.savePayment()` calls the target object directly)",
            "Spring throws an IllegalTransactionStateException",
            "The entire JVM process locks until an explicit commit call is made"
        ],
        correctAnswerIndex: 1,
        explanation: "Spring manages transactions via AOP proxies (CGLIB or JDK dynamic proxies). When a method is called from outside the bean, the call passes through the proxy which opens/commits the transaction. When a method calls another method within the same class (`this.method()`), the call bypasses the proxy, and the `@Transactional` annotation is silently ignored.",
        hints: ["How do Spring proxies intercept method calls between different beans versus internal self-invocation?"],
        conceptTags: ["spring", "aop", "transactional", "proxies", "gotcha"]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. MULTI-PART PRACTICE ASSIGNMENTS (Complex Hands-on Exercises)
// ─────────────────────────────────────────────────────────────────────────────
const MULTI_PART_ASSIGNMENTS = [
    {
        id: "asgn-java-spring-01",
        subject: "Java & Spring Boot",
        topic: "High-Concurrency Backend Engineering",
        subtopic: "In-Memory LRU Cache with REST & Concurrency Invariants",
        difficulty: "Hard",
        questionType: "assignment",
        title: "Assignment: Thread-Safe LRU Cache Service with Spring Boot Actuator",
        description: `### Engineering Scenario
You are building an in-memory feature cache for a low-latency recommendation engine.
The service must store key-value feature vectors with a fixed maximum capacity and strictly O(1) read/write operations while handling concurrent threads.

### Milestone 1 — Core Algorithm ($O(1)$ LRU Invariants)
Implement a generic \`LRUCache<K, V>\` using a doubly-linked list + \`ConcurrentHashMap\` or synchronization:
1. \`get(K key)\`: Returns the value and moves the accessed node to the head of the list ($O(1)$).
2. \`put(K key, V value)\`: Inserts or updates the value. If capacity is exceeded, evicts the least-recently used node from the tail ($O(1)$).
3. Ensure thread safety without coarse-grained global locks on reads.

### Milestone 2 — Spring Boot REST Controller & Dependency Injection
1. Expose \`POST /api/cache/{key}\` and \`GET /api/cache/{key}\`.
2. Provide a custom Actuator metric (\`/actuator/metrics/cache.hit.ratio\`) tracking cache hits vs misses.
3. Add a global \`@RestControllerAdvice\` returning RFC 7807 ProblemDetails for cache misses (\`404 Not Found\`).

### Milestone 3 — Unit & Concurrency Test Verification
Write a JUnit 5 test using \`ExecutorService\` and \`CountDownLatch\` with 50 concurrent threads verifying:
- No deadlocks occur under concurrent read/write load.
- Exact capacity limit is never breached at any point.`,
        requirements: [
            "Strict O(1) time complexity for both get and put operations",
            "Thread-safe synchronization using ReentrantReadWriteLock or ConcurrentHashMap + synchronized node locks",
            "Spring Boot REST controller with global exception handling",
            "Concurrent JUnit 5 test suite verifying race-condition resilience"
        ],
        deliverables: [
            "LRUCache.java (core data structure)",
            "CacheService.java & CacheController.java (Spring Boot service layer)",
            "CacheConcurrencyTest.java (multi-threaded validation)"
        ],
        conceptTags: ["java", "spring-boot", "lru-cache", "concurrency", "assignment", "rest-api"]
    },
    {
        id: "asgn-dbms-sql-01",
        subject: "DBMS & Systems",
        topic: "Database Architecture & Optimization",
        subtopic: "E-Commerce Transaction Engine with Optimistic Locking",
        difficulty: "Hard",
        questionType: "assignment",
        title: "Assignment: High-Throughput Flash Sale Inventory Engine with Zero Overselling",
        description: `### Engineering Scenario
Design and implement a flash sale inventory deduction system for an e-commerce platform where 10,000 users attempt to purchase from a limited stock of 100 items simultaneously.

### Milestone 1 — Relational Schema & Invariants
Create a PostgreSQL schema with:
1. \`products\` table: \`id\`, \`name\`, \`total_stock\`, \`available_stock\`, \`version\` (for optimistic locking).
2. \`orders\` table: \`id\`, \`user_id\`, \`product_id\`, \`quantity\`, \`status\`, \`created_at\`.
3. Strict check constraints: \`available_stock >= 0\`.

### Milestone 2 — Concurrency & Locking Strategy
Implement and contrast two deduction mechanisms:
1. **Optimistic Locking**: \`UPDATE products SET available_stock = available_stock - :qty, version = version + 1 WHERE id = :id AND version = :version AND available_stock >= :qty\`. Handle retry storm mitigation with exponential backoff.
2. **Pessimistic Locking**: \`SELECT * FROM products WHERE id = :id FOR UPDATE\`.

### Milestone 3 — Idempotency & Distributed Deduplication
1. Accept an \`Idempotency-Key\` HTTP header.
2. Guarantee that network retries by the client never deduct inventory twice or generate duplicate orders.`,
        requirements: [
            "Zero overselling guarantee under 10,000 concurrent purchase requests",
            "Optimistic vs Pessimistic locking implementation benchmarks",
            "Idempotency-Key handling with Redis or DB unique index",
            "Full ACID transaction boundary verification"
        ],
        deliverables: [
            "schema.sql with DDL and indexes",
            "InventoryDeductionService.java with optimistic locking retry loop",
            "FlashSaleConcurrencyTest.java validating zero overselling"
        ],
        conceptTags: ["dbms", "sql", "transactions", "optimistic-locking", "idempotency", "assignment"]
    },
    {
        id: "asgn-dsa-systems-01",
        subject: "Algorithms & Data Structures",
        topic: "Distributed Systems & Streaming",
        subtopic: "Sliding Window Rate Limiter & Token Bucket",
        difficulty: "Hard",
        questionType: "assignment",
        title: "Assignment: Distributed API Rate Limiter using Sliding Window Counter",
        description: `### Engineering Scenario
Design and implement a production-grade distributed API rate limiter enforcing a limit of 100 requests per minute per API key.

### Milestone 1 — Algorithm Design (Sliding Window Log vs Counter)
1. Implement the **Sliding Window Counter** algorithm combining the low memory of fixed windows with the smoothness of sliding logs.
2. Memory budget: $\\le 128$ bytes per active API key.

### Milestone 2 — Thread Safety & Distributed State
1. Implement local in-memory thread safety using atomic primitives (\`AtomicInteger\` / \`LongAdder\`).
2. Provide a distributed adapter pattern for Redis using atomic Lua scripts (\`EVAL\`) to prevent race conditions across multiple application servers.

### Milestone 3 — HTTP Middleware / Filter Integration
1. Intercept incoming requests and return standard rate limit headers:
   - \`X-RateLimit-Limit: 100\`
   - \`X-RateLimit-Remaining: 42\`
   - \`X-RateLimit-Reset: 1718901234\`
2. Return HTTP \`429 Too Many Requests\` with \`Retry-After\` when limit is breached.`,
        requirements: [
            "Sliding window counter algorithm with fractional previous window interpolation",
            "Atomic execution without race conditions under parallel requests",
            "Standard HTTP 429 response formatting with RateLimit headers",
            "Benchmark showing sub-millisecond evaluation latency"
        ],
        deliverables: [
            "SlidingWindowRateLimiter.java",
            "RateLimiterFilter.java",
            "RateLimiterBenchmarkTest.java"
        ],
        conceptTags: ["dsa", "rate-limiter", "distributed-systems", "algorithms", "assignment"]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTE INGESTION & DISK WRITE
// ─────────────────────────────────────────────────────────────────────────────
function ingestContent() {
    console.log('========================================================================');
    console.log('📦 STRATA CONTENT INGESTION: JAVA FOUNDATION, SPRING & ASSIGNMENTS');
    console.log('========================================================================\n');

    let store = {};
    if (fs.existsSync(DB_FILE)) {
        store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    if (!store.questions) store.questions = [];

    const existingIds = new Set(store.questions.map(q => q.id));

    let addedJava = 0;
    let addedSpring = 0;
    let addedAssignments = 0;

    JAVA_FOUNDATION_QUESTIONS.forEach(q => {
        if (!existingIds.has(q.id)) {
            store.questions.push(q);
            existingIds.add(q.id);
            addedJava++;
        }
    });

    SPRING_QUESTIONS.forEach(q => {
        if (!existingIds.has(q.id)) {
            store.questions.push(q);
            existingIds.add(q.id);
            addedSpring++;
        }
    });

    MULTI_PART_ASSIGNMENTS.forEach(a => {
        if (!existingIds.has(a.id)) {
            store.questions.push(a);
            existingIds.add(a.id);
            addedAssignments++;
        }
    });

    // Write back to store.json
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');

    console.log(`[Ingestion Result]`);
    console.log(`  • Added ${addedJava} Java Foundation Questions`);
    console.log(`  • Added ${addedSpring} Spring & Spring Boot Questions`);
    console.log(`  • Added ${addedAssignments} Multi-Part Practice Assignments`);

    // Verification by re-reading disk
    const reloaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const totalQuestions = reloaded.questions.length;
    const javaCount = reloaded.questions.filter(q => q.subject === 'Java Foundation').length;
    const springCount = reloaded.questions.filter(q => q.subject === 'Spring & Spring Boot').length;
    const asgnCount = reloaded.questions.filter(q => q.questionType === 'assignment').length;

    console.log('\n[Verified Real Counts on Disk]:');
    console.log(`  • Total Question Pool: ${totalQuestions}`);
    console.log(`  • Java Foundation Questions: ${javaCount}`);
    console.log(`  • Spring & Spring Boot Questions: ${springCount}`);
    console.log(`  • Multi-Part Engineering Assignments: ${asgnCount}`);
    console.log('========================================================================\n');
}

ingestContent();
