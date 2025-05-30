---
title: "Resolving Merge Conflicts"
summary: "Learn how to handle and resolve Git merge conflicts effectively"
date: "2024, 03, 29"
tags: ["git", "merge-conflict", "git-fix", "team-dev", "tutorial"]
difficulty: "medium"
draft: false
---

## Resolving Merge Conflicts

Merge conflicts occur when Git cannot automatically resolve differences between branches. This tutorial will guide you through the process of identifying, understanding, and resolving merge conflicts effectively.

## What You'll Learn

- Identify merge conflicts
- Understand conflict markers
- Resolve conflicts manually
- Use merge tools
- Prevent future conflicts

## Implementation Steps

1. **Identifying Conflicts**

   ```bash
   # Check for conflicts
   git status

   # View conflicting files
   git diff
   ```

   This helps you identify which files have conflicts.

2. **Understanding Conflict Markers**

   ```
   <<<<<<< HEAD
   Your changes
   =======
   Their changes
   >>>>>>> feature-branch
   ```

   These markers show the conflicting changes.

3. **Resolving Conflicts**

   ```bash
   # Edit conflicted files
   # Remove conflict markers
   # Save changes

   # Mark as resolved
   git add resolved-file.txt

   # Complete merge
   git commit -m "Merge: resolve conflicts"
   ```

   This resolves the conflicts and completes the merge.

4. **Using Merge Tools**

   ```bash
   # Configure merge tool
   git config --global merge.tool vscode

   # Launch merge tool
   git mergetool
   ```

   This provides a visual interface for resolving conflicts.

## Conflict Resolution Strategies

1. **Manual Resolution**

   ```
   # Before
   <<<<<<< HEAD
   function processData() {
     return data;
   }
   =======
   function processData() {
     return data.filter(x => x > 0);
   }
   >>>>>>> feature-branch

   # After
   function processData() {
     return data.filter(x => x > 0);
   }
   ```

2. **Using Merge Tools**

   ```
   # Configure VS Code as merge tool
   git config --global merge.tool vscode
   git config --global mergetool.vscode.cmd 'code --wait $MERGED'
   ```

3. **Accepting Changes**

   ```bash
   # Accept current branch changes
   git checkout --ours file.txt

   # Accept incoming branch changes
   git checkout --theirs file.txt
   ```

## Best Practices

1. **Before Merging**

   - Update your working directory
   - Pull latest changes
   - Review branch differences
   - Backup if needed
   - Consider merge strategy

2. **During Resolution**

   - Understand both changes
   - Communicate with team
   - Test after resolving
   - Document decisions
   - Follow team conventions

3. **After Resolution**

   - Verify resolution
   - Test functionality
   - Commit changes
   - Push updates
   - Clean up branches

4. **Prevention**

   - Keep branches updated
   - Communicate changes
   - Use feature flags
   - Follow coding standards
   - Regular integration

## Common Use Cases

1. **Simple Text Conflicts**

   ```bash
   # Edit file manually
   vim conflicted-file.txt

   # Mark as resolved
   git add conflicted-file.txt
   git commit -m "Merge: resolve text conflicts"
   ```

2. **Code Conflicts**

   ```bash
   # Use merge tool
   git mergetool

   # Test changes
   npm test

   # Commit resolution
   git commit -m "Merge: resolve code conflicts"
   ```

3. **Binary File Conflicts**

   ```bash
   # Choose version
   git checkout --ours image.png
   # or
   git checkout --theirs image.png

   # Commit choice
   git add image.png
   git commit -m "Merge: resolve binary conflict"
   ```

## Advanced Usage

1. **Interactive Rebase**

   ```bash
   # Start interactive rebase
   git rebase -i main

   # Resolve conflicts
   git add resolved-files
   git rebase --continue
   ```

2. **Merge with Strategy**

   ```bash
   # Use specific strategy
   git merge -X ours feature-branch
   # or
   git merge -X theirs feature-branch
   ```

3. **Partial Resolution**

   ```bash
   # Stage partial resolution
   git add resolved-parts

   # Continue later
   git commit -m "Merge: partial resolution"
   ```

## Common Issues and Solutions

1. **Complex Conflicts**

   ```bash
   # Abort merge
   git merge --abort

   # Try different approach
   git merge -X patience feature-branch
   ```

2. **Recurring Conflicts**

   ```bash
   # Update branch
   git checkout feature-branch
   git rebase main

   # Try merge again
   git checkout main
   git merge feature-branch
   ```

3. **Large File Conflicts**
   ```bash
   # Use Git LFS
   git lfs track "*.large"
   git add .gitattributes
   git commit -m "Add LFS tracking"
   ```

## Conclusion

Resolving merge conflicts is a crucial skill for Git users. Remember to:

- Understand conflict markers
- Choose resolution strategy
- Test after resolving
- Document decisions
- Follow best practices

This knowledge will help you handle merge conflicts effectively.

## Next Steps

After mastering conflict resolution, you might want to:

- Learn about Git rebase
- Understand merge strategies
- Master Git tools
- Learn about Git hooks
- Explore Git workflows

Remember that proper conflict resolution is key to successful collaboration.
