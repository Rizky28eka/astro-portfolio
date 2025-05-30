---
title: "Cherry Pick Commits in Git"
summary: "Learn how to apply specific commits to different branches"
date: "2024, 04, 09"
tags: ["git", "git-cherry-pick", "version-control", "tutorial", "advanced-git"]
difficulty: "advanced"
draft: false
---

## Cherry Pick Commits in Git

Cherry picking is a powerful Git feature that allows you to apply specific commits from one branch to another. This guide will show you how to use cherry picking effectively to manage your codebase.

## What You'll Learn

- What is cherry picking
- When to use cherry picking
- How to cherry pick commits
- Handling conflicts
- Best practices

## Implementation Steps

1. **Basic Cherry Pick**

   ```bash
   # Cherry pick a specific commit
   git cherry-pick <commit-hash>
   ```

   - Applies commit to current branch
   - Creates new commit with same changes
   - Preserves commit message
   - Maintains authorship

2. **Multiple Commits**

   ```bash
   # Cherry pick range of commits
   git cherry-pick <start-commit>..<end-commit>

   # Cherry pick multiple specific commits
   git cherry-pick <commit1> <commit2> <commit3>
   ```

   - Apply multiple commits
   - Maintain commit order
   - Handle conflicts
   - Preserve history

3. **Cherry Pick Options**

   ```bash
   # Keep original commit message
   git cherry-pick -x <commit-hash>

   # Skip commit if already applied
   git cherry-pick --skip

   # Abort cherry pick
   git cherry-pick --abort
   ```

   - Control commit messages
   - Handle duplicates
   - Manage conflicts
   - Recover from errors

4. **Conflict Resolution**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git cherry-pick --continue

   # Skip conflicting commit
   git cherry-pick --skip
   ```

   - Handle merge conflicts
   - Continue after resolution
   - Skip problematic commits
   - Maintain clean history

## Best Practices

1. **When to Cherry Pick**

   - Apply hotfixes to multiple branches
   - Backport features
   - Fix specific issues
   - Share changes between branches

2. **Cherry Pick Strategy**

   - Pick related commits together
   - Maintain commit order
   - Test after cherry picking
   - Document picked commits

3. **Conflict Management**

   - Resolve conflicts carefully
   - Test after resolution
   - Document changes
   - Keep history clean

4. **Safety Measures**

   - Create backup branch
   - Test before pushing
   - Document picked commits
   - Communicate with team

## Common Use Cases

1. **Hotfix Application**

   ```bash
   # Apply hotfix to multiple branches
   git checkout main
   git cherry-pick hotfix-commit
   git checkout develop
   git cherry-pick hotfix-commit
   ```

2. **Feature Backporting**

   ```bash
   # Backport feature to older version
   git checkout release-1.0
   git cherry-pick feature-commits
   ```

3. **Bug Fix Sharing**

   ```bash
   # Share bug fix between branches
   git cherry-pick bugfix-commit
   ```

4. **Selective Updates**

   ```bash
   # Pick specific changes
   git cherry-pick commit1 commit2
   ```

## Advanced Usage

1. **Cherry Pick with Rebase**

   ```bash
   # Rebase and cherry pick
   git rebase -i HEAD~3
   git cherry-pick <commit>
   ```

2. **Cherry Pick with Conflicts**

   ```bash
   # Handle conflicts
   git cherry-pick <commit>
   # Resolve conflicts
   git add resolved-files
   git cherry-pick --continue
   ```

3. **Cherry Pick with Hooks**

   ```bash
   # Pre-cherry-pick hook
   #!/bin/sh
   # Add validation logic
   ```

4. **Cherry Pick with Reflog**

   ```bash
   # Recover from mistakes
   git reflog
   git reset --hard HEAD@{1}
   ```

## Common Issues and Solutions

1. **Merge Conflicts**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git cherry-pick --continue
   ```

2. **Duplicate Commits**

   ```bash
   # Skip if already applied
   git cherry-pick --skip
   ```

3. **Wrong Commit**

   ```bash
   # Abort cherry pick
   git cherry-pick --abort
   ```

## Conclusion

Cherry picking is a powerful tool for managing code across branches. Remember to:

- Use cherry pick appropriately
- Handle conflicts carefully
- Test after cherry picking
- Document picked commits
- Follow team standards

## Next Steps

After mastering cherry picking, you might want to:

- Learn about Git workflows
- Explore Git rebase
- Study Git hooks
- Understand Git internals
