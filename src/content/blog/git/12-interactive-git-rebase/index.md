---
title: "Interactive Git Rebase Guide"
summary: "Learn how to rewrite commit history cleanly using interactive rebase"
date: "2024, 03, 31"
tags: ["git", "git-rebase", "version-control", "tutorial", "advanced-git"]
difficulty: "advanced"
draft: false
---

## Interactive Git Rebase Guide

Interactive rebase is a powerful Git feature that allows you to modify your commit history. This guide will show you how to use interactive rebase to clean up, reorganize, and perfect your commit history.

## What You'll Learn

- How to start an interactive rebase
- Different rebase commands and their effects
- How to modify commit messages
- How to combine, split, and reorder commits
- Best practices for rebasing

## Implementation Steps

1. **Starting Interactive Rebase**

   ```bash
   # Rebase last 3 commits
   git rebase -i HEAD~3
   ```

   - Opens editor with commit list
   - Commits are listed in reverse chronological order
   - Each line shows commit hash, message, and available commands

2. **Basic Rebase Commands**

   ```
   pick   abc1234 First commit
   reword def5678 Second commit
   edit   ghi9012 Third commit
   ```

   - `pick`: Keep commit as is
   - `reword`: Change commit message
   - `edit`: Stop for amending
   - `squash`: Combine with previous commit
   - `fixup`: Combine and discard message
   - `drop`: Remove commit

3. **Modifying Commit Messages**

   ```bash
   # After selecting 'reword'
   git commit --amend
   git rebase --continue
   ```

   - Edit message in editor
   - Save and close to continue rebase

4. **Combining Commits**

   ```
   pick   abc1234 First commit
   squash def5678 Second commit
   squash ghi9012 Third commit
   ```

   - Combines multiple commits into one
   - Allows editing final commit message

## Best Practices

1. **Before Starting Rebase**

   - Create a backup branch
   - Ensure working directory is clean
   - Check if commits are pushed
   - Review commit history

2. **During Rebase**

   - Take your time to review changes
   - Test after each significant change
   - Keep commit messages clear and descriptive
   - Use `git status` to check progress

3. **After Rebase**

   - Test the codebase thoroughly
   - Verify commit history is correct
   - Push changes if necessary
   - Communicate with team members

4. **Safety Measures**

   - Use `git reflog` to recover from mistakes
   - Keep backup branches
   - Don't rebase shared commits
   - Test after each rebase operation

## Common Use Cases

1. **Cleaning Up Commit History**

   ```bash
   git rebase -i HEAD~5
   # Reorder and combine commits
   ```

2. **Fixing Commit Messages**

   ```bash
   git rebase -i HEAD~3
   # Change 'pick' to 'reword' for target commit
   ```

3. **Splitting a Commit**

   ```bash
   git rebase -i HEAD~3
   # Change 'pick' to 'edit' for target commit
   git reset HEAD~1
   git add file1.txt
   git commit -m "First part"
   git add file2.txt
   git commit -m "Second part"
   git rebase --continue
   ```

4. **Removing Sensitive Data**

   ```bash
   git rebase -i HEAD~5
   # Change 'pick' to 'edit' for target commit
   git reset HEAD~1
   # Remove sensitive data
   git add .
   git commit -m "Remove sensitive data"
   git rebase --continue
   ```

## Advanced Usage

1. **Rebasing onto Another Branch**

   ```bash
   git rebase -i main
   ```

2. **Using Rebase to Update Feature Branch**

   ```bash
   git checkout feature
   git rebase -i main
   ```

3. **Interactive Rebase with Conflicts**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git rebase --continue
   ```

4. **Aborting Rebase**

   ```bash
   git rebase --abort
   ```

## Common Issues and Solutions

1. **Merge Conflicts**

   ```bash
   # Resolve conflicts
   git add resolved-files
   git rebase --continue
   ```

2. **Lost Commits**

   ```bash
   git reflog
   git reset --hard HEAD@{1}
   ```

3. **Wrong Rebase Target**

   ```bash
   git rebase --abort
   # Start over with correct target
   ```

## Conclusion

Interactive rebase is a powerful tool for maintaining a clean Git history. Remember to:

- Always create backup branches
- Test thoroughly after rebasing
- Be careful with shared commits
- Keep commit messages clear
- Use appropriate rebase commands

## Next Steps

After mastering interactive rebase, you might want to:

- Learn about Git hooks for automation
- Explore advanced Git workflows
- Study Git's internal mechanisms
- Practice with different rebase scenarios
