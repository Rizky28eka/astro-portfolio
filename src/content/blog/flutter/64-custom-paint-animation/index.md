---
title: "Custom Paint Animation in Flutter"
summary: "Create stunning custom animations with CustomPainter"
date: "2025, 04, 03"
tags: ["flutter", "animation", "custom-paint", "canvas", "graphics"]
difficulty: "advanced"
draft: false
---

## Custom Paint Animation in Flutter

Creating custom animations using Flutter's CustomPainter allows you to build unique and engaging visual experiences. This tutorial will guide you through implementing complex animations using the Canvas API.

## Features

- Custom shape drawing
- Path animations
- Particle systems
- Interactive animations
- Complex transformations
- Performance optimization
- Animation controllers
- Custom effects

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     vector_math: ^2.1.4
     collection: ^1.18.0
   ```

2. **Create Animation Models**

   ```dart
   class Particle {
     Offset position;
     Offset velocity;
     double size;
     Color color;
     double life;
     double maxLife;

     Particle({
       required this.position,
       required this.velocity,
       required this.size,
       required this.color,
       required this.life,
       required this.maxLife,
     });

     void update(double dt) {
       position += velocity * dt;
       life -= dt;
       size *= 0.99;
     }

     bool get isDead => life <= 0;
   }

   class AnimationPath {
     final List<Offset> points;
     final double progress;
     final Paint paint;

     AnimationPath({
       required this.points,
       this.progress = 0.0,
       required this.paint,
     });

     Path getPath() {
       final path = Path();
       if (points.isEmpty) return path;

       path.moveTo(points[0].dx, points[0].dy);
       for (int i = 1; i < points.length; i++) {
         path.lineTo(points[i].dx, points[i].dy);
       }
       return path;
     }
   }
   ```

3. **Create Custom Painters**

   ```dart
   class ParticleSystemPainter extends CustomPainter {
     final List<Particle> particles;
     final double time;

     ParticleSystemPainter({
       required this.particles,
       required this.time,
     });

     @override
     void paint(Canvas canvas, Size size) {
       for (final particle in particles) {
         final paint = Paint()
           ..color = particle.color.withOpacity(particle.life / particle.maxLife)
           ..style = PaintingStyle.fill;

         canvas.drawCircle(
           particle.position,
           particle.size,
           paint,
         );
       }
     }

     @override
     bool shouldRepaint(ParticleSystemPainter oldDelegate) {
       return oldDelegate.particles != particles ||
           oldDelegate.time != time;
     }
   }

   class PathAnimationPainter extends CustomPainter {
     final AnimationPath path;
     final double progress;

     PathAnimationPainter({
       required this.path,
       required this.progress,
     });

     @override
     void paint(Canvas canvas, Size size) {
       final path = this.path.getPath();
       final pathMetrics = path.computeMetrics().first;
       final extractPath = pathMetrics.extractPath(
         0.0,
         pathMetrics.length * progress,
       );

       canvas.drawPath(extractPath, path.paint);
     }

     @override
     bool shouldRepaint(PathAnimationPainter oldDelegate) {
       return oldDelegate.path != path ||
           oldDelegate.progress != progress;
     }
   }
   ```

4. **Create Animation Controllers**

   ```dart
   class ParticleSystemController {
     final List<Particle> particles = [];
     final Random random = Random();
     final Size size;
     double time = 0.0;

     ParticleSystemController({required this.size});

     void emit(Offset position) {
       for (int i = 0; i < 10; i++) {
         final angle = random.nextDouble() * 2 * pi;
         final speed = random.nextDouble() * 200.0;
         final velocity = Offset(
           cos(angle) * speed,
           sin(angle) * speed,
         );

         particles.add(Particle(
           position: position,
           velocity: velocity,
           size: random.nextDouble() * 10.0 + 5.0,
           color: Color.fromRGBO(
             random.nextInt(255),
             random.nextInt(255),
             random.nextInt(255),
             1.0,
           ),
           life: random.nextDouble() * 2.0 + 1.0,
           maxLife: 3.0,
         ));
       }
     }

     void update(double dt) {
       time += dt;
       particles.removeWhere((particle) {
         particle.update(dt);
         return particle.isDead;
       });
     }
   }

   class PathAnimationController {
     final List<AnimationPath> paths = [];
     final AnimationController controller;
     final Tween<double> progressTween;

     PathAnimationController({
       required this.controller,
       required this.progressTween,
     });

     void addPath(List<Offset> points, Paint paint) {
       paths.add(AnimationPath(
         points: points,
         paint: paint,
       ));
     }

     void update() {
       final progress = progressTween.evaluate(controller);
       for (final path in paths) {
         path.progress = progress;
       }
     }
   }
   ```

5. **Create Animation Widgets**

   ```dart
   class ParticleSystem extends StatefulWidget {
     final Size size;
     final Function(Offset) onTap;

     const ParticleSystem({
       required this.size,
       required this.onTap,
     });

     @override
     State<ParticleSystem> createState() => _ParticleSystemState();
   }

   class _ParticleSystemState extends State<ParticleSystem>
       with SingleTickerProviderStateMixin {
     late ParticleSystemController _controller;
     late Ticker _ticker;

     @override
     void initState() {
       super.initState();
       _controller = ParticleSystemController(size: widget.size);
       _ticker = createTicker((elapsed) {
         _controller.update(elapsed.inMilliseconds / 1000.0);
         setState(() {});
       })..start();
     }

     @override
     void dispose() {
       _ticker.dispose();
       super.dispose();
     }

     @override
     Widget build(BuildContext context) {
       return GestureDetector(
         onTapDown: (details) {
           _controller.emit(details.localPosition);
           widget.onTap(details.localPosition);
         },
         child: CustomPaint(
           size: widget.size,
           painter: ParticleSystemPainter(
             particles: _controller.particles,
             time: _controller.time,
           ),
         ),
       );
     }
   }

   class PathAnimation extends StatefulWidget {
     final List<Offset> points;
     final Paint paint;
     final Duration duration;

     const PathAnimation({
       required this.points,
       required this.paint,
       required this.duration,
     });

     @override
     State<PathAnimation> createState() => _PathAnimationState();
   }

   class _PathAnimationState extends State<PathAnimation>
       with SingleTickerProviderStateMixin {
     late PathAnimationController _controller;
     late AnimationController _animationController;

     @override
     void initState() {
       super.initState();
       _animationController = AnimationController(
         vsync: this,
         duration: widget.duration,
       );

       _controller = PathAnimationController(
         controller: _animationController,
         progressTween: Tween<double>(begin: 0.0, end: 1.0),
       );

       _controller.addPath(widget.points, widget.paint);
       _animationController.forward();
     }

     @override
     void dispose() {
       _animationController.dispose();
       super.dispose();
     }

     @override
     Widget build(BuildContext context) {
       return AnimatedBuilder(
         animation: _animationController,
         builder: (context, child) {
           _controller.update();
           return CustomPaint(
             size: Size.infinite,
             painter: PathAnimationPainter(
               path: _controller.paths.first,
               progress: _controller.paths.first.progress,
             ),
           );
         },
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class CustomAnimationScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Custom Animations'),
         ),
         body: Column(
           children: [
             Expanded(
               child: ParticleSystem(
                 size: Size(MediaQuery.of(context).size.width,
                     MediaQuery.of(context).size.height * 0.5),
                 onTap: (position) {
                   // Handle particle emission
                 },
               ),
             ),
             Expanded(
               child: PathAnimation(
                 points: [
                   Offset(0, 0),
                   Offset(100, 100),
                   Offset(200, 0),
                   Offset(300, 100),
                 ],
                 paint: Paint()
                   ..color = Colors.blue
                   ..strokeWidth = 2.0
                   ..style = PaintingStyle.stroke,
                 duration: Duration(seconds: 2),
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance**

   - Use const constructors
   - Optimize repaints
   - Handle large particle systems
   - Manage memory

2. **Animation Quality**

   - Smooth transitions
   - Proper timing
   - Physics-based animations
   - Frame rate control

3. **Code Organization**

   - Separate concerns
   - Reusable components
   - Clean architecture
   - Documentation

4. **Testing**
   - Test animations
   - Verify performance
   - Check edge cases
   - Monitor memory

## Conclusion

This tutorial has shown you how to implement custom animations in Flutter with features like:

- Particle systems
- Path animations
- Interactive effects
- Complex transformations

You can extend this implementation by adding:

- More particle effects
- Complex path generation
- Physics simulations
- Custom shaders
- 3D transformations

Remember to:

- Optimize performance
- Handle memory
- Test thoroughly
- Consider device capabilities
- Keep animations smooth

This implementation provides a solid foundation for creating custom animations in Flutter.
