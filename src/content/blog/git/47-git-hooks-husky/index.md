---
title: "Git Hooks with Husky in JS"
summary: "Learn how to use Husky to manage Git hooks in your JavaScript projects for automated quality checks"
date: "2024, 04, 14"
tags: ["git", "husky", "git-hooks", "javascript", "automation"]
difficulty: "medium"
draft: false
---

## Git Hooks with Husky in JS

Husky is a powerful tool for managing Git hooks in JavaScript projects. This guide will show you how to set up and use Husky to automate quality checks and enforce project standards.

## What You'll Learn

- Setting up Husky
- Configuring Git hooks
- Common use cases
- Best practices
- Integration with tools

## Implementation Steps

1. **Install Husky**

   ```bash
   # Install Husky
   npm install husky --save-dev

   # Initialize Husky
   npx husky install

   # Enable Git hooks
   npm pkg set scripts.prepare="husky install"
   ```

   - Install package
   - Initialize setup
   - Enable hooks
   - Verify installation

2. **Configure Pre-commit Hook**

   ```bash
   # Create pre-commit hook
   npx husky add .husky/pre-commit "npm run lint"

   # Add lint script to package.json
   npm pkg set scripts.lint="eslint . --ext .js,.jsx,.ts,.tsx"
   ```

   - Create hook
   - Add script
   - Configure checks
   - Test setup

3. **Add Pre-push Hook**

   ```bash
   # Create pre-push hook
   npx husky add .husky/pre-push "npm run test"

   # Add test script
   npm pkg set scripts.test="jest"
   ```

   - Create hook
   - Add tests
   - Configure checks
   - Verify setup

4. **Configure Commit Message Hook**

   ```bash
   # Install commitlint
   npm install @commitlint/config-conventional @commitlint/cli --save-dev

   # Create commit-msg hook
   npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
   ```

   - Install tools
   - Create hook
   - Configure rules
   - Test setup

## Best Practices

1. **Hook Management**

   - Clear structure
   - Version control
   - Team sharing
   - Documentation

2. **Performance**

   - Fast execution
   - Parallel tasks
   - Caching
   - Selective checks

3. **Error Handling**

   - Clear messages
   - Helpful feedback
   - Recovery options
   - Logging

4. **Maintenance**

   - Regular updates
   - Version control
   - Team coordination
   - Documentation

## Common Use Cases

1. **Code Quality**

   ```bash
   # Add lint-staged
   npm install lint-staged --save-dev

   # Configure lint-staged
   npm pkg set scripts.lint-staged="lint-staged"
   npm pkg set lint-staged="{
     '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
     '*.{json,md}': ['prettier --write']
   }"

   # Update pre-commit hook
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

2. **Testing**

   ```bash
   # Add test script
   npm pkg set scripts.test="jest --coverage"

   # Update pre-push hook
   npx husky add .husky/pre-push "npm run test"
   ```

3. **Type Checking**

   ```bash
   # Add type check script
   npm pkg set scripts.type-check="tsc --noEmit"

   # Update pre-commit hook
   npx husky add .husky/pre-commit "npm run type-check"
   ```

4. **Security Checks**

   ```bash
   # Add security check
   npm install audit-ci --save-dev

   # Add security script
   npm pkg set scripts.security="audit-ci --moderate"

   # Update pre-push hook
   npx husky add .husky/pre-push "npm run security"
   ```

## Advanced Usage

1. **Custom Hooks**

   ```bash
   # Create custom hook
   npx husky add .husky/custom-hook "node scripts/custom-check.js"

   # Add to package.json
   npm pkg set scripts.custom-check="node scripts/custom-check.js"
   ```

2. **Conditional Execution**

   ```bash
   # Add conditional check
   npx husky add .husky/pre-commit "if [ -f package.json ]; then npm run lint; fi"
   ```

3. **Multiple Tools**

   ```bash
   # Configure multiple tools
   npm pkg set scripts.pre-commit="npm run lint && npm run test && npm run type-check"
   ```

4. **Team Configuration**

   ```bash
   # Add to package.json
   npm pkg set husky.hooks="{
     'pre-commit': 'npm run lint',
     'pre-push': 'npm run test',
     'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
   }"
   ```

## Common Issues and Solutions

1. **Hook Not Running**

   ```bash
   # Check installation
   ls -la .git/hooks

   # Reinstall hooks
   npx husky install
   ```

2. **Performance Issues**

   ```bash
   # Add caching
   npm pkg set scripts.lint="eslint . --cache"

   # Parallel execution
   npm install concurrently --save-dev
   npm pkg set scripts.checks="concurrently 'npm run lint' 'npm run test'"
   ```

3. **Error Handling**

   ```bash
   # Add error handling
   npx husky add .husky/pre-commit "npm run lint || (echo 'Lint failed' && exit 1)"
   ```

## Conclusion

Husky is essential for:

- Code quality
- Automated checks
- Team standards
- Project consistency
- Development workflow

## Next Steps

After setting up Husky, consider:

- Adding more hooks
- Integrating CI/CD
- Customizing checks
- Team adoption
