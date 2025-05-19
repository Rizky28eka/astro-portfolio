// types.ts

// Basic page metadata
export type Page = {
  TITLE: string
  DESCRIPTION: string
}

// Extended site metadata
export interface Site extends Page {
  AUTHOR: string
}

// Navigation link type
export type Links = {
  TEXT: string
  HREF: string
}[]

// Social media link type
export type Socials = {
  NAME: string
  ICON: string
  TEXT: string
  HREF: string
}[]
