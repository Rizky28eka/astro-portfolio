---
title: "Mastering Animations in SwiftUI: A Comprehensive Guide"
summary: "Learn how to create beautiful and performant animations in SwiftUI, including custom transitions, gesture-based animations, and advanced animation techniques"
date: "2025, 05, 20"
draft: false
tags:
  - Swift
---

# Mastering Animations in SwiftUI: A Comprehensive Guide

SwiftUI provides a powerful and declarative way to create beautiful animations. This guide explores various animation techniques and best practices for creating engaging user experiences in SwiftUI.

## Basic Animations

### 1. Implicit Animations

```swift
struct ContentView: View {
    @State private var isExpanded = false

    var body: some View {
        VStack {
            Text("Hello, SwiftUI!")
                .font(.title)
                .padding()
                .background(isExpanded ? Color.blue : Color.green)
                .foregroundColor(.white)
                .cornerRadius(10)
                .scaleEffect(isExpanded ? 1.2 : 1.0)
                .animation(.spring(), value: isExpanded)

            Button("Toggle") {
                isExpanded.toggle()
            }
        }
    }
}
```

### 2. Explicit Animations

```swift
struct ContentView: View {
    @State private var offset: CGFloat = 0

    var body: some View {
        VStack {
            Text("Animated Text")
                .offset(x: offset)

            Button("Animate") {
                withAnimation(.spring()) {
                    offset = 100
                }
            }
        }
    }
}
```

## Custom Animations

### 1. Custom Timing Curve

```swift
struct ContentView: View {
    @State private var isAnimating = false

    var body: some View {
        VStack {
            Circle()
                .fill(Color.blue)
                .frame(width: 50, height: 50)
                .scaleEffect(isAnimating ? 2.0 : 1.0)
                .animation(
                    Animation.timingCurve(0.2, 0.8, 0.2, 1.0, duration: 1.0),
                    value: isAnimating
                )

            Button("Animate") {
                isAnimating.toggle()
            }
        }
    }
}
```

### 2. Custom Transition

```swift
struct SlideTransition: ViewModifier {
    let isPresented: Bool

    func body(content: Content) -> some View {
        content
            .offset(x: isPresented ? 0 : -UIScreen.main.bounds.width)
            .animation(.spring(), value: isPresented)
    }
}

extension View {
    func slideTransition(isPresented: Bool) -> some View {
        modifier(SlideTransition(isPresented: isPresented))
    }
}

struct ContentView: View {
    @State private var isPresented = false

    var body: some View {
        VStack {
            if isPresented {
                Text("Sliding View")
                    .slideTransition(isPresented: isPresented)
            }

            Button("Toggle") {
                isPresented.toggle()
            }
        }
    }
}
```

## Gesture-Based Animations

### 1. Drag Gesture

```swift
struct DraggableCard: View {
    @State private var offset = CGSize.zero
    @State private var isDragging = false

    var body: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(Color.blue)
            .frame(width: 200, height: 300)
            .offset(offset)
            .scaleEffect(isDragging ? 1.1 : 1.0)
            .rotationEffect(.degrees(Double(offset.width / 20)))
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        offset = gesture.translation
                        isDragging = true
                    }
                    .onEnded { _ in
                        withAnimation(.spring()) {
                            offset = .zero
                            isDragging = false
                        }
                    }
            )
    }
}
```

### 2. Magnification Gesture

```swift
struct MagnifiableImage: View {
    @State private var scale: CGFloat = 1.0
    @State private var lastScale: CGFloat = 1.0

    var body: some View {
        Image("example")
            .resizable()
            .scaledToFit()
            .scaleEffect(scale)
            .gesture(
                MagnificationGesture()
                    .onChanged { value in
                        let delta = value / lastScale
                        lastScale = value
                        scale = min(max(scale * delta, 1), 4)
                    }
                    .onEnded { _ in
                        lastScale = 1.0
                        withAnimation(.spring()) {
                            scale = 1.0
                        }
                    }
            )
    }
}
```

## Advanced Animations

### 1. Keyframe Animations

```swift
struct KeyframeAnimation: View {
    @State private var isAnimating = false

    var body: some View {
        Circle()
            .fill(Color.blue)
            .frame(width: 50, height: 50)
            .modifier(KeyframeModifier(isAnimating: isAnimating))
            .onAppear {
                isAnimating = true
            }
    }
}

struct KeyframeModifier: ViewModifier {
    let isAnimating: Bool
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .offset(x: sin(phase * .pi * 2) * 100)
            .rotationEffect(.degrees(phase * 360))
            .scaleEffect(1 + sin(phase * .pi * 2) * 0.2)
            .onChange(of: isAnimating) { newValue in
                if newValue {
                    withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                        phase = 1
                    }
                }
            }
    }
}
```

### 2. Morphing Shapes

```swift
struct MorphingShape: View {
    @State private var isMorphed = false

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.blue)
                .frame(width: 100, height: 100)
                .opacity(isMorphed ? 0 : 1)

            Rectangle()
                .fill(Color.blue)
                .frame(width: 100, height: 100)
                .opacity(isMorphed ? 1 : 0)
        }
        .animation(.spring(), value: isMorphed)
        .onTapGesture {
            isMorphed.toggle()
        }
    }
}
```

## Best Practices

### 1. Performance

- Use appropriate animation curves
- Avoid animating too many properties
- Use hardware-accelerated properties
- Consider using `withAnimation` for complex animations

### 2. User Experience

- Keep animations subtle and purposeful
- Provide visual feedback
- Consider accessibility
- Test on different devices

### 3. Code Organization

- Create reusable animation modifiers
- Separate animation logic
- Use proper naming conventions
- Document complex animations

## Conclusion

SwiftUI animations offer:

- Declarative syntax
- Smooth performance
- Rich animation capabilities
- Easy integration
- Great developer experience

Remember to:

- Keep animations purposeful
- Consider performance
- Test thoroughly
- Follow best practices
- Document your code

Happy animating!
