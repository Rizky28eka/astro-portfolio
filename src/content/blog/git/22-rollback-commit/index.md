---
title: "Rollback to Previous Commit"
summary: "Learn how to recover code from past versions safely"
date: "2024, 04, 10"
tags: ["git", "git-revert", "git-reset", "version-control", "tutorial"]
difficulty: "medium"
draft: false
---

## Rollback to Previous Commit

Rolling back to a previous commit is a common need in Git. This guide will show you different ways to revert your code to a previous state while maintaining a clean history.

## What You'll Learn

- Different ways to rollback
- When to use each method
- How to handle shared commits
- Best practices for rollbacks
- Recovery strategies

## Implementation Steps

1. **Using Git Reset**

   ```bash
   # Soft reset (keep changes staged)
   git reset --soft HEAD~1

   # Mixed reset (keep changes unstaged)
   git reset HEAD~1

   # Hard reset (discard changes)
   git reset --hard HEAD~1
   ```

   - Choose appropriate reset type
   - Understand impact on history
   - Handle changes carefully
   - Consider shared commits

2. **Using Git Revert**

   ```bash
   # Revert last commit
   git revert HEAD

   # Revert specific commit
   git revert <commit-hash>

   # Revert without committing
   git revert -n <commit-hash>
   ```

   - Create new revert commit
   - Safe for shared history
   - Maintain traceability
   - Handle conflicts

3. **Checking Out Old Version**

   ```bash
   # Checkout specific commit
   git checkout <commit-hash>

   # Create branch from old commit
   git checkout -b recovery-branch <commit-hash>
   ```

   - View old code
   - Create recovery branch
   - Test old version
   - Plan recovery

4. **Recovery Process**

   ```bash
   # Create backup branch
   git branch backup-branch

   # Perform rollback
   git reset --hard <commit-hash>

   # Verify changes
   git status
   git log
   ```

   - Create backups
   - Verify changes
   - Test after rollback
   - Document process

## Best Practices

1. **Before Rollback**

   - Create backup branch
   - Check commit history
   - Review changes
   - Plan recovery

2. **Choosing Method**

   - Use reset for local commits
   - Use revert for shared commits
   - Use checkout for inspection
   - Consider team impact

3. **After Rollback**

   - Test thoroughly
   - Update documentation
   - Communicate changes
   - Monitor for issues

4. **Safety Measures**

   - Keep commit hashes
   - Document rollback reason
   - Create backup branches
   - Test before pushing

## Common Use Cases

1. **Undo Last Commit**

   ```bash
   # Keep changes
   git reset --soft HEAD~1

   # Discard changes
   git reset --hard HEAD~1
   ```

2. **Revert Bad Commit**

   ```bash
   # Revert specific commit
   git revert <commit-hash>
   ```

3. **Recover Deleted Code**

   ```bash
   # Find lost commit
   git reflog
   # Restore code
   git checkout <commit-hash>
   ```

4. **Rollback Feature**

   ```bash
   # Revert feature commits
   git revert <start-commit>..<end-commit>
   ```

## Advanced Usage

1. **Interactive Rebase**

   ```bash
   # Remove specific commits
   git rebase -i HEAD~3
   ```

2. **Partial Revert**

   ```bash
   # Revert specific files
   git checkout <commit-hash> -- file1 file2
   ```

3. **Recovery with Reflog**

   ```bash
   # Find lost commits
   git reflog
   # Restore state
   git reset --hard HEAD@{1}
   ```

4. **Merge Commit Revert**

   ```bash
   # Revert merge commit
   git revert -m 1 <merge-commit>
   ```

## Common Issues and Solutions

1. **Lost Changes**

   ```bash
   # Recover from reflog
   git reflog
   git reset --hard HEAD@{1}
   ```

2. **Merge Conflicts**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git revert --continue
   ```

3. **Wrong Rollback**

   ```bash
   # Abort revert
   git revert --abort
   # Try different method
   git reset --hard <commit-hash>
   ```

## Conclusion

Rolling back commits requires careful consideration. Remember to:

- Choose appropriate method
- Create backups
- Test thoroughly
- Document changes
- Consider team impact

## Next Steps

After mastering rollbacks, you might want to:

- Learn about Git workflows
- Explore Git hooks
- Study Git internals
- Understand Git objects
