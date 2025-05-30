---
title: "Clean Untracked Files Safely"
summary: "Learn how to safely remove untracked files from your Git repository"
date: "2024, 04, 14"
tags: ["git", "git-clean", "cleanup", "tutorial", "best-practices"]
difficulty: "beginner"
draft: false
---

## Clean Untracked Files Safely

Git clean helps you remove untracked files from your working directory. This guide will show you how to safely clean your repository while avoiding accidental deletions.

## What You'll Learn

- Basic cleaning
- Safe cleaning
- Dry runs
- Best practices
- Common scenarios

## Implementation Steps

1. **Preview Clean**

   ```bash
   # Show what would be deleted
   git clean -n

   # Show directories too
   git clean -n -d

   # Show ignored files
   git clean -n -x
   ```

   - Check files
   - Review changes
   - Verify safety
   - Plan cleanup

2. **Basic Cleaning**

   ```bash
   # Remove untracked files
   git clean -f

   # Remove directories
   git clean -fd

   # Remove ignored files
   git clean -fx
   ```

   - Clean files
   - Remove directories
   - Handle ignored
   - Verify results

3. **Interactive Clean**

   ```bash
   # Interactive mode
   git clean -i

   # Interactive with directories
   git clean -id
   ```

   - Select files
   - Choose directories
   - Review changes
   - Confirm deletions

4. **Selective Clean**

   ```bash
   # Clean specific paths
   git clean -f path/to/dir

   # Clean with patterns
   git clean -f "*.log"
   ```

   - Target specific files
   - Use patterns
   - Control scope
   - Verify targets

## Best Practices

1. **Before Cleaning**

   - Review changes
   - Check status
   - Backup if needed
   - Plan cleanup

2. **During Clean**

   - Use dry runs
   - Check patterns
   - Verify targets
   - Monitor progress

3. **After Clean**

   - Verify results
   - Check status
   - Update .gitignore
   - Document changes

4. **Safety Measures**

   - Use -n first
   - Check patterns
   - Verify paths
   - Keep backups

## Common Use Cases

1. **Remove Build Files**

   ```bash
   # Clean build artifacts
   git clean -f -d build/
   git clean -f -d dist/
   ```

2. **Clean Dependencies**

   ```bash
   # Remove node_modules
   git clean -f -d node_modules/
   ```

3. **Remove Logs**

   ```bash
   # Clean log files
   git clean -f "*.log"
   ```

4. **Clean Temporary Files**

   ```bash
   # Remove temp files
   git clean -f "*.tmp"
   git clean -f "*.temp"
   ```

## Advanced Usage

1. **Pattern Matching**

   ```bash
   # Clean with patterns
   git clean -f "*.{log,tmp,temp}"
   ```

2. **Interactive Mode**

   ```bash
   # Interactive clean
   git clean -i
   # 1: clean
   # 2: filter by pattern
   # 3: select by numbers
   # 4: ask each
   # 5: quit
   ```

3. **Combined Options**

   ```bash
   # Clean with multiple options
   git clean -fdx
   ```

4. **Custom Patterns**

   ```bash
   # Clean specific patterns
   git clean -f "*.{log,tmp,temp,swp}"
   ```

## Common Issues and Solutions

1. **Accidental Deletion**

   ```bash
   # Recover from backup
   # Always use -n first
   git clean -n
   ```

2. **Pattern Issues**

   ```bash
   # Test patterns
   git clean -n "*.log"
   ```

3. **Permission Problems**

   ```bash
   # Check permissions
   ls -la
   # Fix if needed
   chmod -R u+w .
   ```

## Conclusion

Safe cleaning is essential. Remember to:

- Use dry runs
- Check patterns
- Verify targets
- Keep backups
- Follow best practices

## Next Steps

After mastering cleaning, consider:

- Learning about .gitignore
- Exploring Git hooks
- Understanding Git internals
- Setting up automated cleanup
