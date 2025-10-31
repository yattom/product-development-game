# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working With Human

- Respond in Japanese in chat.
- Communicate with clear and flat expressions.
- Always ask for explicit requests.  Seek explicit confirmation of the user's intent.

## Autonomous Coding Workflow

When working autonomously on this project, follow this workflow:

### AI Decision-Making Guidelines

**Proceed Autonomously When:**
- Task is clearly defined in `docs/plan.md`
- Requirements are unambiguous
- Similar patterns exist in codebase
- Tests can verify correctness
- Changes are isolated and reversible

**Ask for Clarification When:**
- Multiple valid approaches exist with different tradeoffs
- Requirements are ambiguous or conflicting
- Breaking changes to existing APIs are needed
- Security or data integrity implications are unclear
- Task requires external dependencies or services

### Automatic Test-Driven Development

**MANDATORY: Always follow TDD workflow:**

1. **Before Implementation:**
   - Read and understand existing code
   - Identify relevant test files
   - Write failing tests that specify desired behavior
   - Run tests to confirm they fail for the right reason

2. **During Implementation:**
   - Write minimal code to pass tests
   - Run tests frequently (after each logical change)
   - Refactor while keeping tests green
   - Add edge case tests as you discover them

3. **Before Marking Complete:**
   - All tests must pass (unit + integration + e2e where applicable)
   - Code must pass linting (backend: black, isort, flake8, mypy; frontend: eslint)
   - No console errors or warnings in development
   - Changes are committed with clear messages

### Self-Verification Checklist

Before considering any task complete, verify:

- [ ] Tests written and passing
- [ ] Code follows existing patterns and style
- [ ] Linting passes with no errors
- [ ] No breaking changes to existing functionality (or documented if intentional)
- [ ] API changes reflected in both frontend and backend
- [ ] Database schema changes include migration strategy
- [ ] Documentation updated (inline comments, CLAUDE.md if patterns changed)
- [ ] `docs/plan.md` updated (mark task complete, add discovered issues)

### Error Recovery Protocol

**When Tests Fail:**
1. Read error messages carefully
2. Check if failure is expected (new failing test) or regression
3. Debug using relevant tools (console logs, debugger, test output)
4. If stuck after 3 attempts, document the blocker and ask for help
5. Never commit code with failing tests

**When Unexpected Errors Occur:**
1. Check service status (`docker-compose ps`)
2. Review recent changes that might have caused the issue
3. Check logs (backend: docker logs, frontend: browser console)
4. Attempt to reproduce in isolation
5. Revert changes if error is blocking and cause is unclear

## Task Execution Protocol

### Task Source of Truth

**Primary:** `docs/plan.md` contains all planned work organized by priority.

**Task Selection Logic:**
1. Start with "緊急（基本機能の完成）" (Emergency/Basic Function Completion)
2. Then proceed to "高優先度" (High Priority)
3. Only tackle "中優先度" (Medium) or "低優先度" (Low) if explicitly requested
4. Within priority levels, tackle tasks top-to-bottom unless dependencies require different order

### Definition of Done

**For Features:**
- [ ] Functionality implemented and working
- [ ] Unit tests cover new code (target: >80% coverage)
- [ ] E2E tests cover user workflows (if user-facing)
- [ ] Frontend and backend integrated (if applicable)
- [ ] Error handling implemented
- [ ] Edge cases handled
- [ ] Documentation updated

**For Bug Fixes:**
- [ ] Root cause identified and documented
- [ ] Test reproducing the bug added
- [ ] Fix implemented
- [ ] Test passes
- [ ] Regression tests confirm no new issues
- [ ] Related bugs checked (could be same root cause)

**For Refactoring:**
- [ ] All existing tests still pass
- [ ] Code quality improved (complexity, readability, maintainability)
- [ ] No behavior changes (unless intentional and documented)
- [ ] Performance not degraded (or improved if that was the goal)

### Code Quality Gates

**Must Pass Before Completion:**

**Frontend:**
```bash
npm run lint                    # ESLint
npm test                        # Jest unit tests
npm run build                   # Production build succeeds
```

## Git Commit Guidelines

### Commit Message Philosophy

**Write "WHY" not "WHAT":**
- Git diff shows WHAT changed - commit messages should explain WHY
- Focus on intent, context, and motivation behind changes
- Help future developers (including yourself) understand the reasoning

**Good Commit Messages:**
- ✅ "Enable autonomous AI coding workflow to reduce human intervention during development"
- ✅ "Optimize test execution by keeping Docker services running between test runs"
- ✅ "Prevent accidental destructive operations while allowing necessary development commands"

**Poor Commit Messages:**
- ❌ "Add autonomous coding workflow section to CLAUDE.md"
- ❌ "Update test-all command to not stop docker-compose"
- ❌ "Add settings.json with command allowlist"

### Commit Message Template

**IMPORTANT: Never use emojis in commit messages. This is a strict requirement.**

```
<Short summary of intent and impact>

<Optional: Additional context>
- Why this change is needed
- What problem it solves
- What tradeoffs were considered
- Any important context for future reference

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Examples

**Feature Implementation:**
```
Enable test-driven autonomous development workflow

Project needs to support AI-driven development with minimal human
intervention. Added workflow guidelines to ensure tests are written
first, code quality gates are enforced, and clear success criteria
are defined before marking work complete.
```

**Bug Fix:**
```
Fix test execution slowdown from repeated Docker restarts

Test iterations were slow due to starting/stopping services each run.
Modified /test-all to keep services running since they're needed for
multiple test runs during development anyway.
```

**Security/Safety:**
```
Restrict bash command execution to development operations only

Full wildcard (*) in allowed commands posed security risk (rm, ssh, etc).
Narrowed to specific development tools while blocking destructive and
remote operations to maintain safety during autonomous coding.
```

## Documentation Guidelines

When updating README.md or other user-facing documentation:

**DO:**
- Provide factual, actionable information
- Document what exists and how to use it
- Use clear, straightforward commands and instructions
- Keep content minimal and focused on what users need to know

**DON'T:**
- Add evaluative content ("comprehensive," "recommended," "better")
- Include subjective assessments or promotional language
- Add benefits/advantages lists unless specifically requested
- Include detailed metrics, test counts, or coverage statistics
- Use phrases like "推奨" (recommended), "利点" (advantages), etc.

**Example:**
- ❌ "このプロジェクトには包括的なテストスイートが含まれています"
- ✅ Just document the test commands

CLAUDE.md (this file) can include evaluative guidance for developers, but user-facing docs should remain objective.

## Development Environment Setup

### Prerequisites

1. Ensure Node.js and npm are installed.

### Initial Setup

1. Install dependencies:

```bash
npm install
```

## Development Commands

### Local Development

#### Pre-Push Testing Checklist

**IMPORTANT: Always run tests before pushing code to the repository**

```bash
# 1. Start services
docker-compose up -d

# 2. Run backend tests
cd backend && poetry run pytest

# 3. Run frontend unit tests
cd ../frontend && npm test

# 4. Run e2e tests
npm run test:e2e

# 5. Stop services
cd .. && docker-compose down

# Only push code after confirming all tests are green ✅
```

