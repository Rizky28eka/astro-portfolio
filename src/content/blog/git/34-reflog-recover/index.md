---
title: "Reflog to Recover Lost Commits"
summary: "Learn how to use Git reflog to recover lost commits and restore your work"
date: "2024, 04, 14"
tags: ["git", "reflog", "recovery", "tutorial", "best-practices"]
difficulty: "advanced"
draft: false
---

## Reflog to Recover Lost Commits

Git reflog is a powerful tool that keeps track of all reference changes in your repository. This guide will show you how to use reflog to recover lost commits and restore your work.

## What You'll Learn

- Understanding reflog
- Viewing reflog
- Recovering commits
- Best practices
- Common scenarios

## Implementation Steps

1. **View Reflog**

   ```bash
   # View reflog
   git reflog

   # View specific reflog
   git reflog show HEAD

   # View branch reflog
   git reflog show branch-name
   ```

   - Check history
   - Find commits
   - Identify changes
   - Track actions

2. **Recover Commits**

   ```bash
   # Recover from reflog
   git checkout HEAD@{1}

   # Create branch from reflog
   git branch recovery-branch HEAD@{1}

   # Reset to reflog
   git reset --hard HEAD@{1}
   ```

   - Find lost commit
   - Create branch
   - Reset to commit
   - Verify recovery

3. **Advanced Recovery**

   ```bash
   # Recover specific file
   git checkout HEAD@{1} -- path/to/file

   # Recover with cherry-pick
   git cherry-pick HEAD@{1}

   # Recover with reset
   git reset --soft HEAD@{1}
   ```

   - Recover files
   - Use cherry-pick
   - Soft reset
   - Verify changes

4. **Clean Up**

   ```bash
   # Expire old reflog
   git reflog expire --expire=now --all

   # Clean reflog
   git gc --prune=now
   ```

   - Manage reflog
   - Clean history
   - Optimize storage
   - Maintain repo

## Best Practices

1. **Before Recovery**

   - Check reflog
   - Identify commit
   - Plan recovery
   - Backup if needed

2. **During Recovery**

   - Use safe methods
   - Create branches
   - Test changes
   - Verify content

3. **After Recovery**

   - Test thoroughly
   - Update docs
   - Clean up
   - Monitor changes

4. **Prevention**

   - Regular commits
   - Clear messages
   - Safe operations
   - Backup strategy

## Common Use Cases

1. **Accidental Reset**

   ```bash
   # Find reset in reflog
   git reflog

   # Recover from reset
   git reset --hard HEAD@{1}
   ```

2. **Lost Branch**

   ```bash
   # Find branch in reflog
   git reflog | grep branch-name

   # Recover branch
   git branch recovery-branch HEAD@{1}
   ```

3. **Deleted Commit**

   ```bash
   # Find commit in reflog
   git reflog

   # Recover commit
   git cherry-pick HEAD@{1}
   ```

4. **Wrong Merge**

   ```bash
   # Find pre-merge state
   git reflog

   # Reset to pre-merge
   git reset --hard HEAD@{1}
   ```

## Advanced Usage

1. **Selective Recovery**

   ```bash
   # Recover specific files
   git checkout HEAD@{1} -- file1 file2

   # Recover with patch
   git show HEAD@{1} > recovery.patch
   git apply recovery.patch
   ```

2. **Branch Recovery**

   ```bash
   # Find branch tip
   git reflog | grep "checkout: moving to"

   # Recover branch
   git branch recovery-branch HEAD@{1}
   ```

3. **Stash Recovery**

   ```bash
   # Find stash in reflog
   git reflog | grep "stash"

   # Recover stash
   git stash apply HEAD@{1}
   ```

4. **Complex Recovery**

   ```bash
   # Create recovery branch
   git branch recovery HEAD@{1}

   # Cherry-pick commits
   git cherry-pick HEAD@{1}..HEAD@{3}
   ```

## Common Issues and Solutions

1. **Missing Reflog**

   ```bash
   # Check reflog settings
   git config --get gc.reflogExpire

   # Update settings
   git config gc.reflogExpire 90
   ```

2. **Recovery Conflicts**

   ```bash
   # Resolve conflicts
   git checkout --ours file
   git add file
   git commit -m "Resolve conflicts"
   ```

3. **Partial Recovery**

   ```bash
   # Recover specific files
   git checkout HEAD@{1} -- path/to/file

   # Create patch
   git diff HEAD@{1} HEAD@{2} > changes.patch
   ```

## Conclusion

Reflog is a powerful recovery tool. Remember to:

- Check reflog first
- Use safe methods
- Test recovery
- Keep backups
- Follow best practices

## Next Steps

After mastering reflog, consider:

- Learning Git internals
- Exploring Git workflows
- Understanding Git hooks
- Setting up backups
