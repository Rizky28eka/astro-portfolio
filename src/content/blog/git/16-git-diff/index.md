---
title: "Git Diff to Compare Changes"
summary: "Learn how to check code differences instantly and effectively"
date: "2024, 04, 04"
tags: ["git", "git-diff", "version-control", "tutorial", "code-review"]
difficulty: "medium"
draft: false
---

## Git Diff to Compare Changes

Git diff is a powerful command for comparing changes in your repository. This guide will show you how to use Git diff effectively to review code changes, track modifications, and understand differences between versions.

## What You'll Learn

- Basic Git diff commands
- Different diff formats and options
- How to compare specific changes
- Visualizing differences
- Best practices for code review

## Implementation Steps

1. **Basic Diff Command**

   ```bash
   # Show unstaged changes
   git diff
   ```

   - Shows changes in working directory
   - Compares with staged changes
   - Displays line-by-line differences
   - Uses +/- to show additions/deletions

2. **Staged Changes**

   ```bash
   # Show staged changes
   git diff --staged
   ```

   - Shows changes ready to commit
   - Compares with last commit
   - Good for review before commit
   - Helps catch mistakes

3. **Compare Commits**

   ```bash
   # Compare two commits
   git diff commit1 commit2

   # Compare with previous commit
   git diff HEAD~1
   ```

   - Shows changes between commits
   - Useful for code review
   - Helps track feature changes
   - Good for release notes

4. **Compare Branches**

   ```bash
   # Compare branches
   git diff main..feature

   # Compare with remote
   git diff origin/main
   ```

   - Shows branch differences
   - Helps with merge planning
   - Good for feature review
   - Useful for conflict resolution

## Best Practices

1. **Diff Formatting**

   - Use `--color-words` for word-level changes
   - Use `--stat` for summary
   - Use `--name-only` for file list
   - Use `--name-status` for file status

2. **Code Review**

   - Review changes before committing
   - Check for unintended changes
   - Look for sensitive data
   - Verify formatting

3. **Diff Tools**

   ```bash
   # Configure external diff tool
   git config --global diff.tool vscode
   git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
   ```

4. **Diff Documentation**

   - Document significant changes
   - Explain complex diffs
   - Reference issue numbers
   - Keep diffs focused

## Common Use Cases

1. **Reviewing Changes**

   ```bash
   # Show word-level changes
   git diff --color-words

   # Show file statistics
   git diff --stat
   ```

2. **Comparing Files**

   ```bash
   # Compare specific files
   git diff file1.txt file2.txt

   # Compare file versions
   git diff HEAD~1:file.txt file.txt
   ```

3. **Checking Staged Changes**

   ```bash
   # Show staged changes
   git diff --staged

   # Show staged file list
   git diff --staged --name-only
   ```

4. **Branch Comparison**

   ```bash
   # Show branch differences
   git diff main...feature

   # Show file changes
   git diff main...feature -- file.txt
   ```

## Advanced Usage

1. **Custom Diff Format**

   ```bash
   # Show context lines
   git diff -U5

   # Show function context
   git diff -W
   ```

2. **Diff with Blame**

   ```bash
   # Show who changed each line
   git blame file.txt

   # Show commit info
   git log -p file.txt
   ```

3. **Diff with Patches**

   ```bash
   # Create patch file
   git diff > changes.patch

   # Apply patch
   git apply changes.patch
   ```

4. **Diff with Reflog**

   ```bash
   # Show all changes
   git diff HEAD@{1}

   # Show branch changes
   git diff HEAD@{1}...HEAD
   ```

## Common Issues and Solutions

1. **Large Diffs**

   ```bash
   # Show only file names
   git diff --name-only

   # Show only changed lines
   git diff --unified=0
   ```

2. **Binary Files**

   ```bash
   # Show binary file changes
   git diff --text

   # Ignore binary files
   git diff --diff-filter=AM
   ```

3. **Whitespace Changes**

   ```bash
   # Ignore whitespace
   git diff -w

   # Show only whitespace
   git diff --check
   ```

## Conclusion

Git diff is an essential tool for code review and change tracking. Remember to:

- Use appropriate diff formats
- Review changes carefully
- Document significant changes
- Keep diffs focused
- Use diff tools effectively

## Next Steps

After mastering Git diff, you might want to:

- Learn about Git merge
- Explore Git rebase
- Study Git hooks
- Understand Git internals
