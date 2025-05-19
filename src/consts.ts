import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "R28eka",
  DESCRIPTION: "Welcome to Astro Sphere, a portfolio and blog for designers and developers.",
  AUTHOR: "Rizky28eka",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "My thoughts on design, development, and the world.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}
// Education Page
export const EDUCATION: Page = {
  TITLE: "Education",
  DESCRIPTION: "My academic background and qualifications"
}
// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
  { 
    TEXT: "Education", 
    HREF: "/education", 
  },

  {
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "r28eka@gmail.com",
    HREF: "mailto:r28eka@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "rizky28eka",
    HREF: "https://github.com/rizky28eka"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "rizky28eka",
    HREF: "https://www.linkedin.com/in/rizky28eka/",
  },
  { 
    NAME: "Instagram",
    ICON: "instagram",
    TEXT: "rizky28eka", 
    HREF: "https://www.instagram.com/rizky28eka/",
  },
 
]
