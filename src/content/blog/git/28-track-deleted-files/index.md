---
title: "Track Deleted Files with Git"
summary: "Learn how to track and manage deleted files in your Git repository"
date: "2024, 04, 14"
tags: ["git", "git-rm", "deleted-files", "version-control", "tutorial"]
difficulty: "beginner"
draft: false
---

## Track Deleted Files with Git

Git provides several ways to track and manage deleted files in your repository. This guide will show you how to properly handle file deletions while maintaining your project's history.

## What You'll Learn

- Removing files from Git
- Tracking deletions
- Recovering deleted files
- Best practices
- Common scenarios

## Implementation Steps

1. **Remove Files**

   ```bash
   # Remove file and stage deletion
   git rm filename.txt

   # Remove file but keep in working directory
   git rm --cached filename.txt

   # Remove directory recursively
   git rm -r directory/
   ```

   - Stage deletions
   - Keep local copies
   - Remove directories
   - Commit changes

2. **Track Deletions**

   ```bash
   # Check deleted files
   git status

   # View deletion history
   git log --diff-filter=D --summary

   # Find deleted files
   git log --all --full-history -- "**/deleted-file.txt"
   ```

   - Monitor deletions
   - View history
   - Track changes
   - Verify status

3. **Recover Files**

   ```bash
   # Recover from last commit
   git checkout HEAD~1 -- filename.txt

   # Recover from specific commit
   git checkout <commit-hash> -- filename.txt

   # Recover from stash
   git stash pop
   ```

   - Restore files
   - Check history
   - Use reflog
   - Verify recovery

4. **Clean Up**

   ```bash
   # Remove untracked files
   git clean -f

   # Remove untracked directories
   git clean -fd

   # Preview clean
   git clean -n
   ```

   - Clean workspace
   - Remove debris
   - Preview changes
   - Verify cleanup

## Best Practices

1. **Before Deletion**

   - Review impact
   - Check dependencies
   - Backup if needed
   - Document reason

2. **During Deletion**

   - Use proper commands
   - Stage changes
   - Write clear messages
   - Test after removal

3. **After Deletion**

   - Verify changes
   - Update documentation
   - Notify team
   - Monitor impact

4. **Recovery Planning**

   - Keep backups
   - Document process
   - Test recovery
   - Update procedures

## Common Use Cases

1. **Remove Sensitive Data**

   ```bash
   # Remove sensitive file
   git rm --cached secrets.txt
   git commit -m "Remove sensitive data"
   ```

2. **Clean Up Project**

   ```bash
   # Remove build artifacts
   git rm -r --cached build/
   git commit -m "Remove build artifacts"
   ```

3. **Update Dependencies**

   ```bash
   # Remove old dependency
   git rm -r --cached node_modules/
   git commit -m "Update dependencies"
   ```

4. **Restructure Project**

   ```bash
   # Move and remove files
   git mv old/path/file.txt new/path/
   git rm -r old/path/
   git commit -m "Restructure project"
   ```

## Advanced Usage

1. **Filter Branch**

   ```bash
   # Remove file from history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch sensitive.txt" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Interactive Rebase**

   ```bash
   # Clean up history
   git rebase -i HEAD~5
   ```

3. **Submodule Cleanup**

   ```bash
   # Remove submodule
   git submodule deinit -f path/to/submodule
   git rm -f path/to/submodule
   rm -rf .git/modules/path/to/submodule
   ```

4. **Large File Cleanup**

   ```bash
   # Remove large files
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch *.zip" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## Common Issues and Solutions

1. **Accidental Deletion**

   ```bash
   # Recover from reflog
   git reflog
   git checkout HEAD@{1} -- filename.txt
   ```

2. **Untracked Files**

   ```bash
   # Clean untracked
   git clean -fd
   ```

3. **Merge Conflicts**

   ```bash
   # Resolve conflicts
   git checkout --ours filename.txt
   git add filename.txt
   git commit -m "Resolve deletion conflict"
   ```

## Conclusion

Proper file deletion management is crucial. Remember to:

- Use correct commands
- Track changes
- Document reasons
- Plan recovery
- Follow best practices

## Next Steps

After mastering file deletion, consider:

- Learning about Git hooks
- Exploring Git workflows
- Understanding Git internals
- Setting up automated cleanup
