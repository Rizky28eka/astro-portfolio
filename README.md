# Astro Portfolio

A modern, responsive portfolio website built with Astro, showcasing professional experience, education, blog posts, and projects. This portfolio features a clean design with support for multiple content types including work experience, educational background, and technical blog posts.

## Description

This is a personal portfolio website that demonstrates professional experience in software development, training, and freelance work. The site includes sections for work experience, education, blog posts, and legal pages, all built with modern web technologies for optimal performance and SEO.

## Features

- 🚀 **Fast Performance** - Built with Astro for optimal loading speeds
- 📱 **Responsive Design** - Works seamlessly across all devices
- 📝 **Content Management** - Markdown-based content for easy updates
- 🎨 **Modern UI** - Clean and professional design with Tailwind CSS
- 📊 **Work Experience Showcase** - Detailed work history with technologies used
- 🎓 **Education Section** - Academic background and achievements
- 📖 **Technical Blog** - Share knowledge and tutorials
- 🔍 **SEO Optimized** - Built-in SEO best practices
- 📄 **Legal Pages** - Privacy policy and terms of use included
- 🏷️ **Content Categorization** - Organized content with tags and metadata

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/astro-portfolio.git
   ```

2. **Navigate to the project directory**

   ```bash
   cd astro-portfolio
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4321` to view the portfolio

## Usage

### Adding Work Experience

Create a new markdown file in `src/content/work/` with the following frontmatter:

```markdown
---
company: "Company Name"
role: "Your Role"
location: "City, Country"
dateStart: "YYYY-MM"
dateEnd: "YYYY-MM" # or "Present"
summary: "Brief description of your role"
technologies:
  - "Technology 1"
  - "Technology 2"
draft: false
---

Your detailed work experience description here...
```

### Adding Education

Create a new markdown file in `src/content/education/` with the following frontmatter:

```markdown
---
school: "School Name"
degree: "Your Degree"
dateStart: "YYYY-MM"
dateEnd: "YYYY-MM"
description: "Brief description"
draft: false
location: "City, Country"
---

Your detailed education description here...
```

### Adding Blog Posts

Create a new markdown file in `src/content/blog/` with the following frontmatter:

```markdown
---
title: "Your Blog Post Title"
summary: "Brief summary of the post"
date: "YYYY, MM, DD"
draft: false
tags:
  - "Tag1"
  - "Tag2"
---

Your blog post content here...
```

### Customizing Contact Information

Update the contact information in `src/consts.ts`:

```typescript
export const CONTACT: Page = {
  TITLE: "Contact",
  DESCRIPTION: "Your custom contact description",
};
```

## Tech Stack / Technologies Used

- **Framework**: [Astro](https://astro.build/) - Modern static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Content**: Markdown with frontmatter for content management
- **TypeScript**: For type-safe development
- **Utilities**:
  - `clsx` and `tailwind-merge` for conditional styling
  - Custom date parsing and sorting utilities

### Technologies Showcased in Portfolio

- **Frontend**: React, Next.js, Flutter, HTML, CSS, JavaScript
- **Backend**: Laravel, PHP, Node.js
- **Mobile**: Flutter (Dart), Kotlin, Android
- **Database**: MySQL
- **Cloud**: Amazon S3
- **Machine Learning**: Python, TensorFlow, scikit-learn
- **Other**: Bootstrap, Blade Templating, MVVM Architecture

## Contribution Guide

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Areas for Contribution

- UI/UX improvements
- Performance optimizations
- Additional content types
- Accessibility enhancements
- Documentation improvements

## Project Structure

```
astro-portfolio/
├── src/
│   ├── content/
│   │   ├── blog/          # Blog posts
│   │   ├── education/     # Education entries
│   │   ├── legal/         # Legal pages
│   │   └── work/          # Work experience
│   ├── lib/
│   │   ├── data.ts        # Data utilities
│   │   └── utils.ts       # General utilities
│   └── consts.ts          # Site constants
├── public/                # Static assets
└── README.md
```

## License

[Add License Info Here]

## Contact Information

- **GitHub**: [Add GitHub Profile Here]
- **Email**: [Add Email Here]
- **LinkedIn**: [Add LinkedIn Profile Here]
- **Portfolio**: [Add Live Portfolio URL Here]

---

Built with ❤️ using Astro and modern web technologies.
