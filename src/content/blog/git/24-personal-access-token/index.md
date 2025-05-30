---
title: "Creating Personal Access Token"
summary: "Learn how to authenticate GitHub via terminal securely"
date: "2024, 04, 12"
tags: ["git", "github-token", "security", "authentication", "tutorial"]
difficulty: "medium"
draft: false
---

## Creating Personal Access Token

Personal Access Tokens (PATs) provide a secure way to authenticate with GitHub from the command line or other applications. This guide will show you how to create and use PATs effectively.

## What You'll Learn

- Creating a PAT
- Setting token permissions
- Using tokens securely
- Best practices
- Token management

## Implementation Steps

1. **Creating a Token**

   ```bash
   # GitHub Settings > Developer Settings > Personal Access Tokens
   # Click "Generate new token"
   ```

   - Choose token type
   - Set expiration
   - Select scopes
   - Generate token

2. **Token Permissions**

   ```bash
   # Common scopes
   repo        # Full control of private repositories
   workflow    # Update GitHub Action workflows
   write:packages  # Upload packages to GitHub Package Registry
   delete:packages # Delete packages
   ```

   - Select minimal permissions
   - Consider token purpose
   - Review access levels
   - Set expiration

3. **Using the Token**

   ```bash
   # Store token in Git credentials
   git config --global credential.helper store
   # When prompted, use token as password
   git push origin main
   ```

   - Use as password
   - Store securely
   - Never share token
   - Rotate regularly

4. **Token Security**

   ```bash
   # Check token usage
   git config --global --list | grep credential

   # Remove stored credentials
   git config --global --unset credential.helper
   ```

   - Monitor usage
   - Revoke when needed
   - Use environment variables
   - Follow security best practices

## Best Practices

1. **Token Creation**

   - Use descriptive names
   - Set appropriate expiration
   - Choose minimal scopes
   - Document token purpose

2. **Token Storage**

   - Use credential manager
   - Store in environment variables
   - Never commit to repository
   - Use secure storage

3. **Token Usage**

   - Use HTTPS URLs
   - Rotate tokens regularly
   - Monitor token activity
   - Revoke unused tokens

4. **Security Measures**

   - Enable 2FA
   - Use token expiration
   - Monitor token usage
   - Follow security guidelines

## Common Use Cases

1. **CI/CD Integration**

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   on: [push]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

2. **Automated Scripts**

   ```bash
   # Use token in script
   export GITHUB_TOKEN="your-token"
   ./deploy-script.sh
   ```

3. **Package Publishing**

   ```bash
   # Publish to GitHub Packages
   npm publish --registry=https://npm.pkg.github.com
   ```

4. **API Access**

   ```bash
   # Use token with curl
   curl -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/user
   ```

## Advanced Usage

1. **Token Rotation**

   ```bash
   # Create new token
   # Update all systems
   # Revoke old token
   ```

2. **Fine-grained Permissions**

   ```bash
   # Select specific repository access
   # Choose exact permissions
   # Set expiration
   ```

3. **Token Monitoring**

   ```bash
   # Check token usage
   # Review access logs
   # Monitor for abuse
   ```

4. **Automated Management**

   ```bash
   # Script to rotate tokens
   # Automated monitoring
   # Security alerts
   ```

## Common Issues and Solutions

1. **Token Expired**

   ```bash
   # Create new token
   # Update credentials
   # Update systems
   ```

2. **Access Denied**

   ```bash
   # Check token permissions
   # Verify token validity
   # Update token if needed
   ```

3. **Security Breach**

   ```bash
   # Revoke compromised token
   # Create new token
   # Update all systems
   # Review security logs
   ```

## Conclusion

Personal Access Tokens are essential for secure GitHub authentication. Remember to:

- Create tokens carefully
- Store tokens securely
- Monitor token usage
- Rotate tokens regularly
- Follow security best practices

## Next Steps

After mastering Personal Access Tokens, you might want to:

- Learn about OAuth apps
- Explore GitHub Actions
- Study API authentication
- Understand security best practices
