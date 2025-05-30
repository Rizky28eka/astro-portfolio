---
title: "Git Tips Every Developer Should Know"
summary: "Essential Git tips and tricks to improve your workflow and productivity as a developer"
date: "2024, 04, 14"
tags: ["git", "tips", "productivity", "workflow", "best-practices"]
difficulty: "easy"
draft: false
---

## Git Tips Every Developer Should Know

Git is a powerful version control system, and knowing the right tips and tricks can significantly improve your workflow. This guide covers essential Git tips that every developer should know.

## What You'll Learn

- Essential Git commands
- Productivity tips
- Best practices
- Common workflows
- Troubleshooting tricks

## Implementation Steps

1. **Basic Git Configuration**

   ```bash
   # Set up your identity
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"

   # Configure default editor
   git config --global core.editor "code --wait"

   # Set default branch name
   git config --global init.defaultBranch main

   # Configure line endings
   git config --global core.autocrlf input  # for macOS/Linux
   git config --global core.autocrlf true   # for Windows
   ```

   - Set identity
   - Configure editor
   - Set defaults
   - Handle line endings

2. **Useful Aliases**

   ```bash
   # Add common aliases
   git config --global alias.st status
   git config --global alias.co checkout
   git config --global alias.br branch
   git config --global alias.ci commit
   git config --global alias.unstage 'reset HEAD --'
   git config --global alias.last 'log -1 HEAD'
   git config --global alias.visual '!gitk'
   ```

   - Create shortcuts
   - Save time
   - Improve workflow
   - Customize commands

3. **Efficient Committing**

   ```bash
   # Stage specific changes
   git add -p  # Interactive staging

   # Create meaningful commits
   git commit -m "feat: add user authentication"
   git commit -m "fix: resolve login bug"
   git commit -m "docs: update README"

   # Amend last commit
   git commit --amend --no-edit  # Keep message
   git commit --amend -m "New message"  # Change message
   ```

   - Stage selectively
   - Write good messages
   - Fix mistakes
   - Follow conventions

4. **Branch Management**

   ```bash
   # Create and switch
   git checkout -b feature/new-feature

   # List branches
   git branch -v  # Show last commit
   git branch -vv  # Show tracking info

   # Clean up branches
   git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
   git remote prune origin  # Clean remote refs
   ```

   - Create branches
   - Track changes
   - Clean up
   - Stay organized

## Best Practices

1. **Commit Messages**

   - Use present tense
   - Be specific
   - Follow conventions
   - Keep it concise

2. **Branch Strategy**

   - Meaningful names
   - Short-lived branches
   - Regular cleanup
   - Clear purpose

3. **Code Review**

   - Small commits
   - Clear changes
   - Good descriptions
   - Follow standards

4. **Security**

   - Protect sensitive data
   - Use .gitignore
   - Review changes
   - Secure credentials

## Common Use Cases

1. **Undoing Changes**

   ```bash
   # Discard working changes
   git checkout -- file.txt
   git restore file.txt  # Git 2.23+

   # Reset to specific commit
   git reset --soft HEAD~1  # Keep changes staged
   git reset --mixed HEAD~1  # Keep changes unstaged
   git reset --hard HEAD~1  # Discard changes

   # Revert a commit
   git revert HEAD  # Undo last commit
   git revert <commit-hash>  # Undo specific commit
   ```

2. **Stashing**

   ```bash
   # Save changes
   git stash save "Work in progress"
   git stash push -m "Work in progress"

   # List stashes
   git stash list

   # Apply stashes
   git stash apply stash@{0}
   git stash pop  # Apply and remove

   # Clear stashes
   git stash drop stash@{0}
   git stash clear
   ```

3. **Logging**

   ```bash
   # View history
   git log --oneline  # Compact view
   git log --graph --oneline --all  # Visual history
   git log -p  # Show changes
   git log --stat  # Show stats

   # Search history
   git log -S "search term"  # Search content
   git log --author="name"  # Search author
   git log --since="2 weeks ago"  # Time-based
   ```

4. **Merging**

   ```bash
   # Merge strategies
   git merge --no-ff feature  # Keep history
   git merge --squash feature  # Single commit
   git merge --abort  # Cancel merge

   # Resolve conflicts
   git status  # Check conflicts
   git diff  # View differences
   git add .  # Mark resolved
   git commit  # Complete merge
   ```

## Advanced Usage

1. **Rebasing**

   ```bash
   # Interactive rebase
   git rebase -i HEAD~3  # Last 3 commits
   git rebase -i origin/main  # Rebase on main

   # Continue/abort
   git rebase --continue
   git rebase --abort

   # Skip commit
   git rebase --skip
   ```

2. **Cherry-picking**

   ```bash
   # Pick specific commits
   git cherry-pick <commit-hash>
   git cherry-pick -x <commit-hash>  # Add reference

   # Multiple commits
   git cherry-pick <commit1> <commit2>
   git cherry-pick <commit1>..<commit2>
   ```

3. **Submodules**

   ```bash
   # Add submodule
   git submodule add <repository-url>

   # Update submodules
   git submodule update --init --recursive
   git submodule update --remote

   # Remove submodule
   git submodule deinit <path>
   git rm <path>
   ```

4. **Hooks**

   ```bash
   # Create hook
   touch .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit

   # Example pre-commit
   #!/bin/sh
   npm run lint
   npm run test
   ```

## Common Issues and Solutions

1. **Merge Conflicts**

   ```bash
   # View conflicts
   git diff --name-only --diff-filter=U

   # Use visual tools
   git mergetool

   # Abort merge
   git merge --abort
   ```

2. **Lost Commits**

   ```bash
   # Find lost commits
   git reflog
   git fsck --lost-found

   # Recover commit
   git reset --hard <commit-hash>
   ```

3. **Large Files**

   ```bash
   # Find large files
   git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | awk '{print$1}')"

   # Clean history
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/large/file' --prune-empty --tag-name-filter cat -- --all
   ```

## Conclusion

These Git tips help with:

- Productivity
- Code quality
- Team collaboration
- Project management
- Problem solving

## Next Steps

After learning these tips, consider:

- Creating custom aliases
- Setting up hooks
- Learning more commands
- Sharing knowledge
