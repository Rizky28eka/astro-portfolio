---
title: "GitHub Pages for Hosting"
summary: "Learn how to deploy your website using GitHub Pages"
date: "2024, 04, 11"
tags: ["git", "github-pages", "hosting", "web-development", "tutorial"]
difficulty: "beginner"
draft: false
---

## GitHub Pages for Hosting

GitHub Pages is a powerful hosting service that lets you publish websites directly from your GitHub repository. This guide will show you how to set up and deploy your website using GitHub Pages.

## What You'll Learn

- Setting up GitHub Pages
- Different types of sites
- Custom domains
- Build and deployment
- Best practices

## Implementation Steps

1. **Basic Setup**

   ```bash
   # Create repository
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```

   - Initialize repository
   - Add your website files
   - Push to GitHub
   - Enable GitHub Pages

2. **Project Structure**

   ```
   repository/
   ├── index.html
   ├── styles.css
   ├── script.js
   └── _config.yml
   ```

   - Main HTML file
   - CSS styles
   - JavaScript files
   - Configuration

3. **GitHub Pages Settings**

   ```yaml
   # _config.yml
   theme: jekyll-theme-minimal
   title: My Website
   description: My awesome website
   ```

   - Choose theme
   - Set site title
   - Configure options
   - Customize settings

4. **Custom Domain**

   ```bash
   # Add custom domain
   echo "mywebsite.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

   - Add CNAME file
   - Configure DNS
   - Enable HTTPS
   - Verify setup

## Best Practices

1. **Repository Setup**

   - Use descriptive name
   - Add README file
   - Include license
   - Set up .gitignore

2. **Content Organization**

   - Clear file structure
   - Optimize assets
   - Use relative paths
   - Follow conventions

3. **Performance**

   - Optimize images
   - Minify resources
   - Enable caching
   - Use CDN

4. **Security**

   - Enable HTTPS
   - Secure custom domain
   - Protect sensitive data
   - Regular updates

## Common Use Cases

1. **Personal Portfolio**

   ```html
   <!-- index.html -->
   <!DOCTYPE html>
   <html>
     <head>
       <title>My Portfolio</title>
       <link rel="stylesheet" href="styles.css" />
     </head>
     <body>
       <h1>Welcome to My Portfolio</h1>
       <!-- Add your content -->
     </body>
   </html>
   ```

2. **Project Documentation**

   ````markdown
   # README.md

   ## Project Documentation

   ### Installation

   ```bash
   npm install
   ```
   ````

   ### Usage

   ```bash
   npm start
   ```

   ```

   ```

3. **Blog Site**

   ```yaml
   # _config.yml
   title: My Blog
   description: Personal blog
   baseurl: "/blog"
   ```

4. **Landing Page**

   ```html
   <!-- index.html -->
   <!DOCTYPE html>
   <html>
     <head>
       <title>Product Landing Page</title>
       <link rel="stylesheet" href="styles.css" />
     </head>
     <body>
       <header>
         <h1>Welcome to Our Product</h1>
       </header>
       <!-- Add your content -->
     </body>
   </html>
   ```

## Advanced Usage

1. **Jekyll Integration**

   ```yaml
   # _config.yml
   markdown: kramdown
   plugins:
     - jekyll-feed
     - jekyll-seo-tag
   ```

2. **Custom 404 Page**

   ```html
   <!-- 404.html -->
   <!DOCTYPE html>
   <html>
     <head>
       <title>Page Not Found</title>
     </head>
     <body>
       <h1>404 - Page Not Found</h1>
       <p>Sorry, the page you're looking for doesn't exist.</p>
     </body>
   </html>
   ```

3. **GitHub Actions**

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
   ```

4. **Custom Build Process**

   ```bash
   # package.json
   {
     "scripts": {
       "build": "webpack",
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

## Common Issues and Solutions

1. **Build Failures**

   ```bash
   # Check build logs
   # Fix build errors
   # Update dependencies
   # Verify configuration
   ```

2. **Custom Domain Issues**

   ```bash
   # Verify DNS settings
   # Check CNAME file
   # Wait for propagation
   # Clear cache
   ```

3. **Content Not Updating**

   ```bash
   # Clear cache
   # Force rebuild
   # Check file paths
   # Verify commits
   ```

## Conclusion

GitHub Pages is a powerful hosting solution. Remember to:

- Follow best practices
- Optimize performance
- Secure your site
- Regular maintenance
- Monitor analytics

## Next Steps

After mastering GitHub Pages, you might want to:

- Learn about Jekyll
- Explore GitHub Actions
- Study web optimization
- Understand CDN usage
