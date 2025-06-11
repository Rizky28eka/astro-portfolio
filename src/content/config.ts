import { defineCollection, z } from "astro:content";

// Reusable schema elements
const dateUnion = z.union([z.string(), z.date()]);
const optionalString = z.string().optional();
const optionalStringArray = z.array(z.string()).optional();

// Work collection schema
const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: optionalString,
    dateStart: dateUnion.optional(),
    dateEnd: dateUnion.optional(),
    summary: optionalString,
    technologies: optionalStringArray,
    draft: z.boolean().optional(),
  }),
});

// Blog collection schema
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: optionalString,
    date: dateUnion.optional(),
    tags: optionalStringArray,
    draft: z.boolean().optional(),
    difficulty: z.enum(['beginner', 'medium', 'advanced']).optional(),
    views: z.number().optional(),
  }),
});

// Projects collection schema
const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: optionalString,
    date: dateUnion.optional(),
    tags: optionalStringArray,
    demoUrl: optionalString,
    repoUrl: optionalString,
    draft: z.boolean().optional(),
  }),
});

// Legal collection schema
const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: optionalString,
    date: optionalString,
  }),
});

// Education collection schema
const education = defineCollection({
  type: "content",
  schema: z.object({
    school: optionalString,
    degree: optionalString,
    field: optionalString,
    location: optionalString,
    dateStart: dateUnion.optional(),
    dateEnd: dateUnion.optional(),
    description: optionalString,
    achievements: optionalStringArray,
    draft: z.boolean().optional(),
  }),
});

// Export all collections
export const collections = {
  work,
  blog,
  projects,
  legal,
  education,
};
