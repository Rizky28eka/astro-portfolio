---
title: "Flutter Animations Made Simple: From Basic to Advanced"
summary: "Step-by-step guide to implementing animations in Flutter, from simple implicit animations to complex custom animation controllers."
date: "2025, 02, 20"
draft: false
tags:
  - flutter
  - animations
---

## Flutter Animations Made Simple: From Basic to Advanced

Flutter provides a powerful animation system that allows you to create beautiful and engaging user interfaces. This guide will take you from basic implicit animations to complex custom animations.

## Implicit Animations

### AnimatedContainer

```dart
class AnimatedContainerExample extends StatefulWidget {
  @override
  _AnimatedContainerExampleState createState() => _AnimatedContainerExampleState();
}

class _AnimatedContainerExampleState extends State<AnimatedContainerExample> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(seconds: 1),
      curve: Curves.easeInOut,
      width: _isExpanded ? 300 : 100,
      height: _isExpanded ? 300 : 100,
      color: _isExpanded ? Colors.blue : Colors.red,
      child: Center(
        child: Text(
          _isExpanded ? 'Expanded' : 'Collapsed',
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}
```

### AnimatedOpacity

```dart
class AnimatedOpacityExample extends StatefulWidget {
  @override
  _AnimatedOpacityExampleState createState() => _AnimatedOpacityExampleState();
}

class _AnimatedOpacityExampleState extends State<AnimatedOpacityExample> {
  bool _isVisible = true;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      duration: const Duration(seconds: 1),
      opacity: _isVisible ? 1.0 : 0.0,
      child: Container(
        width: 200,
        height: 200,
        color: Colors.blue,
      ),
    );
  }
}
```

## Explicit Animations

### AnimationController

```dart
class AnimationControllerExample extends StatefulWidget {
  @override
  _AnimationControllerExampleState createState() => _AnimationControllerExampleState();
}

class _AnimationControllerExampleState extends State<AnimationControllerExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _animation.addListener(() {
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: _animation.value * 2 * pi,
      child: Container(
        width: 100,
        height: 100,
        color: Colors.blue,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

### Tween Animation

```dart
class TweenAnimationExample extends StatefulWidget {
  @override
  _TweenAnimationExampleState createState() => _TweenAnimationExampleState();
}

class _TweenAnimationExampleState extends State<TweenAnimationExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Color?> _colorAnimation;
  late Animation<double> _sizeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _colorAnimation = ColorTween(
      begin: Colors.blue,
      end: Colors.red,
    ).animate(_controller);

    _sizeAnimation = Tween<double>(
      begin: 100,
      end: 200,
    ).animate(_controller);

    _controller.repeat(reverse: true);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: _sizeAnimation.value,
          height: _sizeAnimation.value,
          color: _colorAnimation.value,
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

## Staggered Animations

### Staggered Animation Example

```dart
class StaggeredAnimationExample extends StatefulWidget {
  @override
  _StaggeredAnimationExampleState createState() => _StaggeredAnimationExampleState();
}

class _StaggeredAnimationExampleState extends State<StaggeredAnimationExample>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      3,
      (index) => AnimationController(
        duration: Duration(milliseconds: 500 + (index * 200)),
        vsync: this,
      ),
    );

    _animations = _controllers.map((controller) {
      return Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: controller,
        curve: Curves.easeInOut,
      ));
    }).toList();

    for (var controller in _controllers) {
      controller.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _animations[index],
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, 50 * (1 - _animations[index].value)),
              child: Opacity(
                opacity: _animations[index].value,
                child: Container(
                  width: 200,
                  height: 50,
                  margin: const EdgeInsets.all(8),
                  color: Colors.blue,
                ),
              ),
            );
          },
        );
      }),
    );
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }
}
```

## Hero Animations

### Hero Animation Example

```dart
class HeroAnimationExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailScreen(),
          ),
        );
      },
      child: Hero(
        tag: 'hero-tag',
        child: Container(
          width: 100,
          height: 100,
          color: Colors.blue,
        ),
      ),
    );
  }
}

class DetailScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Hero(
        tag: 'hero-tag',
        child: Container(
          width: 300,
          height: 300,
          color: Colors.blue,
        ),
      ),
    );
  }
}
```

## Custom Animations

### Custom Animation Example

```dart
class CustomAnimationExample extends StatefulWidget {
  @override
  _CustomAnimationExampleState createState() => _CustomAnimationExampleState();
}

class _CustomAnimationExampleState extends State<CustomAnimationExample>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));

    _controller.repeat(reverse: true);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return CustomPaint(
          painter: CustomAnimationPainter(_animation.value),
          child: Container(),
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class CustomAnimationPainter extends CustomPainter {
  final double progress;

  CustomAnimationPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 4;

    canvas.drawCircle(
      center,
      radius * (1 + progress * 0.5),
      paint,
    );
  }

  @override
  bool shouldRepaint(CustomAnimationPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
```

## Best Practices

1. Use implicit animations for simple cases
2. Use explicit animations for complex cases
3. Properly dispose of animation controllers
4. Use appropriate curves for smooth animations
5. Consider performance implications
6. Test animations on different devices
7. Handle animation interruptions

## Common Pitfalls

1. Memory leaks from undisposed controllers
2. Poor performance from too many animations
3. Janky animations from heavy computations
4. Missing error handling
5. Inappropriate animation durations

## Conclusion

Mastering Flutter animations requires:

- Understanding animation types
- Knowing when to use each type
- Following best practices
- Testing thoroughly
- Optimizing performance

Remember:

- Keep animations simple
- Use appropriate animations
- Consider performance
- Test on different devices
- Follow guidelines

Happy Fluttering!
