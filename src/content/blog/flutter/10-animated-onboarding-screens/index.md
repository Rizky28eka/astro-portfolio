---
title: "Animated Onboarding Screens in Flutter"
summary: "First-time user onboarding flow"
date: "2024, 03, 29"
tags: ["flutter", "animation", "onboarding", "ui"]
difficulty: "medium"
draft: false
---

## Animated Onboarding Screens in Flutter

Onboarding screens are crucial for introducing new users to your app's features and functionality. This guide will show you how to create engaging and animated onboarding screens in Flutter that provide a great first-time user experience.

## Why Use Animated Onboarding?

Animated onboarding screens:

- Engage users immediately
- Explain app features clearly
- Create memorable first impressions
- Guide users through setup

## Implementation

1. **Onboarding Screen Structure**

   ```dart
   class OnboardingScreen extends StatefulWidget {
     @override
     _OnboardingScreenState createState() => _OnboardingScreenState();
   }

   class _OnboardingScreenState extends State<OnboardingScreen> {
     final PageController _pageController = PageController();
     int _currentPage = 0;

     final List<OnboardingPage> _pages = [
       OnboardingPage(
         title: 'Welcome',
         description: 'Discover amazing features',
         image: 'assets/onboarding1.png',
       ),
       OnboardingPage(
         title: 'Connect',
         description: 'Connect with others',
         image: 'assets/onboarding2.png',
       ),
       OnboardingPage(
         title: 'Get Started',
         description: 'Begin your journey',
         image: 'assets/onboarding3.png',
       ),
     ];

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: Stack(
           children: [
             PageView.builder(
               controller: _pageController,
               itemCount: _pages.length,
               onPageChanged: (int page) {
                 setState(() {
                   _currentPage = page;
                 });
               },
               itemBuilder: (context, index) {
                 return _buildPage(_pages[index]);
               },
             ),
             _buildPageIndicator(),
             _buildNavigationButtons(),
           ],
         ),
       );
     }
   }
   ```

2. **Animated Page Content**

   ```dart
   Widget _buildPage(OnboardingPage page) {
     return Container(
       padding: EdgeInsets.all(40.0),
       child: Column(
         mainAxisAlignment: MainAxisAlignment.center,
         children: [
           TweenAnimationBuilder(
             duration: Duration(milliseconds: 500),
             tween: Tween<double>(begin: 0, end: 1),
             builder: (context, double value, child) {
               return Transform.scale(
                 scale: value,
                 child: Image.asset(
                   page.image,
                   height: 300,
                 ),
               );
             },
           ),
           SizedBox(height: 30),
           Text(
             page.title,
             style: TextStyle(
               fontSize: 24,
               fontWeight: FontWeight.bold,
             ),
           ),
           SizedBox(height: 20),
           Text(
             page.description,
             textAlign: TextAlign.center,
             style: TextStyle(
               fontSize: 16,
               color: Colors.grey[600],
             ),
           ),
         ],
       ),
     );
   }
   ```

3. **Page Indicator**
   ```dart
   Widget _buildPageIndicator() {
     return Positioned(
       bottom: 100,
       left: 0,
       right: 0,
       child: Row(
         mainAxisAlignment: MainAxisAlignment.center,
         children: List.generate(
           _pages.length,
           (index) => AnimatedContainer(
             duration: Duration(milliseconds: 300),
             margin: EdgeInsets.symmetric(horizontal: 5),
             height: 10,
             width: _currentPage == index ? 30 : 10,
             decoration: BoxDecoration(
               color: _currentPage == index
                   ? Theme.of(context).primaryColor
                   : Colors.grey[300],
               borderRadius: BorderRadius.circular(5),
             ),
           ),
         ),
       ),
     );
   }
   ```

## Advanced Features

1. **Smooth Page Transitions**

   ```dart
   class SmoothPageRoute extends PageRouteBuilder {
     final Widget page;
     SmoothPageRoute({required this.page})
         : super(
             pageBuilder: (context, animation, secondaryAnimation) => page,
             transitionsBuilder: (context, animation, secondaryAnimation, child) {
               var begin = Offset(1.0, 0.0);
               var end = Offset.zero;
               var curve = Curves.easeInOut;
               var tween = Tween(begin: begin, end: end).chain(
                 CurveTween(curve: curve),
               );
               return SlideTransition(
                 position: animation.drive(tween),
                 child: child,
               );
             },
           );
   }
   ```

2. **Parallax Effect**

   ```dart
   Widget _buildParallaxImage(String image) {
     return TweenAnimationBuilder(
       duration: Duration(milliseconds: 500),
       tween: Tween<double>(begin: 0, end: 1),
       builder: (context, double value, child) {
         return Transform.translate(
           offset: Offset(0, 50 * (1 - value)),
           child: Opacity(
             opacity: value,
             child: Image.asset(image),
           ),
         );
       },
     );
   }
   ```

3. **Skip Button Animation**
   ```dart
   Widget _buildSkipButton() {
     return AnimatedOpacity(
       duration: Duration(milliseconds: 300),
       opacity: _currentPage == _pages.length - 1 ? 0.0 : 1.0,
       child: TextButton(
         onPressed: () {
           _pageController.animateToPage(
             _pages.length - 1,
             duration: Duration(milliseconds: 500),
             curve: Curves.easeInOut,
           );
         },
         child: Text('Skip'),
       ),
     );
   }
   ```

## Best Practices

1. **Animation Guidelines**

   - Keep animations smooth
   - Use appropriate durations
   - Consider device performance
   - Test on different devices

2. **Content Design**

   - Clear and concise text
   - High-quality images
   - Consistent styling
   - Proper spacing

3. **User Experience**
   - Easy navigation
   - Progress indication
   - Skip option
   - Smooth transitions

## Common Features

1. **Navigation Options**

   - Swipe gestures
   - Next/Previous buttons
   - Skip button
   - Progress dots

2. **Content Types**

   - Feature highlights
   - App benefits
   - Setup instructions
   - Welcome messages

3. **Interactive Elements**
   - Animated illustrations
   - Progress indicators
   - Action buttons
   - Background effects

## Conclusion

Creating animated onboarding screens in Flutter provides an excellent opportunity to engage users and showcase your app's features. By following these guidelines and implementing the provided examples, you can create an engaging and memorable onboarding experience for your users.
