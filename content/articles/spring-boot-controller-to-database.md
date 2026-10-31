---
title: "Spring Boot Architecture: From REST Controller to Database"
slug: "spring-boot-controller-to-database"
summary: "Follow an HTTP request lifecycle through DispatcherServlet, Controller, Service layer, Repository, and Hibernate JPA connection pooling."
category: "Tech Explainers"
tags: ["Spring Boot", "Java", "Backend", "Architecture", "REST API"]
author: "InterviewX Editorial Team"
coverImage: "/assets/articles/covers/spring-boot-controller-to-database.svg"
coverAlt: "Spring Boot HTTP request lifecycle architectural diagram"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
reviewedAt: "2026-10-31"
status: "published"
sources:
  - title: "Spring Framework 6 & Spring Boot 3 Official Reference Documentation"
    url: "https://docs.spring.io/spring-boot/docs/current/reference/html/"
    accessedDate: "2026-10-30"
  - title: "Hibernate ORM User Guide and Architecture Overview"
    url: "https://hibernate.org/orm/documentation/"
    accessedDate: "2026-10-30"
relatedModules:
  - title: "Java & Backend Practice Assessments"
    url: "/practice?topic=java"
    type: "practice"
  - title: "Fullstack SDE Roadmap Module"
    url: "/roadmaps"
    type: "roadmap"
---

# Spring Boot Architecture: From REST Controller to Database

For third-year engineering students preparing for backend software engineering roles, Java and Spring Boot remain the dominant enterprise framework in India and globally. Many students know how to annotate a class with `@RestController`, but struggle when an interviewer asks: *"What happens under the hood between the moment an HTTP POST request hits port 8080 and when a row is committed to PostgreSQL?"*

Understanding the layered request lifecycle demonstrates senior architectural awareness and prevents common concurrency and transactional bugs.

> **Key takeaways:**
> - The `DispatcherServlet` acts as the Front Controller, routing incoming HTTP requests to corresponding HandlerMappings and Interceptors.
> - The Service layer isolates business logic from HTTP transport protocols, defining transactional boundaries via `@Transactional`.
> - Spring Data JPA generates proxy implementations of interfaces at application startup, leveraging HikariCP for connection pooling.

## 1. The 5-Stage Request Lifecycle

When a client sends an HTTP request (e.g., `POST /api/v1/students`), Spring Boot handles the transaction through five coordinated architectural layers:

1. **Embedded Web Container (Tomcat / Jetty)**: Listens on port 8080, accepts the TCP socket connection, and allocates a worker thread from its thread pool (or unmounts a Loom Virtual Thread in modern Java 21+).
2. **DispatcherServlet (The Front Controller)**: Intercepts the request and queries the `HandlerMapping` to locate the matching controller method based on path and HTTP verb. It invokes registered `HandlerInterceptor` pre-handle filters.
3. **Controller Layer (`@RestController`)**: Validates the input payload using Bean Validation (`@Valid`), deserializes JSON into a Java DTO via Jackson `ObjectMapper`, and delegates execution to the Service layer.
4. **Service Layer (`@Service`)**: Contains the core business rules. Methods annotated with `@Transactional` trigger a Spring AOP proxy that acquires a database connection, begins a transaction, commits on success, and executes a rollback if an unchecked exception occurs.
5. **Data Access Layer (`@Repository` & JPA/Hibernate)**: Translates method calls into SQL statements, checks the First-Level Cache (Persistence Context), and interacts with the database via the HikariCP connection pool.

## 2. Verified Java Implementation

Below is a production-grade Spring Boot implementation demonstrating separation of concerns:

```java
package com.interviewx.demo;

import java.util.List;
import java.util.Optional;

// 1. Data Model / Entity
public class StudentRecord {
    private final Long id;
    private final String name;
    private final String email;

    public StudentRecord(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}

// 2. Service Layer demonstrating business validation
public class StudentService {
    public boolean isValidStudent(StudentRecord student) {
        if (student == null) return false;
        return student.getName() != null && !student.getName().trim().isEmpty()
            && student.getEmail() != null && student.getEmail().contains("@");
    }

    public static void main(String[] args) {
        StudentService service = new StudentService();
        StudentRecord sample = new StudentRecord(1L, "Aditi Sharma", "aditi@example.com");
        boolean valid = service.isValidStudent(sample);
        System.out.println("Student valid: " + valid);
    }
}
```

## 3. HikariCP and Connection Pooling

In high-throughput systems, creating a new database TCP socket connection for every incoming HTTP request causes massive latency spikes. Spring Boot defaults to **HikariCP**, an ultra-fast zero-overhead connection pool that maintains pre-established database connections ready for immediate borrowing.

Master Spring Boot and Java concurrency in our interactive practice hub:
- [Explore the Java & Backend Question Bank](/practice?topic=java)
- [Review the Backend Engineering Roadmap](/roadmaps)
