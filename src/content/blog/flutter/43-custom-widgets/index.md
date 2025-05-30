---
title: "Create Custom Widgets in Flutter"
summary: "Reusable UI component creation"
date: "2025, 01, 25"
tags: ["flutter", "widgets", "ui", "custom-widgets", "reusable-components"]
difficulty: "medium"
draft: false
---

## Create Custom Widgets in Flutter

Creating custom widgets is a fundamental part of Flutter development. This tutorial will show you how to create reusable, maintainable, and efficient custom widgets that can be used across your application.

## Features

- Custom widget creation
- Widget composition
- State management
- Animation support
- Theme integration
- Responsive design

## Implementation Steps

1. **Basic Custom Widget**

   ```dart
   class CustomButton extends StatelessWidget {
     final String text;
     final VoidCallback onPressed;
     final bool isLoading;
     final Color? backgroundColor;
     final Color? textColor;

     const CustomButton({
       required this.text,
       required this.onPressed,
       this.isLoading = false,
       this.backgroundColor,
       this.textColor,
     });

     @override
     Widget build(BuildContext context) {
       return ElevatedButton(
         onPressed: isLoading ? null : onPressed,
         style: ElevatedButton.styleFrom(
           backgroundColor: backgroundColor,
           padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
           shape: RoundedRectangleBorder(
             borderRadius: BorderRadius.circular(8),
           ),
         ),
         child: isLoading
             ? SizedBox(
                 width: 20,
                 height: 20,
                 child: CircularProgressIndicator(
                   strokeWidth: 2,
                   valueColor: AlwaysStoppedAnimation<Color>(
                     textColor ?? Colors.white,
                   ),
                 ),
               )
             : Text(
                 text,
                 style: TextStyle(
                   color: textColor,
                   fontSize: 16,
                   fontWeight: FontWeight.bold,
                 ),
               ),
       );
     }
   }
   ```

2. **Animated Custom Widget**

   ```dart
   class AnimatedCard extends StatefulWidget {
     final Widget child;
     final Duration duration;
     final bool isExpanded;

     const AnimatedCard({
       required this.child,
       this.duration = const Duration(milliseconds: 300),
       this.isExpanded = false,
     });

     @override
     _AnimatedCardState createState() => _AnimatedCardState();
   }

   class _AnimatedCardState extends State<AnimatedCard>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _animation;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         vsync: this,
         duration: widget.duration,
       );
       _animation = CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       );
       if (widget.isExpanded) {
         _controller.forward();
       }
     }

     @override
     void didUpdateWidget(AnimatedCard oldWidget) {
       super.didUpdateWidget(oldWidget);
       if (widget.isExpanded != oldWidget.isExpanded) {
         if (widget.isExpanded) {
           _controller.forward();
         } else {
           _controller.reverse();
         }
       }
     }

     @override
     Widget build(BuildContext context) {
       return AnimatedBuilder(
         animation: _animation,
         builder: (context, child) {
           return Transform.scale(
             scale: 0.8 + (_animation.value * 0.2),
             child: Opacity(
               opacity: _animation.value,
               child: child,
             ),
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
   ```

3. **Form Field Widget**

   ```dart
   class CustomTextField extends StatelessWidget {
     final String label;
     final String? hint;
     final TextEditingController controller;
     final String? Function(String?)? validator;
     final bool obscureText;
     final TextInputType keyboardType;
     final Widget? prefix;
     final Widget? suffix;
     final int? maxLines;
     final int? minLines;

     const CustomTextField({
       required this.label,
       this.hint,
       required this.controller,
       this.validator,
       this.obscureText = false,
       this.keyboardType = TextInputType.text,
       this.prefix,
       this.suffix,
       this.maxLines = 1,
       this.minLines,
     });

     @override
     Widget build(BuildContext context) {
       return Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           Text(
             label,
             style: Theme.of(context).textTheme.titleMedium,
           ),
           SizedBox(height: 8),
           TextFormField(
             controller: controller,
             validator: validator,
             obscureText: obscureText,
             keyboardType: keyboardType,
             maxLines: maxLines,
             minLines: minLines,
             decoration: InputDecoration(
               hintText: hint,
               prefixIcon: prefix,
               suffixIcon: suffix,
               border: OutlineInputBorder(
                 borderRadius: BorderRadius.circular(8),
               ),
               enabledBorder: OutlineInputBorder(
                 borderRadius: BorderRadius.circular(8),
                 borderSide: BorderSide(
                   color: Theme.of(context).dividerColor,
                 ),
               ),
               focusedBorder: OutlineInputBorder(
                 borderRadius: BorderRadius.circular(8),
                 borderSide: BorderSide(
                   color: Theme.of(context).primaryColor,
                   width: 2,
                 ),
               ),
               errorBorder: OutlineInputBorder(
                 borderRadius: BorderRadius.circular(8),
                 borderSide: BorderSide(
                   color: Theme.of(context).colorScheme.error,
                 ),
               ),
             ),
           ),
         ],
       );
     }
   }
   ```

4. **Loading Widget**

   ```dart
   class LoadingOverlay extends StatelessWidget {
     final Widget child;
     final bool isLoading;
     final String? message;

     const LoadingOverlay({
       required this.child,
       required this.isLoading,
       this.message,
     });

     @override
     Widget build(BuildContext context) {
       return Stack(
         children: [
           child,
           if (isLoading)
             Container(
               color: Colors.black.withOpacity(0.5),
               child: Center(
                 child: Card(
                   margin: EdgeInsets.all(16),
                   child: Padding(
                     padding: EdgeInsets.all(16),
                     child: Column(
                       mainAxisSize: MainAxisSize.min,
                       children: [
                         CircularProgressIndicator(),
                         if (message != null) ...[
                           SizedBox(height: 16),
                           Text(
                             message!,
                             style: Theme.of(context).textTheme.bodyLarge,
                           ),
                         ],
                       ],
                     ),
                   ),
                 ),
               ),
             ),
         ],
       );
     }
   }
   ```

5. **Custom Dialog Widget**

   ```dart
   class CustomDialog extends StatelessWidget {
     final String title;
     final String message;
     final String? confirmText;
     final String? cancelText;
     final VoidCallback? onConfirm;
     final VoidCallback? onCancel;
     final bool isDestructive;

     const CustomDialog({
       required this.title,
       required this.message,
       this.confirmText,
       this.cancelText,
       this.onConfirm,
       this.onCancel,
       this.isDestructive = false,
     });

     @override
     Widget build(BuildContext context) {
       return Dialog(
         shape: RoundedRectangleBorder(
           borderRadius: BorderRadius.circular(16),
         ),
         child: Padding(
           padding: EdgeInsets.all(24),
           child: Column(
             mainAxisSize: MainAxisSize.min,
             children: [
               Text(
                 title,
                 style: Theme.of(context).textTheme.titleLarge,
                 textAlign: TextAlign.center,
               ),
               SizedBox(height: 16),
               Text(
                 message,
                 style: Theme.of(context).textTheme.bodyMedium,
                 textAlign: TextAlign.center,
               ),
               SizedBox(height: 24),
               Row(
                 mainAxisAlignment: MainAxisAlignment.end,
                 children: [
                   if (cancelText != null)
                     TextButton(
                       onPressed: () {
                         Navigator.of(context).pop();
                         onCancel?.call();
                       },
                       child: Text(cancelText!),
                     ),
                   if (confirmText != null) ...[
                     SizedBox(width: 8),
                     ElevatedButton(
                       onPressed: () {
                         Navigator.of(context).pop();
                         onConfirm?.call();
                       },
                       style: ElevatedButton.styleFrom(
                         backgroundColor: isDestructive
                             ? Theme.of(context).colorScheme.error
                             : null,
                       ),
                       child: Text(confirmText!),
                     ),
                   ],
                 ],
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

## Best Practices

1. **Widget Design**

   - Keep widgets focused and single-purpose
   - Use composition over inheritance
   - Make widgets reusable and configurable
   - Follow Material Design guidelines

2. **Performance**

   - Use const constructors
   - Implement proper state management
   - Avoid unnecessary rebuilds
   - Optimize animations

3. **Accessibility**

   - Add semantic labels
   - Support screen readers
   - Consider color contrast
   - Handle different text sizes

4. **Testing**
   - Write widget tests
   - Test different states
   - Verify accessibility
   - Check performance

## Conclusion

This tutorial has shown you how to create various custom widgets in Flutter:

- Basic button widget
- Animated card widget
- Form field widget
- Loading overlay
- Custom dialog

You can extend these widgets by adding:

- More customization options
- Additional animations
- Theme support
- Accessibility features
- Internationalization
- Platform-specific adaptations

Remember to:

- Document your widgets
- Add proper error handling
- Consider edge cases
- Test thoroughly
- Follow Flutter best practices

These custom widgets will help you build more maintainable and reusable Flutter applications.
