import type { Site, Page, Links, Socials } from "@types"

// ===== Global Site Config =====
export const SITE: Site = {
  TITLE: "R28eka",
  DESCRIPTION: "Personal portfolio and tech blog by Rizky Eka. Sharing knowledge about web development, design, and personal growth.",
  AUTHOR: "Rizky Eka Haryadi",
}

// ===== Pages =====
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Companies and projects I’ve contributed to.",
}

export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Thoughts, tutorials, and insights on tech, design, and development.",
}

export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Selected side projects and freelance work.",
}

export const EDUCATION: Page = {
  TITLE: "Education",
  DESCRIPTION: "Academic background and relevant certifications.",
}

export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Quickly search through posts, projects, and more.",
}

export const ABOUT: Page = {
  TITLE: "About",
  DESCRIPTION: "Get to know me — my journey, skills, and passion in tech.",
}

export const CONTACT: Page = {
  TITLE: "Contact",
  DESCRIPTION: "Let’s connect. Send me a message or collaborate on a project.",
}

// ===== Navigation Links =====
export const LINKS: Links = [
  { TEXT: "Home", HREF: "/" },
  { TEXT: "About", HREF: "/about" },
  { TEXT: "Blog", HREF: "/blog" },
  { TEXT: "Projects", HREF: "/projects" },
  { TEXT: "Education", HREF: "/education" },
  { TEXT: "Work", HREF: "/work" },
  { TEXT: "Contact", HREF: "/contact" },
]

// ===== Social Media =====
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "lucide:mail",
    TEXT: "r28eka@gmail.com",
    HREF: "mailto:r28eka@gmail.com",
  },
  {
    NAME: "GitHub",
    ICON: "lucide:github",
    TEXT: "rizky28eka",
    HREF: "https://github.com/rizky28eka",
  },
  {
    NAME: "LinkedIn",
    ICON: "lucide:linkedin",
    TEXT: "rizky28eka",
    HREF: "https://www.linkedin.com/in/rizky28eka/",
  },
  {
    NAME: "Instagram",
    ICON: "lucide:instagram",
    TEXT: "@rizky28eka",
    HREF: "https://www.instagram.com/rizky28eka/",
  },
  {
    NAME: "Twitter",
    ICON: "lucide:twitter",
    TEXT: "@rizky28eka",
    HREF: "https://twitter.com/duaribuempaat",
  },
  {
    NAME: "YouTube",
    ICON: "lucide:youtube",
    TEXT: "Rizky Eka",
    HREF: "https://www.youtube.com/@rizky28eka",
  },
  {
    NAME: "Dev.to",
    ICON: "simple-icons:devdotto",
    TEXT: "rizky28eka",
    HREF: "https://dev.to/rizky28eka",
  },
]
