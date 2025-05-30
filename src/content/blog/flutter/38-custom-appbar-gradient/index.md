---
title: "Custom AppBar with Gradient Background"
summary: "Stylish top bar for apps"
date: "2024, 04, 18"
tags: ["flutter", "ui-design", "gradient", "custom-widgets"]
difficulty: "beginner"
draft: false
---

## Custom AppBar with Gradient Background

Creating a custom AppBar with a gradient background can significantly enhance your app's visual appeal. This guide will show you how to implement a stylish gradient AppBar in Flutter.

## Why Use Gradient AppBar?

- Enhanced visual appeal
- Modern design aesthetic
- Brand consistency
- Better user experience
- Stand out from competitors
- Professional look and feel

## Implementation Steps

1. **Basic Gradient AppBar**

   ```dart
   class GradientAppBar extends StatelessWidget implements PreferredSizeWidget {
     final String title;
     final List<Color> colors;
     final List<double> stops;

     const GradientAppBar({
       required this.title,
       this.colors = const [Colors.blue, Colors.purple],
       this.stops = const [0.0, 1.0],
     });

     @override
     Widget build(BuildContext context) {
       return Container(
         decoration: BoxDecoration(
           gradient: LinearGradient(
             colors: colors,
             stops: stops,
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
           ),
         ),
         child: AppBar(
           title: Text(title),
           backgroundColor: Colors.transparent,
           elevation: 0,
         ),
       );
     }

     @override
     Size get preferredSize => Size.fromHeight(kToolbarHeight);
   }
   ```

2. **Advanced Gradient AppBar with Actions**

   ```dart
   class AdvancedGradientAppBar extends StatelessWidget implements PreferredSizeWidget {
     final String title;
     final List<Color> colors;
     final List<double> stops;
     final List<Widget> actions;
     final Widget? leading;
     final bool centerTitle;
     final double height;

     const AdvancedGradientAppBar({
       required this.title,
       this.colors = const [Colors.blue, Colors.purple],
       this.stops = const [0.0, 1.0],
       this.actions = const [],
       this.leading,
       this.centerTitle = true,
       this.height = kToolbarHeight,
     });

     @override
     Widget build(BuildContext context) {
       return Container(
         height: height,
         decoration: BoxDecoration(
           gradient: LinearGradient(
             colors: colors,
             stops: stops,
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
           ),
         ),
         child: AppBar(
           title: Text(
             title,
             style: TextStyle(
               color: Colors.white,
               fontWeight: FontWeight.bold,
             ),
           ),
           backgroundColor: Colors.transparent,
           elevation: 0,
           actions: actions,
           leading: leading,
           centerTitle: centerTitle,
         ),
       );
     }

     @override
     Size get preferredSize => Size.fromHeight(height);
   }
   ```

3. **Animated Gradient AppBar**

   ```dart
   class AnimatedGradientAppBar extends StatefulWidget implements PreferredSizeWidget {
     final String title;
     final List<List<Color>> colorSets;
     final Duration duration;

     const AnimatedGradientAppBar({
       required this.title,
       this.colorSets = const [
         [Colors.blue, Colors.purple],
         [Colors.purple, Colors.red],
         [Colors.red, Colors.orange],
       ],
       this.duration = const Duration(seconds: 5),
     });

     @override
     _AnimatedGradientAppBarState createState() => _AnimatedGradientAppBarState();

     @override
     Size get preferredSize => Size.fromHeight(kToolbarHeight);
   }

   class _AnimatedGradientAppBarState extends State<AnimatedGradientAppBar>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _animation;
     int _currentIndex = 0;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         vsync: this,
         duration: widget.duration,
       );

       _animation = Tween<double>(begin: 0, end: 1).animate(_controller)
         ..addListener(() {
           setState(() {});
         })
         ..addStatusListener((status) {
           if (status == AnimationStatus.completed) {
             _currentIndex = (_currentIndex + 1) % widget.colorSets.length;
             _controller.reset();
             _controller.forward();
           }
         });

       _controller.forward();
     }

     @override
     Widget build(BuildContext context) {
       final currentColors = widget.colorSets[_currentIndex];
       final nextColors = widget.colorSets[(_currentIndex + 1) % widget.colorSets.length];

       return Container(
         decoration: BoxDecoration(
           gradient: LinearGradient(
             colors: [
               Color.lerp(currentColors[0], nextColors[0], _animation.value)!,
               Color.lerp(currentColors[1], nextColors[1], _animation.value)!,
             ],
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
           ),
         ),
         child: AppBar(
           title: Text(widget.title),
           backgroundColor: Colors.transparent,
           elevation: 0,
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

4. **Scroll-Aware Gradient AppBar**

   ```dart
   class ScrollAwareGradientAppBar extends StatefulWidget implements PreferredSizeWidget {
     final String title;
     final List<Color> colors;
     final ScrollController scrollController;

     const ScrollAwareGradientAppBar({
       required this.title,
       required this.colors,
       required this.scrollController,
     });

     @override
     _ScrollAwareGradientAppBarState createState() => _ScrollAwareGradientAppBarState();

     @override
     Size get preferredSize => Size.fromHeight(kToolbarHeight);
   }

   class _ScrollAwareGradientAppBarState extends State<ScrollAwareGradientAppBar> {
     double _scrollOffset = 0;

     @override
     void initState() {
       super.initState();
       widget.scrollController.addListener(_onScroll);
     }

     void _onScroll() {
       setState(() {
         _scrollOffset = widget.scrollController.offset;
       });
     }

     @override
     Widget build(BuildContext context) {
       final opacity = (1 - (_scrollOffset / 200)).clamp(0.0, 1.0);

       return Container(
         decoration: BoxDecoration(
           gradient: LinearGradient(
             colors: widget.colors.map((color) {
               return color.withOpacity(opacity);
             }).toList(),
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
           ),
         ),
         child: AppBar(
           title: Text(
             widget.title,
             style: TextStyle(
               color: Colors.white.withOpacity(opacity),
             ),
           ),
           backgroundColor: Colors.transparent,
           elevation: 0,
         ),
       );
     }

     @override
     void dispose() {
       widget.scrollController.removeListener(_onScroll);
       super.dispose();
     }
   }
   ```

## Advanced Features

1. **Custom Gradient Patterns**

   ```dart
   class PatternGradientAppBar extends StatelessWidget implements PreferredSizeWidget {
     final String title;
     final List<Color> colors;
     final CustomPainter pattern;

     const PatternGradientAppBar({
       required this.title,
       required this.colors,
       required this.pattern,
     });

     @override
     Widget build(BuildContext context) {
       return Container(
         decoration: BoxDecoration(
           gradient: LinearGradient(
             colors: colors,
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
           ),
         ),
         child: CustomPaint(
           painter: pattern,
           child: AppBar(
             title: Text(title),
             backgroundColor: Colors.transparent,
             elevation: 0,
           ),
         ),
       );
     }

     @override
     Size get preferredSize => Size.fromHeight(kToolbarHeight);
   }
   ```

2. **Blur Effect**

   ```dart
   class BlurredGradientAppBar extends StatelessWidget implements PreferredSizeWidget {
     final String title;
     final List<Color> colors;
     final double blurRadius;

     const BlurredGradientAppBar({
       required this.title,
       required this.colors,
       this.blurRadius = 10,
     });

     @override
     Widget build(BuildContext context) {
       return Container(
         decoration: BoxDecoration(
           gradient: LinearGradient(
             colors: colors,
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
           ),
         ),
         child: BackdropFilter(
           filter: ImageFilter.blur(
             sigmaX: blurRadius,
             sigmaY: blurRadius,
           ),
           child: AppBar(
             title: Text(title),
             backgroundColor: Colors.transparent,
             elevation: 0,
           ),
         ),
       );
     }

     @override
     Size get preferredSize => Size.fromHeight(kToolbarHeight);
   }
   ```

3. **Interactive Gradient**

   ```dart
   class InteractiveGradientAppBar extends StatefulWidget implements PreferredSizeWidget {
     final String title;
     final List<Color> colors;

     const InteractiveGradientAppBar({
       required this.title,
       required this.colors,
     });

     @override
     _InteractiveGradientAppBarState createState() => _InteractiveGradientAppBarState();

     @override
     Size get preferredSize => Size.fromHeight(kToolbarHeight);
   }

   class _InteractiveGradientAppBarState extends State<InteractiveGradientAppBar> {
     Offset _dragPosition = Offset.zero;

     @override
     Widget build(BuildContext context) {
       return GestureDetector(
         onPanUpdate: (details) {
           setState(() {
             _dragPosition += details.delta;
           });
         },
         child: Container(
           decoration: BoxDecoration(
             gradient: LinearGradient(
               colors: widget.colors,
               begin: Alignment(
                 _dragPosition.dx / 100,
                 _dragPosition.dy / 100,
               ),
               end: Alignment(
                 -_dragPosition.dx / 100,
                 -_dragPosition.dy / 100,
               ),
             ),
           ),
           child: AppBar(
             title: Text(widget.title),
             backgroundColor: Colors.transparent,
             elevation: 0,
           ),
         ),
       );
     }
   }
   ```

## Best Practices

1. **Design Considerations**

   - Choose complementary colors
   - Consider brand guidelines
   - Ensure text readability
   - Test on different devices
   - Consider dark mode
   - Maintain consistency

2. **Performance**

   - Optimize gradient calculations
   - Cache gradient values
   - Minimize rebuilds
   - Use const constructors
   - Profile performance
   - Handle memory efficiently

3. **Accessibility**
   - Ensure contrast ratios
   - Support screen readers
   - Provide alternative text
   - Consider color blindness
   - Test with assistive tools
   - Follow guidelines

## Common Use Cases

1. **Brand Identity**

   - Company colors
   - Logo integration
   - Brand consistency
   - Visual recognition
   - Marketing alignment
   - User association

2. **User Experience**

   - Visual hierarchy
   - Navigation clarity
   - Status indication
   - Context awareness
   - User feedback
   - Interaction cues

3. **App Categories**
   - Social media apps
   - E-commerce platforms
   - Entertainment apps
   - Productivity tools
   - Health applications
   - Educational apps

## Conclusion

Creating a custom gradient AppBar in Flutter can significantly enhance your app's visual appeal and user experience. By following these guidelines and implementing the provided examples, you can create beautiful and functional gradient AppBars that make your app stand out.
