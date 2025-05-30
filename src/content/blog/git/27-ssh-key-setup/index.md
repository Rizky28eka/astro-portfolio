---
title: "SSH Key Setup for GitHub"
summary: "Learn how to set up secure SSH authentication for GitHub"
date: "2024, 04, 14"
tags: ["git", "github", "ssh", "security", "authentication"]
difficulty: "beginner"
draft: false
---

## SSH Key Setup for GitHub

Setting up SSH keys for GitHub provides a secure and convenient way to authenticate without using passwords. This guide will walk you through the process of generating, adding, and using SSH keys with GitHub.

## What You'll Learn

- Generating SSH keys
- Adding keys to GitHub
- Testing the connection
- Managing multiple keys
- Troubleshooting

## Implementation Steps

1. **Generate SSH Key**

   ```bash
   # Generate new SSH key
   ssh-keygen -t ed25519 -C "your.email@example.com"

   # Start SSH agent
   eval "$(ssh-agent -s)"

   # Add key to SSH agent
   ssh-add ~/.ssh/id_ed25519
   ```

   - Choose key type
   - Set passphrase
   - Start agent
   - Add key

2. **Add Key to GitHub**

   ```bash
   # Copy public key
   cat ~/.ssh/id_ed25519.pub

   # Test connection
   ssh -T git@github.com
   ```

   - Copy public key
   - Add to GitHub
   - Test connection
   - Verify setup

3. **Configure Git**

   ```bash
   # Update remote URL
   git remote set-url origin git@github.com:username/repo.git

   # Verify remote
   git remote -v
   ```

   - Update remotes
   - Test push
   - Verify access
   - Check permissions

4. **Multiple Keys**

   ```bash
   # Create config file
   touch ~/.ssh/config

   # Add configuration
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_ed25519
   ```

   - Create config
   - Add hosts
   - Set identities
   - Test access

## Best Practices

1. **Key Security**

   - Use strong passphrases
   - Keep private key secure
   - Regular key rotation
   - Monitor access

2. **Key Management**

   - Organize keys
   - Label clearly
   - Document purpose
   - Regular audit

3. **Access Control**

   - Limit key access
   - Use deploy keys
   - Monitor usage
   - Revoke unused

4. **Backup**

   - Backup keys
   - Secure storage
   - Recovery plan
   - Regular checks

## Common Use Cases

1. **Personal Account**

   ```bash
   # Generate personal key
   ssh-keygen -t ed25519 -C "personal@email.com"
   ```

2. **Work Account**

   ```bash
   # Generate work key
   ssh-keygen -t ed25519 -C "work@company.com"
   ```

3. **Deploy Keys**

   ```bash
   # Generate deploy key
   ssh-keygen -t ed25519 -C "deploy@example.com"
   ```

4. **CI/CD**

   ```bash
   # Generate CI key
   ssh-keygen -t ed25519 -C "ci@example.com"
   ```

## Advanced Usage

1. **Key Rotation**

   ```bash
   # Generate new key
   ssh-keygen -t ed25519 -C "new@email.com"

   # Add to agent
   ssh-add ~/.ssh/id_ed25519_new
   ```

2. **Custom Config**

   ```bash
   # ~/.ssh/config
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_ed25519
     AddKeysToAgent yes
     UseKeychain yes
   ```

3. **Deploy Keys**

   ```bash
   # Generate deploy key
   ssh-keygen -t ed25519 -C "deploy@example.com" -f ~/.ssh/deploy_key
   ```

4. **Key Signing**

   ```bash
   # Sign key
   ssh-keygen -s ~/.ssh/ca -I user@example.com ~/.ssh/id_ed25519.pub
   ```

## Common Issues and Solutions

1. **Connection Refused**

   ```bash
   # Check SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519

   # Test connection
   ssh -vT git@github.com
   ```

2. **Permission Denied**

   ```bash
   # Check permissions
   chmod 600 ~/.ssh/id_ed25519
   chmod 644 ~/.ssh/id_ed25519.pub

   # Verify key
   ssh-add -l
   ```

3. **Agent Issues**

   ```bash
   # Restart agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

## Conclusion

SSH key authentication provides secure and convenient access to GitHub. Remember to:

- Use strong keys
- Keep keys secure
- Regular maintenance
- Monitor access
- Follow best practices

## Next Steps

After setting up SSH keys, consider:

- Learning about deploy keys
- Exploring key signing
- Understanding key rotation
- Setting up automated workflows
