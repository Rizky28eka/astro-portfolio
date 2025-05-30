---
title: "Stashing Changes in Git"
summary: "Learn how to temporarily store and manage your working changes"
date: "2024, 04, 14"
tags: ["git", "git-stash", "workflow", "tutorial", "best-practices"]
difficulty: "beginner"
draft: false
---

## Stashing Changes in Git

Git stash provides a way to temporarily store your working changes without committing them. This guide will show you how to effectively use stashing in your Git workflow.

## What You'll Learn

- Basic stashing
- Managing stashes
- Applying stashes
- Best practices
- Common scenarios

## Implementation Steps

1. **Basic Stashing**

   ```bash
   # Stash all changes
   git stash save "WIP: feature in progress"

   # Stash with description
   git stash push -m "Work in progress"

   # Stash specific files
   git stash push path/to/file1 path/to/file2
   ```

   - Save changes
   - Add messages
   - Select files
   - Verify stash

2. **View Stashes**

   ```bash
   # List all stashes
   git stash list

   # Show stash contents
   git stash show -p stash@{0}

   # View stash diff
   git stash show -p
   ```

   - Check stash list
   - View contents
   - Compare changes
   - Track stash

3. **Apply Stashes**

   ```bash
   # Apply latest stash
   git stash apply

   # Apply specific stash
   git stash apply stash@{2}

   # Apply and remove
   git stash pop
   ```

   - Apply changes
   - Select stash
   - Remove after apply
   - Verify changes

4. **Manage Stashes**

   ```bash
   # Drop specific stash
   git stash drop stash@{1}

   # Clear all stashes
   git stash clear

   # Create branch from stash
   git stash branch new-branch stash@{0}
   ```

   - Remove stashes
   - Clean up
   - Create branches
   - Organize work

## Best Practices

1. **Before Stashing**

   - Review changes
   - Add descriptions
   - Check status
   - Plan workflow

2. **During Stashing**

   - Use clear messages
   - Select relevant files
   - Track stash list
   - Test after apply

3. **After Stashing**

   - Verify changes
   - Clean up old stashes
   - Update documentation
   - Monitor conflicts

4. **Stash Organization**

   - Name stashes clearly
   - Group related changes
   - Regular cleanup
   - Document purpose

## Common Use Cases

1. **Switch Branches**

   ```bash
   # Stash changes
   git stash save "WIP: feature"

   # Switch branch
   git checkout main

   # Return and apply
   git checkout feature
   git stash pop
   ```

2. **Pull Updates**

   ```bash
   # Stash changes
   git stash

   # Pull updates
   git pull

   # Apply stash
   git stash pop
   ```

3. **Emergency Fix**

   ```bash
   # Stash current work
   git stash save "WIP: main feature"

   # Fix emergency
   git checkout hotfix
   # ... fix and commit ...

   # Return to work
   git checkout feature
   git stash pop
   ```

4. **Clean Working Directory**

   ```bash
   # Stash all changes
   git stash --include-untracked

   # Clean directory
   git clean -fd

   # Restore when needed
   git stash pop
   ```

## Advanced Usage

1. **Selective Stashing**

   ```bash
   # Stash specific changes
   git stash push -p

   # Stash untracked files
   git stash --include-untracked
   ```

2. **Stash Branching**

   ```bash
   # Create branch from stash
   git stash branch new-feature stash@{0}
   ```

3. **Stash Patches**

   ```bash
   # Create stash patch
   git stash show -p > changes.patch

   # Apply patch
   git apply changes.patch
   ```

4. **Stash with Message**

   ```bash
   # Stash with description
   git stash push -m "Feature in progress"
   ```

## Common Issues and Solutions

1. **Merge Conflicts**

   ```bash
   # Resolve conflicts
   git stash pop
   # ... resolve conflicts ...
   git add .
   git commit -m "Resolve stash conflicts"
   ```

2. **Lost Stash**

   ```bash
   # Find lost stash
   git fsck --unreachable | grep commit
   git show <commit-hash>
   ```

3. **Stash Application**

   ```bash
   # Apply with conflicts
   git stash apply --3way
   ```

## Conclusion

Stashing is a powerful tool for managing work in progress. Remember to:

- Use clear messages
- Organize stashes
- Clean up regularly
- Follow best practices
- Plan workflow

## Next Steps

After mastering stashing, consider:

- Learning about Git workflows
- Exploring Git hooks
- Understanding Git internals
- Setting up automated stashing
