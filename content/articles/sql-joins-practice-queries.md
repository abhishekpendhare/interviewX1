---
title: "SQL Joins and Aggregations Explained With Practice Queries"
slug: "sql-joins-practice-queries"
summary: "Comprehensive guide to INNER, LEFT, RIGHT, FULL OUTER joins and GROUP BY aggregations with verified queries executed on relational engines."
category: "Prep Guides"
tags: ["SQL", "DBMS", "Relational Database", "Backend", "Practice"]
author: "InterviewX Editorial Team"
coverImage: "/assets/articles/covers/sql-joins-practice-queries.svg"
coverAlt: "SQL relational joins visual representation"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
reviewedAt: "2026-10-31"
status: "published"
sources:
  - title: "PostgreSQL 17 Official Documentation: Queries and Joins"
    url: "https://www.postgresql.org/docs/current/queries-table-expressions.html"
    accessedDate: "2026-10-30"
  - title: "Database System Concepts (7th Edition) by Silberschatz, Korth, Sudarshan"
    url: "https://www.db-book.com"
    accessedDate: "2026-10-30"
relatedModules:
  - title: "DBMS Fundamentals Question Bank"
    url: "/practice?topic=dbms"
    type: "practice"
  - title: "Core CS Roadmap Module"
    url: "/roadmaps"
    type: "roadmap"
---

# SQL Joins and Aggregations Explained With Practice Queries

In technical rounds for both product startups and IT services companies, database queries are used to assess whether a candidate understands data modeling and relational algebra. While many candidates can write a simple `SELECT * FROM users`, confusion arises as soon as `LEFT JOIN` with `GROUP BY` and `HAVING` conditions are introduced.

This guide provides clear definitions, relational set diagrams, and SQL queries that run against SQLite and PostgreSQL without modification.

> **Key takeaways:**
> - `INNER JOIN` returns only rows where a match exists in both tables; unmatched rows from either side are discarded.
> - `LEFT JOIN` preserves every row from the left table and fills missing values from the right table with `NULL`.
> - Always filter aggregated groups using `HAVING` rather than `WHERE`, because `WHERE` executes before row grouping takes place.

## 1. Schema Setup

To understand joins concretely, consider two standard tables: `departments` and `employees`. Notice that some employees have no department assigned, and some departments have no employees.

```sql
CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    dept_name TEXT NOT NULL
);

CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY,
    emp_name TEXT NOT NULL,
    dept_id INTEGER,
    salary INTEGER NOT NULL
);

INSERT INTO departments (dept_id, dept_name) VALUES
(1, 'Engineering'),
(2, 'Product'),
(3, 'Finance');

INSERT INTO employees (emp_id, emp_name, dept_id, salary) VALUES
(101, 'Aditi', 1, 85000),
(102, 'Rohan', 1, 92000),
(103, 'Priya', 2, 78000),
(104, 'Vikram', NULL, 65000);
```

## 2. Inner Join vs Left Join

### The Inner Join Query
Returns only employees who belong to an existing department.

```sql
SELECT e.emp_name, d.dept_name, e.salary
FROM employees e
INNER JOIN departments d ON e.dept_id = d.dept_id;
```
*Result:* Returns Aditi (Engineering), Rohan (Engineering), and Priya (Product). Vikram is excluded because his `dept_id` is `NULL`.

### The Left Join Query
Returns all employees regardless of whether they have a department.

```sql
SELECT e.emp_name, COALESCE(d.dept_name, 'Unassigned') AS department, e.salary
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id;
```
*Result:* Returns all four employees. Vikram appears with 'Unassigned'.

## 3. Aggregations with GROUP BY and HAVING

A classic interview question asks: *"Find all departments with more than one employee and calculate their average salary."*

```sql
SELECT 
    d.dept_name,
    COUNT(e.emp_id) AS total_employees,
    AVG(e.salary) AS average_salary
FROM departments d
INNER JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_name
HAVING COUNT(e.emp_id) > 1;
```

## 4. Execution Order of SQL Clauses

To avoid syntax and logic bugs during an interview, memorize the SQL evaluation pipeline:
1. `FROM` & `JOIN` — Load tables and compute Cartesian products / join filters.
2. `WHERE` — Filter individual rows.
3. `GROUP BY` — Bucket rows into groups.
4. `HAVING` — Filter aggregated groups.
5. `SELECT` — Compute expressions and column projections.
6. `ORDER BY` — Sort the resulting rows.
7. `LIMIT` / `OFFSET` — Slice the output page.

Explore our comprehensive DBMS curriculum to test your understanding on indexing and normal forms:
- [Take the DBMS Practice Assessment](/practice?topic=dbms)
- [Explore the Complete Career Roadmap](/roadmaps)
