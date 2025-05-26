---
title: "Building Cross-Platform Mobile Apps with React Native"
summary: "Learn how to build high-performance mobile applications using React Native, including best practices, performance optimization, and native module integration"
date: "2025, 05, 20"
draft: false
tags:
  - JavaScript
---

# Building Cross-Platform Mobile Apps with React Native

React Native enables developers to build native mobile applications using JavaScript and React. This guide covers essential concepts, best practices, and advanced techniques for building high-performance cross-platform mobile apps.

## Getting Started

### 1. Project Setup

```bash
# Create new project
npx react-native init MyApp

# Install dependencies
cd MyApp
npm install @react-navigation/native @react-navigation/stack
npm install react-native-reanimated react-native-gesture-handler
```

### 2. Basic App Structure

```javascript
// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
```

## Core Components

### 1. Custom Components

```javascript
// components/CustomButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({ onPress, title, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
```

### 2. Screen Components

```javascript
// screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import CustomButton from "../components/CustomButton";

const HomeScreen = ({ navigation }) => {
  const [items, setItems] = React.useState([]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <CustomButton
        title="View Details"
        onPress={() => navigation.navigate("Details", { item })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});

export default HomeScreen;
```

## State Management

### 1. Context API

```javascript
// context/AppContext.js
import React, { createContext, useContext, useReducer } from "react";

const AppContext = createContext();

const initialState = {
  user: null,
  theme: "light",
  notifications: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
```

### 2. Redux Integration

```javascript
// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
  },
});

// slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
```

## Performance Optimization

### 1. List Optimization

```javascript
// components/OptimizedList.js
import React, { useCallback } from "react";
import { FlatList, View, Text } from "react-native";

const OptimizedList = ({ data }) => {
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.item}>
        <Text>{item.title}</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 50,
      offset: 50 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};
```

### 2. Image Optimization

```javascript
// components/OptimizedImage.js
import React from "react";
import { Image, StyleSheet } from "react-native";

const OptimizedImage = ({ source, style }) => {
  return (
    <Image
      source={source}
      style={[styles.image, style]}
      resizeMode="cover"
      fadeDuration={0}
      onLoadStart={() => {
        // Show loading indicator
      }}
      onLoadEnd={() => {
        // Hide loading indicator
      }}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 200,
  },
});

export default OptimizedImage;
```

## Native Module Integration

### 1. Custom Native Module

```java
// android/app/src/main/java/com/myapp/CustomModule.java
package com.myapp;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class CustomModule extends ReactContextBaseJavaModule {
    public CustomModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "CustomModule";
    }

    @ReactMethod
    public void performAction(String param, Promise promise) {
        try {
            // Native implementation
            promise.resolve("Success");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
```

### 2. JavaScript Interface

```javascript
// modules/CustomModule.js
import { NativeModules } from "react-native";

const { CustomModule } = NativeModules;

export const performAction = async (param) => {
  try {
    const result = await CustomModule.performAction(param);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

## Testing

### 1. Unit Testing

```javascript
// __tests__/CustomButton.test.js
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomButton from "../components/CustomButton";

describe("CustomButton", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={() => {}} />
    );
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test Button" onPress={onPress} />
    );
    fireEvent.press(getByText("Test Button"));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 2. E2E Testing

```javascript
// e2e/App.test.js
import { device, element, by } from "detox";

describe("App", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should show home screen", async () => {
    await expect(element(by.id("home-screen"))).toBeVisible();
  });

  it("should navigate to details screen", async () => {
    await element(by.id("item-1")).tap();
    await expect(element(by.id("details-screen"))).toBeVisible();
  });
});
```

## Best Practices

### 1. Code Organization

- Use feature-based structure
- Implement proper error handling
- Follow consistent naming
- Document your code
- Use TypeScript

### 2. Performance

- Optimize images
- Use proper list components
- Implement lazy loading
- Monitor performance
- Handle memory leaks

## Conclusion

React Native offers:

- Cross-platform development
- Native performance
- Rich ecosystem
- Active community
- Rapid development

Remember to:

- Follow best practices
- Optimize performance
- Test thoroughly
- Handle errors
- Keep it simple

Happy React Native development!
