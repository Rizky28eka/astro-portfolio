---
title: "Secure Your Git Commits (GPG)"
summary: "Learn how to sign your Git commits with GPG keys to ensure authenticity and security"
date: "2024, 04, 14"
tags: ["git", "gpg", "security", "authentication", "best-practices"]
difficulty: "advanced"
draft: false
---

## Secure Your Git Commits (GPG)

GPG (GNU Privacy Guard) signing adds an extra layer of security to your Git commits. This guide shows you how to set up and use GPG signing for your Git commits.

## What You'll Learn

- Setting up GPG
- Creating keys
- Configuring Git
- Signing commits
- Best practices

## Implementation Steps

1. **GPG Setup**

   ```bash
   # Install GPG
   # macOS
   brew install gnupg

   # Ubuntu/Debian
   sudo apt-get install gnupg

   # Windows
   # Download from https://www.gnupg.org/download/
   ```

   - Install GPG
   - Verify installation
   - Check version
   - Update if needed

2. **Key Generation**

   ```bash
   # Generate new key
   gpg --full-generate-key

   # List keys
   gpg --list-secret-keys --keyid-format LONG

   # Export public key
   gpg --armor --export YOUR_KEY_ID
   ```

   - Choose key type
   - Set key size
   - Set expiration
   - Add user info

3. **Git Configuration**

   ```bash
   # Configure Git to use GPG
   git config --global user.signingkey YOUR_KEY_ID

   # Enable automatic signing
   git config --global commit.gpgsign true

   # Set GPG program
   git config --global gpg.program $(which gpg)
   ```

   - Set signing key
   - Enable signing
   - Configure program
   - Test setup

4. **Commit Signing**

   ```bash
   # Sign a commit
   git commit -S -m "Signed commit message"

   # Verify signature
   git log --show-signature

   # Push signed commit
   git push
   ```

   - Sign commits
   - Verify signatures
   - Push changes
   - Check status

## Best Practices

1. **Key Management**

   - Secure storage
   - Regular rotation
   - Backup keys
   - Revoke old keys

2. **Security**

   - Strong passwords
   - Key protection
   - Secure storage
   - Regular updates

3. **Workflow**

   - Always sign
   - Verify signatures
   - Check status
   - Document process

4. **Team Setup**

   - Share public keys
   - Verify team keys
   - Set policies
   - Train team

## Common Use Cases

1. **Initial Setup**

   ```bash
   # Generate key
   gpg --full-generate-key

   # Configure Git
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true

   # Test signing
   git commit -S -m "Test signed commit"
   ```

2. **Team Integration**

   ```bash
   # Export public key
   gpg --armor --export YOUR_KEY_ID > public.key

   # Share with team
   # Team imports key
   gpg --import public.key

   # Verify import
   gpg --list-keys
   ```

3. **Key Rotation**

   ```bash
   # Generate new key
   gpg --full-generate-key

   # Update Git config
   git config --global user.signingkey NEW_KEY_ID

   # Revoke old key
   gpg --gen-revoke OLD_KEY_ID
   ```

4. **Troubleshooting**

   ```bash
   # Check GPG status
   gpg --status-fd=2 -bsau YOUR_KEY_ID

   # Verify Git config
   git config --list | grep gpg

   # Test signing
   echo "test" | gpg --clearsign
   ```

## Advanced Usage

1. **Multiple Keys**

   ```bash
   # List keys
   gpg --list-secret-keys

   # Use specific key
   git config --global user.signingkey SPECIFIC_KEY_ID

   # Sign with key
   git commit -S -m "Signed with specific key"
   ```

2. **Automated Signing**

   ```bash
   # Enable auto-signing
   git config --global commit.gpgsign true

   # Configure for specific repo
   git config commit.gpgsign true

   # Verify auto-signing
   git commit -m "Auto-signed commit"
   ```

3. **Key Backup**

   ```bash
   # Export private key
   gpg --export-secret-keys YOUR_KEY_ID > private.key

   # Export public key
   gpg --export YOUR_KEY_ID > public.key

   # Backup keys
   # Store securely
   ```

4. **Revocation**

   ```bash
   # Generate revocation
   gpg --gen-revoke YOUR_KEY_ID

   # Save revocation
   # Distribute to team

   # Update Git config
   git config --global user.signingkey NEW_KEY_ID
   ```

## Common Issues and Solutions

1. **Signing Failures**

   ```bash
   # Check GPG agent
   gpgconf --kill gpg-agent
   gpg-agent --daemon

   # Verify key
   gpg --list-secret-keys

   # Test signing
   echo "test" | gpg --clearsign
   ```

2. **Configuration Issues**

   ```bash
   # Check Git config
   git config --list | grep gpg

   # Verify GPG path
   which gpg

   # Update config
   git config --global gpg.program $(which gpg)
   ```

3. **Key Problems**

   ```bash
   # Check key status
   gpg --list-keys

   # Verify key
   gpg --edit-key YOUR_KEY_ID

   # Update key
   gpg --refresh-keys
   ```

## Conclusion

GPG signing enhances security. Remember to:

- Keep keys secure
- Sign consistently
- Verify signatures
- Update regularly
- Follow practices

## Next Steps

After mastering GPG signing, consider:

- Learning more security
- Exploring SSH keys
- Understanding encryption
- Advanced authentication
