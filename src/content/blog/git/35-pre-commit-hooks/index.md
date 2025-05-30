---
title: "Set Up Pre-Commit Hooks"
summary: "Learn how to set up and use pre-commit hooks to automate checks before commits"
date: "2024, 04, 14"
tags: ["git", "hooks", "automation", "tutorial", "best-practices"]
difficulty: "advanced"
draft: false
---

## Set Up Pre-Commit Hooks

Pre-commit hooks are scripts that run automatically before each commit. This guide will show you how to set up and use pre-commit hooks to enforce code quality and consistency.

## What You'll Learn

- Creating hooks
- Common hooks
- Best practices
- Troubleshooting
- Advanced usage

## Implementation Steps

1. **Basic Setup**

   ```bash
   # Create hooks directory
   mkdir -p .git/hooks

   # Create pre-commit hook
   touch .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

   - Set up directory
   - Create hook
   - Set permissions
   - Test hook

2. **Simple Hook**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Run tests
   npm test

   # Check linting
   npm run lint

   # Exit with error if any check fails
   if [ $? -ne 0 ]; then
     echo "Tests or linting failed. Commit aborted."
     exit 1
   fi
   ```

   - Write script
   - Add checks
   - Handle errors
   - Test functionality

3. **Common Checks**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Check for debug statements
   if git diff --cached | grep -i "console.log"; then
     echo "Error: console.log statements found"
     exit 1
   fi

   # Check file size
   if git diff --cached --name-only | xargs ls -l | awk '{sum+=$5} END {if(sum>1000000) exit 1}'; then
     echo "Error: Files too large"
     exit 1
   fi
   ```

   - Add checks
   - Set limits
   - Handle errors
   - Test hooks

4. **Advanced Setup**

   ```bash
   # Install pre-commit framework
   pip install pre-commit

   # Create config
   touch .pre-commit-config.yaml
   ```

   - Use framework
   - Configure hooks
   - Set up checks
   - Test setup

## Best Practices

1. **Hook Design**

   - Keep it simple
   - Fail fast
   - Clear messages
   - Handle errors

2. **Performance**

   - Optimize checks
   - Cache results
   - Skip when needed
   - Monitor time

3. **Maintenance**

   - Document hooks
   - Version control
   - Regular updates
   - Team review

4. **Security**

   - Validate input
   - Check permissions
   - Safe execution
   - Monitor access

## Common Use Cases

1. **Code Quality**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Run linter
   npm run lint

   # Run tests
   npm test

   # Check formatting
   npm run format
   ```

2. **File Checks**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Check file extensions
   for file in $(git diff --cached --name-only); do
     if [[ $file == *.md ]]; then
       # Check markdown
       markdownlint $file
     fi
   done
   ```

3. **Security Checks**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Check for secrets
   if git diff --cached | grep -i "password\|secret\|key"; then
     echo "Error: Potential secrets found"
     exit 1
   fi
   ```

4. **Documentation**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Check for TODO comments
   if git diff --cached | grep -i "TODO"; then
     echo "Warning: TODO comments found"
   fi
   ```

## Advanced Usage

1. **Framework Integration**

   ```yaml
   # .pre-commit-config.yaml
   repos:
     - repo: https://github.com/pre-commit/pre-commit-hooks
       rev: v4.4.0
       hooks:
         - id: trailing-whitespace
         - id: end-of-file-fixer
         - id: check-yaml
         - id: check-added-large-files
   ```

2. **Custom Hooks**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Run custom checks
   ./scripts/custom-check.sh

   # Run specific tests
   npm run test:changed
   ```

3. **Conditional Execution**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Skip hooks if needed
   if [ -f .skip-hooks ]; then
     exit 0
   fi

   # Run checks
   npm test
   ```

4. **Team Hooks**

   ```bash
   #!/bin/bash
   # .git/hooks/pre-commit

   # Check team standards
   ./scripts/team-standards.sh

   # Run team checks
   npm run team:check
   ```

## Common Issues and Solutions

1. **Hook Not Running**

   ```bash
   # Check permissions
   chmod +x .git/hooks/pre-commit

   # Verify hook
   git commit --dry-run
   ```

2. **Performance Issues**

   ```bash
   # Add caching
   if [ -f .hook-cache ] && [ $(git diff --cached --name-only | md5sum) = $(cat .hook-cache) ]; then
     exit 0
   fi
   ```

3. **False Positives**

   ```bash
   # Add exceptions
   if [[ $file == *"test"* ]]; then
     # Skip checks for test files
     exit 0
   fi
   ```

## Conclusion

Pre-commit hooks are powerful tools. Remember to:

- Start simple
- Test thoroughly
- Document well
- Monitor performance
- Follow best practices

## Next Steps

After mastering pre-commit hooks, consider:

- Learning Git workflows
- Exploring CI/CD
- Understanding Git internals
- Setting up automated testing
