---
title: "Squashing Commits for Clean History"
summary: "Learn how to compress commit history before merging"
date: "2024, 04, 08"
tags: ["git", "git-rebase", "squash", "version-control", "tutorial"]
difficulty: "advanced"
draft: false
---

## Squashing Commits for Clean History

Squashing commits is a powerful technique to maintain a clean and organized Git history. This guide will show you how to effectively squash commits before merging your changes.

## What You'll Learn

- What is commit squashing
- When to squash commits
- How to squash using interactive rebase
- Best practices for squashing
- Handling merge conflicts

## Implementation Steps

1. **Interactive Rebase**

   ```bash
   # Start interactive rebase
   git rebase -i HEAD~3
   ```

   - Opens editor with commit list
   - Commits in reverse chronological order
   - Choose squash or fixup
   - Edit final commit message

2. **Squash Commands**

   ```
   pick   abc1234 First commit
   squash def5678 Second commit
   squash ghi9012 Third commit
   ```

   - `pick`: Keep commit as is
   - `squash`: Combine with previous
   - `fixup`: Combine and discard message
   - `edit`: Stop for amending

3. **Commit Message**

   ```markdown
   # Final commit message

   Feature: Add user authentication

   - Add login functionality
   - Implement password reset
   - Add session management
   ```

   - Write clear summary
   - List key changes
   - Reference issues
   - Follow conventions

4. **Pushing Changes**

   ```bash
   # Force push after squash
   git push --force-with-lease origin feature-branch
   ```

   - Use force with lease
   - Update remote branch
   - Maintain history
   - Avoid conflicts

## Best Practices

1. **When to Squash**

   - Before merging PRs
   - After feature completion
   - Before sharing branches
   - When cleaning history

2. **Squash Strategy**

   - Keep related changes together
   - Maintain logical grouping
   - Preserve important context
   - Follow team standards

3. **Commit Messages**

   - Write clear summaries
   - List key changes
   - Reference issues
   - Follow conventions

4. **Safety Measures**

   - Create backup branch
   - Use force with lease
   - Test after squashing
   - Communicate with team

## Common Use Cases

1. **Feature Development**

   ```bash
   # Squash feature commits
   git rebase -i main

   # Edit commit messages
   git commit --amend

   # Push changes
   git push --force-with-lease
   ```

2. **Bug Fixes**

   ```bash
   # Squash fix commits
   git rebase -i HEAD~2

   # Combine related fixes
   # Update commit message
   git push --force-with-lease
   ```

3. **Cleanup History**

   ```bash
   # Squash old commits
   git rebase -i HEAD~5

   # Organize history
   # Update messages
   git push --force-with-lease
   ```

4. **PR Preparation**

   ```bash
   # Squash before PR
   git rebase -i main

   # Clean up history
   # Update messages
   git push --force-with-lease
   ```

## Advanced Usage

1. **Partial Squashing**

   ```bash
   # Squash specific commits
   git rebase -i HEAD~5

   # Keep some commits
   # Squash others
   git push --force-with-lease
   ```

2. **Squash with Conflicts**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git rebase --continue

   # Complete squash
   git push --force-with-lease
   ```

3. **Squash with Reflog**

   ```bash
   # Recover from mistakes
   git reflog
   git reset --hard HEAD@{1}

   # Try squash again
   git rebase -i HEAD~3
   ```

4. **Squash with Hooks**

   ```bash
   # Pre-push hook
   #!/bin/sh
   if git rev-parse --verify HEAD >/dev/null 2>&1
   then
     against=HEAD
   else
     against=$(git hash-object -t tree /dev/null)
   fi
   ```

## Common Issues and Solutions

1. **Merge Conflicts**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git rebase --continue

   # Complete squash
   git push --force-with-lease
   ```

2. **Lost Commits**

   ```bash
   # Find lost commits
   git reflog

   # Restore commits
   git reset --hard HEAD@{1}
   ```

3. **Wrong Squash**

   ```bash
   # Abort rebase
   git rebase --abort

   # Start over
   git rebase -i HEAD~3
   ```

## Conclusion

Squashing commits helps maintain a clean Git history. Remember to:

- Squash before merging
- Write clear messages
- Use force with lease
- Test after squashing
- Follow team standards

## Next Steps

After mastering commit squashing, you might want to:

- Learn about Git workflows
- Explore Git hooks
- Study Git internals
- Understand Git objects
