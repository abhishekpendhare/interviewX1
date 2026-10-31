---
title: "Git Workflows and Merge Conflict Resolution for Students"
slug: "git-workflows-student-projects"
summary: "Learn trunk-based development, feature branch workflows, interactive rebase, and resolving merge conflicts cleanly in collaborative projects."
category: "Tech Explainers"
tags: ["Git", "Version Control", "DevOps", "Collaboration", "Productivity"]
author: "InterviewX Editorial Team"
coverImage: "/assets/articles/covers/git-workflows-student-projects.svg"
coverAlt: "Git branching strategy and merge conflict resolution diagram"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
reviewedAt: "2026-10-31"
status: "published"
sources:
  - title: "Pro Git (2nd Edition) by Scott Chacon and Ben Straub"
    url: "https://git-scm.com/book/en/v2"
    accessedDate: "2026-10-30"
  - title: "Git Documentation: Branching and Rebasing Guide"
    url: "https://git-scm.com/docs"
    accessedDate: "2026-10-30"
relatedModules:
  - title: "Fullstack Engineering Roadmap"
    url: "/roadmaps"
    type: "roadmap"
  - title: "Career Project Planning Guide"
    url: "/planner"
    type: "planner"
---

# Git Workflows and Merge Conflict Resolution for Students

During college hackathons and group engineering capstone projects, few experiences cause more panic than the dreaded message: `CONFLICT (content): Merge conflict in server.js`. Many students resort to deleting their local repository, emailing zip files, or force-pushing (`git push --force`) over a teammate's hard work.

In professional software development, version control is the foundation of team collaboration. Interviewers frequently ask candidates to explain their Git branching model, how they structure pull requests, and how they resolve merge conflicts without losing changes.

> **Key takeaways:**
> - Never commit directly to the `main` branch. Always branch from updated `main` using descriptive names (`feature/user-auth`, `bugfix/login-redirect`).
> - Rebase your feature branch regularly against `origin/main` to resolve conflicts incrementally before opening a pull request.
> - A merge conflict is not an error; it simply means Git found two different changes to the same line and requires a human engineer to choose the correct state.

## 1. Feature Branch Workflow

The industry-standard branching strategy for small-to-medium teams consists of four steps:

### Step 1: Branch Creation
Always ensure your local main is synchronized with remote before branching:
```bash
git checkout main
git pull origin main
git checkout -b feature/jwt-authentication
```

### Step 2: Atomic, Meaningful Commits
Keep commits focused on a single logical change with clear commit messages:
```bash
git add src/auth/jwt.js
git commit -m "feat(auth): implement token verification middleware"
```

### Step 3: Keeping Up to Date with Rebase
Before opening a pull request, integrate any updates your teammates have merged into main:
```bash
git fetch origin
git rebase origin/main
```

## 2. Resolving a Merge Conflict Step by Step

When a conflict occurs during a merge or rebase, Git inserts conflict markers directly into the affected files:

```text
<<<<<<< HEAD
const PORT = process.env.PORT || 8080;
=======
const PORT = process.env.PORT || 3000;
>>>>>>> feature/jwt-authentication
```

- The code between `<<<<<<< HEAD` and `=======` is what currently exists on the target branch.
- The code between `=======` and `>>>>>>>` is the incoming change from your branch.

### Resolution Steps:
1. Open the file in VS Code or your IDE.
2. Edit the code to preserve the correct logic and delete all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Stage the resolved file:
   ```bash
   git add server.js
   ```
4. Complete the rebase:
   ```bash
   git rebase --continue
   ```

Build and verify software projects with our platform:
- [Explore the Fullstack Engineering Roadmap](/roadmaps)
- [Plan Your Technical Career Milestones](/planner)
