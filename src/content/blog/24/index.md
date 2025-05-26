---
title: "Mastering React.js Development"
summary: "Learn advanced React.js concepts, patterns, and best practices for building scalable and maintainable applications"
date: "2025, 05, 20"
draft: false
tags:
  - JavaScript
---

# Mastering React.js Development

React.js is a powerful JavaScript library for building user interfaces. This guide covers advanced concepts, patterns, and best practices for building scalable and maintainable React applications.

## Project Setup

### 1. Creating a New Project

```bash
# Create new React project
npx create-react-app my-app --template typescript

# Navigate to project directory
cd my-app

# Install additional dependencies
npm install @reduxjs/toolkit react-redux react-router-dom @tanstack/react-query
npm install -D @types/react @types/react-dom @types/node
```

### 2. Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── features/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   ├── utils/
│   └── types/
├── public/
└── package.json
```

## Core Concepts

### 1. Custom Hooks

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 2. Context API

```typescript
// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

## State Management

### 1. Redux Toolkit

```typescript
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;

// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. React Query

```typescript
// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// src/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
}

export function usePosts() {
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await api.get("/posts");
      return response.data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (newPost: Omit<Post, "id">) => {
      const response = await api.post("/posts", newPost);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost,
  };
}
```

## Component Patterns

### 1. Compound Components

```typescript
// src/components/common/Accordion.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface AccordionContextType {
  activeItem: string | null;
  setActiveItem: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: ReactNode;
  defaultActive?: string;
}

export function Accordion({ children, defaultActive = null }: AccordionProps) {
  const [activeItem, setActiveItem] = useState<string | null>(defaultActive);

  return (
    <AccordionContext.Provider value={{ activeItem, setActiveItem }}>
      <div className="divide-y divide-gray-200">{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  id: string;
  children: ReactNode;
}

export function AccordionItem({ id, children }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within Accordion');
  }

  const { activeItem, setActiveItem } = context;
  const isActive = activeItem === id;

  return (
    <div className="py-4">
      <button
        className="flex justify-between w-full text-left"
        onClick={() => setActiveItem(isActive ? null : id)}
      >
        {children}
      </button>
    </div>
  );
}

interface AccordionContentProps {
  children: ReactNode;
}

export function AccordionContent({ children }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionContent must be used within Accordion');
  }

  const { activeItem } = context;

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        activeItem ? 'max-h-96' : 'max-h-0'
      }`}
    >
      {children}
    </div>
  );
}
```

### 2. Render Props

```typescript
// src/components/common/DataFetcher.tsx
import { useState, useEffect } from 'react';

interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return <>{children(data, loading, error)}</>;
}
```

## Performance Optimization

### 1. Memoization

```typescript
// src/components/features/ExpensiveComponent.tsx
import { memo, useMemo, useCallback } from 'react';

interface ExpensiveComponentProps {
  data: number[];
  onItemClick: (item: number) => void;
}

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onItemClick,
}: ExpensiveComponentProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a - b);
  }, [data]);

  const handleClick = useCallback(
    (item: number) => {
      onItemClick(item);
    },
    [onItemClick]
  );

  return (
    <div>
      {sortedData.map((item) => (
        <button
          key={item}
          onClick={() => handleClick(item)}
          className="p-2 m-1 bg-blue-500 text-white rounded"
        >
          {item}
        </button>
      ))}
    </div>
  );
});
```

### 2. Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}

export default App;
```

## Testing

### 1. Component Testing

```typescript
// src/components/common/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button).toHaveClass('bg-gray-600');
  });
});
```

### 2. Integration Testing

```typescript
// src/App.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';

describe('App', () => {
  it('renders home page', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Welcome to our app')).toBeInTheDocument();
  });

  it('navigates to about page', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText('About'));

    await waitFor(() => {
      expect(screen.getByText('About Us')).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### 1. Code Organization

- Use feature-based folder structure
- Keep components small and focused
- Implement proper error boundaries
- Use TypeScript for type safety
- Follow consistent naming conventions

### 2. Performance

- Implement proper memoization
- Use code splitting
- Optimize re-renders
- Monitor bundle size
- Use performance monitoring tools

## Conclusion

React.js offers:

- Component-based architecture
- Rich ecosystem
- Great developer experience
- Strong community support
- Excellent documentation

Remember to:

- Follow best practices
- Write clean and maintainable code
- Implement proper testing
- Optimize performance
- Keep learning and improving

Happy React.js development!
