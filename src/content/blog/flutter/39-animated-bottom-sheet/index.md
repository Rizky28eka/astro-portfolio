---
title: "Animated Bottom Sheet in Flutter"
summary: "Slide-up panel with animation"
date: "2024, 04, 19"
tags: ["flutter", "animation", "ui-design", "bottom-sheet"]
difficulty: "medium"
draft: false
---

## Animated Bottom Sheet in Flutter

Animated bottom sheets are a great way to present additional content or actions in your Flutter app. This guide will show you how to create smooth and engaging animated bottom sheets.

## Why Use Animated Bottom Sheets?

- Smooth user experience
- Space-efficient UI
- Contextual actions
- Modern design pattern
- Better engagement
- Intuitive interaction

## Implementation Steps

1. **Basic Animated Bottom Sheet**

   ```dart
   class AnimatedBottomSheet extends StatefulWidget {
     final Widget child;
     final double initialHeight;
     final double maxHeight;

     const AnimatedBottomSheet({
       required this.child,
       this.initialHeight = 100,
       this.maxHeight = 400,
     });

     @override
     _AnimatedBottomSheetState createState() => _AnimatedBottomSheetState();
   }

   class _AnimatedBottomSheetState extends State<AnimatedBottomSheet>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _heightAnimation;
     bool _isExpanded = false;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 300),
         vsync: this,
       );

       _heightAnimation = Tween<double>(
         begin: widget.initialHeight,
         end: widget.maxHeight,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));
     }

     @override
     Widget build(BuildContext context) {
       return GestureDetector(
         onVerticalDragUpdate: _handleDragUpdate,
         onVerticalDragEnd: _handleDragEnd,
         child: AnimatedBuilder(
           animation: _heightAnimation,
           builder: (context, child) {
             return Container(
               height: _heightAnimation.value,
               decoration: BoxDecoration(
                 color: Colors.white,
                 borderRadius: BorderRadius.vertical(
                   top: Radius.circular(20),
                 ),
                 boxShadow: [
                   BoxShadow(
                     color: Colors.black26,
                     blurRadius: 10,
                     offset: Offset(0, -2),
                   ),
                 ],
               ),
               child: Column(
                 children: [
                   _buildDragHandle(),
                   Expanded(child: widget.child),
                 ],
               ),
             );
           },
         ),
       );
     }

     Widget _buildDragHandle() {
       return Container(
         width: 40,
         height: 4,
         margin: EdgeInsets.symmetric(vertical: 8),
         decoration: BoxDecoration(
           color: Colors.grey[300],
           borderRadius: BorderRadius.circular(2),
         ),
       );
     }

     void _handleDragUpdate(DragUpdateDetails details) {
       setState(() {
         _heightAnimation.value = (_heightAnimation.value - details.delta.dy)
             .clamp(widget.initialHeight, widget.maxHeight);
       });
     }

     void _handleDragEnd(DragEndDetails details) {
       final velocity = details.velocity.pixelsPerSecond.dy;
       if (velocity.abs() > 500) {
         _isExpanded = velocity < 0;
       } else {
         _isExpanded = _heightAnimation.value > (widget.maxHeight + widget.initialHeight) / 2;
       }

       _controller.animateTo(
         _isExpanded ? 1.0 : 0.0,
         duration: Duration(milliseconds: 300),
         curve: Curves.easeInOut,
       );
     }

     @override
     void dispose() {
       _controller.dispose();
       super.dispose();
     }
   }
   ```

2. **Advanced Bottom Sheet with Backdrop**

   ```dart
   class BackdropBottomSheet extends StatefulWidget {
     final Widget child;
     final double initialHeight;
     final double maxHeight;
     final Color backdropColor;

     const BackdropBottomSheet({
       required this.child,
       this.initialHeight = 100,
       this.maxHeight = 400,
       this.backdropColor = Colors.black54,
     });

     @override
     _BackdropBottomSheetState createState() => _BackdropBottomSheetState();
   }

   class _BackdropBottomSheetState extends State<BackdropBottomSheet>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _heightAnimation;
     late Animation<double> _backdropAnimation;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 300),
         vsync: this,
       );

       _heightAnimation = Tween<double>(
         begin: widget.initialHeight,
         end: widget.maxHeight,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));

       _backdropAnimation = Tween<double>(
         begin: 0.0,
         end: 1.0,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));
     }

     @override
     Widget build(BuildContext context) {
       return Stack(
         children: [
           GestureDetector(
             onTap: () => _controller.reverse(),
             child: AnimatedBuilder(
               animation: _backdropAnimation,
               builder: (context, child) {
                 return Container(
                   color: widget.backdropColor.withOpacity(_backdropAnimation.value),
                 );
               },
             ),
           ),
           Positioned(
             left: 0,
             right: 0,
             bottom: 0,
             child: AnimatedBuilder(
               animation: _heightAnimation,
               builder: (context, child) {
                 return Container(
                   height: _heightAnimation.value,
                   decoration: BoxDecoration(
                     color: Colors.white,
                     borderRadius: BorderRadius.vertical(
                       top: Radius.circular(20),
                     ),
                     boxShadow: [
                       BoxShadow(
                         color: Colors.black26,
                         blurRadius: 10,
                         offset: Offset(0, -2),
                       ),
                     ],
                   ),
                   child: Column(
                     children: [
                       _buildDragHandle(),
                       Expanded(child: widget.child),
                     ],
                   ),
                 );
               },
             ),
           ),
         ],
       );
     }

     Widget _buildDragHandle() {
       return GestureDetector(
         onVerticalDragUpdate: _handleDragUpdate,
         onVerticalDragEnd: _handleDragEnd,
         child: Container(
           width: 40,
           height: 4,
           margin: EdgeInsets.symmetric(vertical: 8),
           decoration: BoxDecoration(
             color: Colors.grey[300],
             borderRadius: BorderRadius.circular(2),
           ),
         ),
       );
     }

     void _handleDragUpdate(DragUpdateDetails details) {
       _controller.value -= details.delta.dy / widget.maxHeight;
     }

     void _handleDragEnd(DragEndDetails details) {
       final velocity = details.velocity.pixelsPerSecond.dy;
       if (velocity.abs() > 500) {
         _controller.animateTo(
           velocity < 0 ? 1.0 : 0.0,
           duration: Duration(milliseconds: 300),
           curve: Curves.easeInOut,
         );
       } else {
         _controller.animateTo(
           _controller.value > 0.5 ? 1.0 : 0.0,
           duration: Duration(milliseconds: 300),
           curve: Curves.easeInOut,
         );
       }
     }

     @override
     void dispose() {
       _controller.dispose();
       super.dispose();
     }
   }
   ```

3. **Bottom Sheet with Multiple States**

   ```dart
   enum BottomSheetState { collapsed, expanded, fullscreen }

   class MultiStateBottomSheet extends StatefulWidget {
     final Widget child;
     final Map<BottomSheetState, double> heights;

     const MultiStateBottomSheet({
       required this.child,
       required this.heights,
     });

     @override
     _MultiStateBottomSheetState createState() => _MultiStateBottomSheetState();
   }

   class _MultiStateBottomSheetState extends State<MultiStateBottomSheet>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _heightAnimation;
     BottomSheetState _currentState = BottomSheetState.collapsed;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 300),
         vsync: this,
       );

       _heightAnimation = Tween<double>(
         begin: widget.heights[BottomSheetState.collapsed]!,
         end: widget.heights[BottomSheetState.fullscreen]!,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));
     }

     void _animateToState(BottomSheetState state) {
       final targetValue = _getTargetValue(state);
       _controller.animateTo(
         targetValue,
         duration: Duration(milliseconds: 300),
         curve: Curves.easeInOut,
       );
       setState(() {
         _currentState = state;
       });
     }

     double _getTargetValue(BottomSheetState state) {
       switch (state) {
         case BottomSheetState.collapsed:
           return 0.0;
         case BottomSheetState.expanded:
           return 0.5;
         case BottomSheetState.fullscreen:
           return 1.0;
       }
     }

     @override
     Widget build(BuildContext context) {
       return AnimatedBuilder(
         animation: _heightAnimation,
         builder: (context, child) {
           return Container(
             height: _heightAnimation.value,
             decoration: BoxDecoration(
               color: Colors.white,
               borderRadius: BorderRadius.vertical(
                 top: Radius.circular(20),
               ),
               boxShadow: [
                 BoxShadow(
                   color: Colors.black26,
                   blurRadius: 10,
                   offset: Offset(0, -2),
                 ),
               ],
             ),
             child: Column(
               children: [
                 _buildDragHandle(),
                 Expanded(child: widget.child),
               ],
             ),
           );
         },
       );
     }

     Widget _buildDragHandle() {
       return GestureDetector(
         onTap: () {
           final nextState = _getNextState();
           _animateToState(nextState);
         },
         child: Container(
           width: 40,
           height: 4,
           margin: EdgeInsets.symmetric(vertical: 8),
           decoration: BoxDecoration(
             color: Colors.grey[300],
             borderRadius: BorderRadius.circular(2),
           ),
         ),
       );
     }

     BottomSheetState _getNextState() {
       switch (_currentState) {
         case BottomSheetState.collapsed:
           return BottomSheetState.expanded;
         case BottomSheetState.expanded:
           return BottomSheetState.fullscreen;
         case BottomSheetState.fullscreen:
           return BottomSheetState.collapsed;
       }
     }

     @override
     void dispose() {
       _controller.dispose();
       super.dispose();
     }
   }
   ```

## Advanced Features

1. **Bottom Sheet with Snap Points**

   ```dart
   class SnapBottomSheet extends StatefulWidget {
     final Widget child;
     final List<double> snapPoints;

     const SnapBottomSheet({
       required this.child,
       required this.snapPoints,
     });

     @override
     _SnapBottomSheetState createState() => _SnapBottomSheetState();
   }

   class _SnapBottomSheetState extends State<SnapBottomSheet>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _heightAnimation;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 300),
         vsync: this,
       );

       _heightAnimation = Tween<double>(
         begin: widget.snapPoints.first,
         end: widget.snapPoints.last,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));
     }

     void _snapToPoint(double point) {
       final index = widget.snapPoints.indexOf(point);
       final value = index / (widget.snapPoints.length - 1);
       _controller.animateTo(
         value,
         duration: Duration(milliseconds: 300),
         curve: Curves.easeInOut,
       );
     }

     @override
     Widget build(BuildContext context) {
       return AnimatedBuilder(
         animation: _heightAnimation,
         builder: (context, child) {
           return Container(
             height: _heightAnimation.value,
             decoration: BoxDecoration(
               color: Colors.white,
               borderRadius: BorderRadius.vertical(
                 top: Radius.circular(20),
               ),
               boxShadow: [
                 BoxShadow(
                   color: Colors.black26,
                   blurRadius: 10,
                   offset: Offset(0, -2),
                 ),
               ],
             ),
             child: Column(
               children: [
                 _buildDragHandle(),
                 Expanded(child: widget.child),
               ],
             ),
           );
         },
       );
     }

     Widget _buildDragHandle() {
       return GestureDetector(
         onVerticalDragEnd: (details) {
           final velocity = details.velocity.pixelsPerSecond.dy;
           final currentHeight = _heightAnimation.value;
           final nearestPoint = widget.snapPoints.reduce((a, b) {
             return (a - currentHeight).abs() < (b - currentHeight).abs() ? a : b;
           });
           _snapToPoint(nearestPoint);
         },
         child: Container(
           width: 40,
           height: 4,
           margin: EdgeInsets.symmetric(vertical: 8),
           decoration: BoxDecoration(
             color: Colors.grey[300],
             borderRadius: BorderRadius.circular(2),
           ),
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

2. **Bottom Sheet with Content Animation**

   ```dart
   class AnimatedContentBottomSheet extends StatefulWidget {
     final Widget child;
     final double initialHeight;
     final double maxHeight;

     const AnimatedContentBottomSheet({
       required this.child,
       this.initialHeight = 100,
       this.maxHeight = 400,
     });

     @override
     _AnimatedContentBottomSheetState createState() =>
         _AnimatedContentBottomSheetState();
   }

   class _AnimatedContentBottomSheetState
       extends State<AnimatedContentBottomSheet>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _heightAnimation;
     late Animation<double> _contentAnimation;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 300),
         vsync: this,
       );

       _heightAnimation = Tween<double>(
         begin: widget.initialHeight,
         end: widget.maxHeight,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));

       _contentAnimation = Tween<double>(
         begin: 0.0,
         end: 1.0,
       ).animate(CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       ));
     }

     @override
     Widget build(BuildContext context) {
       return AnimatedBuilder(
         animation: _heightAnimation,
         builder: (context, child) {
           return Container(
             height: _heightAnimation.value,
             decoration: BoxDecoration(
               color: Colors.white,
               borderRadius: BorderRadius.vertical(
                 top: Radius.circular(20),
               ),
               boxShadow: [
                 BoxShadow(
                   color: Colors.black26,
                   blurRadius: 10,
                   offset: Offset(0, -2),
                 ),
               ],
             ),
             child: Column(
               children: [
                 _buildDragHandle(),
                 Expanded(
                   child: AnimatedBuilder(
                     animation: _contentAnimation,
                     builder: (context, child) {
                       return Opacity(
                         opacity: _contentAnimation.value,
                         child: Transform.translate(
                           offset: Offset(
                             0,
                             20 * (1 - _contentAnimation.value),
                           ),
                           child: widget.child,
                         ),
                       );
                     },
                   ),
                 ),
               ],
             ),
           );
         },
       );
     }

     Widget _buildDragHandle() {
       return GestureDetector(
         onVerticalDragUpdate: (details) {
           _controller.value -= details.delta.dy / widget.maxHeight;
         },
         onVerticalDragEnd: (details) {
           final velocity = details.velocity.pixelsPerSecond.dy;
           if (velocity.abs() > 500) {
             _controller.animateTo(
               velocity < 0 ? 1.0 : 0.0,
               duration: Duration(milliseconds: 300),
               curve: Curves.easeInOut,
             );
           } else {
             _controller.animateTo(
               _controller.value > 0.5 ? 1.0 : 0.0,
               duration: Duration(milliseconds: 300),
               curve: Curves.easeInOut,
             );
           }
         },
         child: Container(
           width: 40,
           height: 4,
           margin: EdgeInsets.symmetric(vertical: 8),
           decoration: BoxDecoration(
             color: Colors.grey[300],
             borderRadius: BorderRadius.circular(2),
           ),
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

## Best Practices

1. **Animation Design**

   - Smooth transitions
   - Natural feel
   - Appropriate timing
   - Consistent behavior
   - Performance optimization
   - User feedback

2. **User Experience**

   - Clear affordances
   - Intuitive gestures
   - Responsive feedback
   - Smooth interactions
   - Error prevention
   - Accessibility

3. **Implementation**
   - Clean architecture
   - Reusable components
   - State management
   - Error handling
   - Performance monitoring
   - Code organization

## Common Use Cases

1. **Content Display**

   - Detailed information
   - Media content
   - Forms and inputs
   - Lists and grids
   - Maps and locations
   - Settings panels

2. **User Actions**

   - Quick actions
   - Context menus
   - Selection tools
   - Input forms
   - Confirmation dialogs
   - Navigation options

3. **App Features**
   - Search interfaces
   - Filter options
   - Sort controls
   - View toggles
   - Settings panels
   - Help content

## Conclusion

Implementing animated bottom sheets in Flutter can significantly enhance your app's user experience. By following these guidelines and implementing the provided examples, you can create smooth and engaging bottom sheets that make your app more intuitive and user-friendly.
