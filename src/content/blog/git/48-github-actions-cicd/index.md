---
title: "Set Up GitHub Actions CI/CD"
summary: "Learn how to set up and configure GitHub Actions for continuous integration and deployment"
date: "2024, 04, 14"
tags: ["git", "github-actions", "ci-cd", "automation", "deployment"]
difficulty: "medium"
draft: false
---

## Set Up GitHub Actions CI/CD

GitHub Actions provides powerful automation capabilities for your development workflow. This guide will show you how to set up and configure CI/CD pipelines using GitHub Actions.

## What You'll Learn

- Setting up GitHub Actions
- Creating workflows
- Configuring jobs
- Best practices
- Common use cases

## Implementation Steps

1. **Basic Workflow Setup**

   ```yaml
   # .github/workflows/main.yml
   name: CI/CD Pipeline

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "18"
         - name: Install dependencies
           run: npm ci
         - name: Build
           run: npm run build
   ```

   - Create workflow
   - Configure triggers
   - Set up environment
   - Define steps

2. **Testing Workflow**

   ```yaml
   # .github/workflows/test.yml
   name: Test Suite

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "18"
         - name: Install dependencies
           run: npm ci
         - name: Run tests
           run: npm test
         - name: Upload coverage
           uses: codecov/codecov-action@v3
   ```

   - Configure tests
   - Set up coverage
   - Define triggers
   - Add reporting

3. **Deployment Workflow**

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy

   on:
     push:
       branches: [main]
       tags: ["v*"]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: "18"
         - name: Install dependencies
           run: npm ci
         - name: Build
           run: npm run build
         - name: Deploy
           run: npm run deploy
   ```

   - Configure deployment
   - Set up triggers
   - Define environment
   - Add security

4. **Environment Setup**

   ```yaml
   # .github/workflows/environment.yml
   name: Environment Setup

   on:
     workflow_dispatch:

   jobs:
     setup:
       runs-on: ubuntu-latest
       environment: production
       steps:
         - name: Setup environment
           run: |
             echo "Setting up environment..."
             # Add setup commands
   ```

   - Configure environments
   - Set up secrets
   - Define variables
   - Add protection

## Best Practices

1. **Workflow Design**

   - Clear structure
   - Modular jobs
   - Reusable workflows
   - Documentation

2. **Security**

   - Secret management
   - Environment protection
   - Access control
   - Security scanning

3. **Performance**

   - Caching
   - Parallel jobs
   - Resource optimization
   - Timeout management

4. **Maintenance**

   - Regular updates
   - Version control
   - Monitoring
   - Logging

## Common Use Cases

1. **Node.js Application**

   ```yaml
   # .github/workflows/nodejs.yml
   name: Node.js CI

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       strategy:
         matrix:
           node-version: [16.x, 18.x]
       steps:
         - uses: actions/checkout@v3
         - name: Use Node.js ${{ matrix.node-version }}
           uses: actions/setup-node@v3
           with:
             node-version: ${{ matrix.node-version }}
         - run: npm ci
         - run: npm test
   ```

2. **Docker Build**

   ```yaml
   # .github/workflows/docker.yml
   name: Docker Build

   on:
     push:
       branches: [main]
       tags: ["v*"]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Build Docker image
           uses: docker/build-push-action@v4
           with:
             context: .
             push: true
             tags: user/app:latest
   ```

3. **Static Site**

   ```yaml
   # .github/workflows/static.yml
   name: Deploy Static Site

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

4. **Mobile App**

   ```yaml
   # .github/workflows/mobile.yml
   name: Mobile CI

   on: [push, pull_request]

   jobs:
     build:
       runs-on: macos-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Xcode
           uses: maxim-lobanov/setup-xcode@v1
         - name: Build iOS
           run: xcodebuild -scheme App -sdk iphonesimulator
   ```

## Advanced Usage

1. **Matrix Builds**

   ```yaml
   # .github/workflows/matrix.yml
   name: Matrix Build

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ${{ matrix.os }}
       strategy:
         matrix:
           os: [ubuntu-latest, windows-latest, macos-latest]
           node-version: [16.x, 18.x]
       steps:
         - uses: actions/checkout@v3
         - name: Use Node.js ${{ matrix.node-version }}
           uses: actions/setup-node@v3
           with:
             node-version: ${{ matrix.node-version }}
   ```

2. **Caching**

   ```yaml
   # .github/workflows/cache.yml
   name: Cached Build

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Cache dependencies
           uses: actions/cache@v3
           with:
             path: ~/.npm
             key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

3. **Environment Variables**

   ```yaml
   # .github/workflows/env.yml
   name: Environment Variables

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       env:
         NODE_ENV: production
         API_URL: ${{ secrets.API_URL }}
       steps:
         - uses: actions/checkout@v3
         - name: Build
           run: npm run build
   ```

4. **Scheduled Jobs**

   ```yaml
   # .github/workflows/schedule.yml
   name: Scheduled Job

   on:
     schedule:
       - cron: "0 0 * * *"

   jobs:
     scheduled:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Run scheduled task
           run: npm run scheduled-task
   ```

## Common Issues and Solutions

1. **Workflow Failures**

   ```yaml
   # .github/workflows/error-handling.yml
   name: Error Handling

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Build
           run: npm run build
           continue-on-error: true
         - name: Notify on failure
           if: failure()
           run: |
             echo "Build failed"
             # Add notification logic
   ```

2. **Timeout Issues**

   ```yaml
   # .github/workflows/timeout.yml
   name: Timeout Handling

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       timeout-minutes: 30
       steps:
         - uses: actions/checkout@v3
         - name: Build
           run: npm run build
   ```

3. **Resource Limits**

   ```yaml
   # .github/workflows/resources.yml
   name: Resource Management

   on: [push, pull_request]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Build
           run: |
             npm ci --no-audit
             npm run build
   ```

## Conclusion

GitHub Actions is powerful for:

- Automated workflows
- CI/CD pipelines
- Quality assurance
- Deployment automation
- Team collaboration

## Next Steps

After setting up GitHub Actions, consider:

- Adding more workflows
- Optimizing performance
- Setting up monitoring
- Implementing security
