---
title: "Custom Animation System"
summary: "Create complex animations with custom controllers"
date: "2025, 04, 05"
tags: ["flutter", "animation", "custom-controller", "physics", "interactive"]
difficulty: "advanced"
draft: false
---

## Custom Animation System

Creating a custom animation system in Flutter allows for complex, physics-based animations and interactive experiences. This tutorial will guide you through implementing a custom animation system with features like spring animations, custom curves, and interactive gestures.

## Features

- Custom animation controllers
- Physics-based animations
- Interactive gestures
- Animation curves
- Animation sequences
- Animation builders
- Animation transitions
- Animation states
- Animation debugging
- Performance optimization

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     vector_math: ^2.1.4
     collection: ^1.17.2
   ```

2. **Create Animation Models**

   ```dart
   class AnimationState {
     final double value;
     final double velocity;
     final double acceleration;
     final DateTime timestamp;

     AnimationState({
       required this.value,
       required this.velocity,
       required this.acceleration,
       required this.timestamp,
     });

     AnimationState copyWith({
       double? value,
       double? velocity,
       double? acceleration,
       DateTime? timestamp,
     }) {
       return AnimationState(
         value: value ?? this.value,
         velocity: velocity ?? this.velocity,
         acceleration: acceleration ?? this.acceleration,
         timestamp: timestamp ?? this.timestamp,
       );
     }
   }

   class SpringConfig {
     final double mass;
     final double stiffness;
     final double damping;
     final double initialVelocity;

     SpringConfig({
       required this.mass,
       required this.stiffness,
       required this.damping,
       this.initialVelocity = 0.0,
     });

     static SpringConfig get defaultConfig => SpringConfig(
           mass: 1.0,
           stiffness: 100.0,
           damping: 10.0,
         );

     static SpringConfig get bouncy => SpringConfig(
           mass: 1.0,
           stiffness: 200.0,
           damping: 5.0,
         );

     static SpringConfig get stiff => SpringConfig(
           mass: 1.0,
           stiffness: 300.0,
           damping: 20.0,
         );
   }
   ```

3. **Create Custom Animation Controller**

   ```dart
   class CustomAnimationController extends ChangeNotifier {
     final SpringConfig springConfig;
     final double targetValue;
     final double minValue;
     final double maxValue;
     final Duration duration;
     final Curve curve;

     AnimationState _state;
     Timer? _timer;
     bool _isAnimating = false;

     CustomAnimationController({
       required this.springConfig,
       required this.targetValue,
       this.minValue = double.negativeInfinity,
       this.maxValue = double.infinity,
       this.duration = const Duration(milliseconds: 300),
       this.curve = Curves.easeInOut,
     }) : _state = AnimationState(
            value: targetValue,
            velocity: springConfig.initialVelocity,
            acceleration: 0.0,
            timestamp: DateTime.now(),
          );

     double get value => _state.value;
     double get velocity => _state.velocity;
     bool get isAnimating => _isAnimating;

     void start() {
       if (_isAnimating) return;
       _isAnimating = true;
       _timer?.cancel();
       _timer = Timer.periodic(Duration(milliseconds: 16), _update);
     }

     void stop() {
       _isAnimating = false;
       _timer?.cancel();
       _timer = null;
     }

     void reset() {
       stop();
       _state = AnimationState(
         value: targetValue,
         velocity: 0.0,
         acceleration: 0.0,
         timestamp: DateTime.now(),
       );
       notifyListeners();
     }

     void _update(Timer timer) {
       final now = DateTime.now();
       final dt = now.difference(_state.timestamp).inMilliseconds / 1000.0;

       if (dt <= 0) return;

       final springForce = -springConfig.stiffness * (_state.value - targetValue);
       final dampingForce = -springConfig.damping * _state.velocity;
       final force = springForce + dampingForce;
       final acceleration = force / springConfig.mass;

       final newVelocity = _state.velocity + acceleration * dt;
       final newValue = _state.value + newVelocity * dt;

       _state = _state.copyWith(
         value: newValue.clamp(minValue, maxValue),
         velocity: newVelocity,
         acceleration: acceleration,
         timestamp: now,
       );

       if (_isAnimationComplete()) {
         stop();
         _state = _state.copyWith(
           value: targetValue,
           velocity: 0.0,
           acceleration: 0.0,
         );
       }

       notifyListeners();
     }

     bool _isAnimationComplete() {
       final valueDiff = (_state.value - targetValue).abs();
       final velocityDiff = _state.velocity.abs();
       return valueDiff < 0.001 && velocityDiff < 0.001;
     }

     @override
     void dispose() {
       stop();
       super.dispose();
     }
   }
   ```

4. **Create Animation Widgets**

   ```dart
   class AnimatedSpring extends StatefulWidget {
     final Widget child;
     final double targetValue;
     final SpringConfig springConfig;
     final Duration duration;
     final Curve curve;
     final bool autoStart;

     const AnimatedSpring({
       required this.child,
       required this.targetValue,
       this.springConfig = const SpringConfig.defaultConfig(),
       this.duration = const Duration(milliseconds: 300),
       this.curve = Curves.easeInOut,
       this.autoStart = true,
     });

     @override
     State<AnimatedSpring> createState() => _AnimatedSpringState();
   }

   class _AnimatedSpringState extends State<AnimatedSpring> {
     late CustomAnimationController _controller;

     @override
     void initState() {
       super.initState();
       _controller = CustomAnimationController(
         springConfig: widget.springConfig,
         targetValue: widget.targetValue,
         duration: widget.duration,
         curve: widget.curve,
       );

       if (widget.autoStart) {
         _controller.start();
       }
     }

     @override
     void didUpdateWidget(AnimatedSpring oldWidget) {
       super.didUpdateWidget(oldWidget);
       if (widget.targetValue != oldWidget.targetValue) {
         _controller.targetValue = widget.targetValue;
         _controller.start();
       }
     }

     @override
     Widget build(BuildContext context) {
       return AnimatedBuilder(
         animation: _controller,
         builder: (context, child) {
           return Transform.scale(
             scale: _controller.value,
             child: child,
           );
         },
         child: widget.child,
       );
     }

     @override
     void dispose() {
       _controller.dispose();
       super.dispose();
     }
   }

   class InteractiveSpring extends StatefulWidget {
     final Widget child;
     final SpringConfig springConfig;
     final double minScale;
     final double maxScale;
     final VoidCallback? onTap;

     const InteractiveSpring({
       required this.child,
       this.springConfig = const SpringConfig.defaultConfig(),
       this.minScale = 0.8,
       this.maxScale = 1.2,
       this.onTap,
     });

     @override
     State<InteractiveSpring> createState() => _InteractiveSpringState();
   }

   class _InteractiveSpringState extends State<InteractiveSpring> {
     late CustomAnimationController _controller;
     double _startScale = 1.0;
     double _currentScale = 1.0;

     @override
     void initState() {
       super.initState();
       _controller = CustomAnimationController(
         springConfig: widget.springConfig,
         targetValue: 1.0,
         minValue: widget.minScale,
         maxValue: widget.maxScale,
       );
     }

     void _handleScaleStart(ScaleStartDetails details) {
       _startScale = _currentScale;
       _controller.stop();
     }

     void _handleScaleUpdate(ScaleUpdateDetails details) {
       setState(() {
         _currentScale = (_startScale * details.scale).clamp(
           widget.minScale,
           widget.maxScale,
         );
       });
     }

     void _handleScaleEnd(ScaleEndDetails details) {
       _controller.targetValue = 1.0;
       _controller.start();
     }

     void _handleTap() {
       _controller.targetValue = widget.maxScale;
       _controller.start();
       Future.delayed(Duration(milliseconds: 100), () {
         _controller.targetValue = 1.0;
         _controller.start();
       });
       widget.onTap?.call();
     }

     @override
     Widget build(BuildContext context) {
       return GestureDetector(
         onScaleStart: _handleScaleStart,
         onScaleUpdate: _handleScaleUpdate,
         onScaleEnd: _handleScaleEnd,
         onTap: _handleTap,
         child: Transform.scale(
           scale: _currentScale,
           child: widget.child,
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

5. **Create Animation Sequences**

   ```dart
   class AnimationSequence {
     final List<AnimationStep> steps;
     int _currentStep = 0;
     bool _isPlaying = false;
     VoidCallback? onComplete;

     AnimationSequence({
       required this.steps,
       this.onComplete,
     });

     void start() {
       if (_isPlaying) return;
       _isPlaying = true;
       _playNextStep();
     }

     void stop() {
       _isPlaying = false;
       _currentStep = 0;
     }

     void _playNextStep() {
       if (!_isPlaying || _currentStep >= steps.length) {
         _isPlaying = false;
         onComplete?.call();
         return;
       }

       final step = steps[_currentStep];
       step.controller.start();
       step.controller.addListener(() {
         if (!step.controller.isAnimating) {
           _currentStep++;
           _playNextStep();
         }
       });
     }
   }

   class AnimationStep {
     final CustomAnimationController controller;
     final Duration delay;

     AnimationStep({
       required this.controller,
       this.delay = Duration.zero,
     });
   }
   ```

6. **Create Main Screen**

   ```dart
   class AnimationDemoScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Custom Animation Demo'),
         ),
         body: Center(
           child: Column(
             mainAxisAlignment: MainAxisAlignment.center,
             children: [
               InteractiveSpring(
                 springConfig: SpringConfig.bouncy,
                 child: Container(
                   width: 100,
                   height: 100,
                   decoration: BoxDecoration(
                     color: Colors.blue,
                     borderRadius: BorderRadius.circular(16),
                   ),
                   child: Icon(
                     Icons.favorite,
                     color: Colors.white,
                     size: 48,
                   ),
                 ),
                 onTap: () {
                   print('Tapped!');
                 },
               ),
               SizedBox(height: 32),
               AnimatedSpring(
                 targetValue: 1.2,
                 springConfig: SpringConfig.stiff,
                 child: Container(
                   width: 100,
                   height: 100,
                   decoration: BoxDecoration(
                     color: Colors.green,
                     borderRadius: BorderRadius.circular(16),
                   ),
                   child: Icon(
                     Icons.star,
                     color: Colors.white,
                     size: 48,
                   ),
                 ),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance**

   - Use const constructors
   - Optimize rebuilds
   - Handle large lists
   - Profile animations

2. **Animation Quality**

   - Use appropriate curves
   - Handle edge cases
   - Add easing
   - Consider physics

3. **Code Organization**

   - Separate concerns
   - Use composition
   - Follow patterns
   - Document code

4. **Testing**

   - Test animations
   - Verify physics
   - Check performance
   - Test edge cases

## Conclusion

This tutorial has shown you how to implement a custom animation system in Flutter with features like:

- Custom animation controllers
- Physics-based animations
- Interactive gestures
- Animation sequences

You can extend this implementation by adding:

- More physics models
- Complex sequences
- Gesture recognition
- Animation debugging

Remember to:

- Optimize performance
- Test thoroughly
- Handle edge cases
- Follow guidelines
- Keep code clean

This implementation provides a solid foundation for creating complex animations in Flutter.
