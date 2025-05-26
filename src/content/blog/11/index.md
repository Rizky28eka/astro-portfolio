---
title: "Building Modern Web Applications with Next.js"
summary: "Learn how to build scalable and performant web applications using Next.js, including server-side rendering, API routes, and deployment strategies"
date: "2025, 05, 20"
draft: false
tags:
  - JavaScript
---

# Building Modern Web Applications with Next.js

Next.js has revolutionized web development by providing a powerful framework for building React applications with server-side rendering, static site generation, and API routes. This guide explores modern web development practices using Next.js.

## Getting Started

### Project Setup

```bash
# Create new Next.js project
npx create-next-app@latest my-app
cd my-app
npm run dev
```

### Basic Page Structure

```typescript
// pages/index.tsx
import { GetServerSideProps } from 'next'

interface HomeProps {
  data: {
    title: string
    description: string
  }
}

export default function Home({ data }: HomeProps) {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch data from API
  const data = await fetchData()

  return {
    props: {
      data
    }
  }
}
```

## Data Fetching

### Server-Side Rendering (SSR)

```typescript
// pages/posts/[id].tsx
export async function getServerSideProps({ params }) {
  const post = await fetchPost(params.id);

  return {
    props: {
      post,
    },
  };
}
```

### Static Site Generation (SSG)

```typescript
// pages/blog/[slug].tsx
export async function getStaticPaths() {
  const posts = await getAllPosts();

  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);

  return {
    props: {
      post,
    },
  };
}
```

## API Routes

### REST API Implementation

```typescript
// pages/api/posts.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      const posts = await getPosts();
      res.status(200).json(posts);
      break;

    case "POST":
      const newPost = await createPost(req.body);
      res.status(201).json(newPost);
      break;

    default:
      res.status(405).end();
  }
}
```

## State Management

### Using React Context

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (credentials: Credentials) => {
    // Login logic
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Styling

### CSS Modules

```css
/* styles/Button.module.css */
.button {
  padding: 10px 20px;
  border-radius: 5px;
  background-color: #0070f3;
  color: white;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: #0051a2;
}
```

```typescript
// components/Button.tsx
import styles from '../styles/Button.module.css'

export function Button({ children, onClick }) {
  return (
    <button className={styles.button} onClick={onClick}>
      {children}
    </button>
  )
}
```

## Authentication

### NextAuth.js Integration

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add custom session handling
      return session;
    },
  },
});
```

## Deployment

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ]
}
```

## Best Practices

### 1. Performance Optimization

- Use Image component for optimized images
- Implement proper caching strategies
- Optimize bundle size
- Use dynamic imports

### 2. SEO

- Implement proper meta tags
- Use structured data
- Optimize for search engines
- Implement sitemap

### 3. Security

- Implement proper authentication
- Use environment variables
- Implement CORS policies
- Sanitize user input

## Conclusion

Next.js offers:

- Server-side rendering
- Static site generation
- API routes
- Built-in optimizations
- Easy deployment

Remember to:

- Follow best practices
- Optimize performance
- Implement proper security
- Test thoroughly
- Document your code

Happy Next.js development!
