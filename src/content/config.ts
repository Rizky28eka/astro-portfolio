import { defineCollection, z } from "astro:content";

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: z.string().optional(), // ✅ Added location
    dateStart: z.union([z.string(), z.date()]).optional(),
    dateEnd: z.union([z.string(), z.date()]).optional(),
    summary: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional(), // Support both string and Date objects
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional(), // Support both string and Date objects
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
  }),
});

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    date: z.string().optional(),
  }),
});

const education = defineCollection({
  type: "content",
  schema: z.object({
    school: z.string().optional(),
    degree: z.string().optional(),
    field: z.string().optional(),
    location: z.string().optional(), // ✅ Added location
    dateStart: z.union([z.string(), z.date()]).optional(),
    dateEnd: z.union([z.string(), z.date()]).optional(),
    description: z.string().optional(),
    achievements: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { work, blog, projects, legal, education };
