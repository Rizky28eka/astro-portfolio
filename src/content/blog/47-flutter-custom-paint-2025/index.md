---
title: "Custom Paint and Canvas in Flutter: Creating Custom Graphics"
summary: "Advanced tutorial on using Flutter's CustomPaint widget and Canvas API to create custom graphics and complex visual elements."
date: "2025, 09, 01"
draft: false
tags:
  - flutter
  - custom-paint
  - canvas
  - graphics
  - custom-drawing
---

## Custom Paint and Canvas in Flutter: Creating Custom Graphics

This guide covers how to use Flutter's CustomPaint widget and Canvas API to create custom graphics.

## Basic Custom Paint

### Simple Shapes

```dart
class SimpleShapes extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.fill;

    // Draw rectangle
    canvas.drawRect(
      Rect.fromLTWH(50, 50, 100, 100),
      paint,
    );

    // Draw circle
    canvas.drawCircle(
      Offset(200, 100),
      50,
      paint,
    );

    // Draw line
    final linePaint = Paint()
      ..color = Colors.red
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    canvas.drawLine(
      Offset(50, 200),
      Offset(250, 200),
      linePaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

### Custom Paths

```dart
class CustomPathPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.green
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = Path()
      ..moveTo(50, 50)
      ..lineTo(100, 100)
      ..quadraticBezierTo(150, 50, 200, 100)
      ..cubicTo(250, 150, 300, 50, 350, 100)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

## Advanced Graphics

### Gradient and Patterns

```dart
class GradientPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Linear gradient
    final linearGradient = LinearGradient(
      colors: [Colors.blue, Colors.purple],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );

    final linearPaint = Paint()
      ..shader = linearGradient.createShader(
        Rect.fromLTWH(0, 0, size.width, size.height),
      );

    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      linearPaint,
    );

    // Radial gradient
    final radialGradient = RadialGradient(
      colors: [Colors.yellow, Colors.orange],
      center: Alignment.center,
      radius: 0.5,
    );

    final radialPaint = Paint()
      ..shader = radialGradient.createShader(
        Rect.fromCircle(
          center: Offset(size.width / 2, size.height / 2),
          radius: 100,
        ),
      );

    canvas.drawCircle(
      Offset(size.width / 2, size.height / 2),
      100,
      radialPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

### Complex Animations

```dart
class AnimatedCustomPainter extends CustomPainter {
  final double progress;

  AnimatedCustomPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = Path();
    final center = Offset(size.width / 2, size.height / 2);
    final radius = 50.0;

    for (var i = 0; i < 360; i += 5) {
      final angle = i * pi / 180;
      final x = center.dx + radius * cos(angle);
      final y = center.dy + radius * sin(angle);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    path.close();

    // Animate the path
    final animatedPath = Path();
    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      final extractPath = metric.extractPath(
        0,
        metric.length * progress,
      );
      animatedPath.addPath(extractPath, Offset.zero);
    }

    canvas.drawPath(animatedPath, paint);
  }

  @override
  bool shouldRepaint(covariant AnimatedCustomPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
```

## Interactive Graphics

### Touch Interaction

```dart
class InteractivePainter extends CustomPainter {
  final List<Offset> points;
  final Paint paint;

  InteractivePainter({
    required this.points,
    required this.paint,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    final path = Path();
    path.moveTo(points.first.dx, points.first.dy);

    for (var i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant InteractivePainter oldDelegate) {
    return oldDelegate.points != points;
  }
}

class DrawingCanvas extends StatefulWidget {
  @override
  _DrawingCanvasState createState() => _DrawingCanvasState();
}

class _DrawingCanvasState extends State<DrawingCanvas> {
  final List<Offset> points = [];
  final paint = Paint()
    ..color = Colors.black
    ..strokeWidth = 2
    ..strokeCap = StrokeCap.round;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        setState(() {
          points.add(details.localPosition);
        });
      },
      onPanUpdate: (details) {
        setState(() {
          points.add(details.localPosition);
        });
      },
      child: CustomPaint(
        painter: InteractivePainter(
          points: points,
          paint: paint,
        ),
        size: Size.infinite,
      ),
    );
  }
}
```

## Best Practices

1. Use appropriate paint styles
2. Optimize path operations
3. Handle repainting efficiently
4. Implement proper animations
5. Manage touch interactions
6. Consider performance
7. Document custom painters

## Common Pitfalls

1. Inefficient painting
2. Memory leaks
3. Poor performance
4. Complex paths
5. No error handling

## Conclusion

Using CustomPaint requires:

- Understanding Canvas API
- Following best practices
- Proper performance optimization
- Efficient animations
- Touch handling

Remember:

- Paint efficiently
- Optimize paths
- Handle interactions
- Manage memory
- Test thoroughly

Happy Painting!
