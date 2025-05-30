---
title: "Create Bottom Navigation Bar"
summary: "Switch tabs with bottom nav"
date: "2024, 03, 24"
tags: ["flutter", "ui", "navigation", "bottom-bar"]
difficulty: "beginner"
draft: false
---

## Create Bottom Navigation Bar

A bottom navigation bar is a common UI pattern in mobile applications that allows users to quickly switch between different sections of the app. This guide will show you how to implement a modern and functional bottom navigation bar in Flutter.

## Why Use Bottom Navigation?

Bottom navigation bars offer several benefits:

- Easy access to main features
- Clear visual hierarchy
- Familiar user experience
- Efficient navigation

## Implementation

1. **Basic Bottom Navigation**

   ```dart
   class MainScreen extends StatefulWidget {
     @override
     _MainScreenState createState() => _MainScreenState();
   }

   class _MainScreenState extends State<MainScreen> {
     int _selectedIndex = 0;

     final List<Widget> _screens = [
       HomeScreen(),
       SearchScreen(),
       ProfileScreen(),
     ];

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: _screens[_selectedIndex],
         bottomNavigationBar: BottomNavigationBar(
           currentIndex: _selectedIndex,
           onTap: (index) {
             setState(() {
               _selectedIndex = index;
             });
           },
           items: [
             BottomNavigationBarItem(
               icon: Icon(Icons.home),
               label: 'Home',
             ),
             BottomNavigationBarItem(
               icon: Icon(Icons.search),
               label: 'Search',
             ),
             BottomNavigationBarItem(
               icon: Icon(Icons.person),
               label: 'Profile',
             ),
           ],
         ),
       );
     }
   }
   ```

2. **Custom Styled Navigation**
   ```dart
   BottomNavigationBar(
     currentIndex: _selectedIndex,
     selectedItemColor: Theme.of(context).primaryColor,
     unselectedItemColor: Colors.grey,
     selectedLabelStyle: TextStyle(fontWeight: FontWeight.bold),
     type: BottomNavigationBarType.fixed,
     items: [
       // Navigation items
     ],
   )
   ```

## Advanced Features

1. **Animated Navigation**

   ```dart
   class _MainScreenState extends State<MainScreen>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late Animation<double> _animation;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 300),
         vsync: this,
       );
       _animation = CurvedAnimation(
         parent: _controller,
         curve: Curves.easeInOut,
       );
     }

     void _onItemTapped(int index) {
       setState(() {
         _selectedIndex = index;
       });
       _controller.forward(from: 0.0);
     }
   }
   ```

2. **Badge Support**
   ```dart
   BottomNavigationBarItem(
     icon: Stack(
       children: [
         Icon(Icons.notifications),
         Positioned(
           right: 0,
           top: 0,
           child: Container(
             padding: EdgeInsets.all(2),
             decoration: BoxDecoration(
               color: Colors.red,
               borderRadius: BorderRadius.circular(10),
             ),
             child: Text(
               '3',
               style: TextStyle(
                 color: Colors.white,
                 fontSize: 10,
               ),
             ),
           ),
         ),
       ],
     ),
     label: 'Notifications',
   )
   ```

## Best Practices

1. **Design Guidelines**

   - Use 3-5 navigation items
   - Include clear icons and labels
   - Maintain consistent spacing
   - Follow platform guidelines

2. **User Experience**

   - Provide visual feedback
   - Maintain state between tabs
   - Handle deep linking
   - Support accessibility

3. **Performance**
   - Lazy load tab content
   - Cache tab states
   - Optimize animations
   - Handle memory efficiently

## Common Use Cases

1. **Social Media Apps**

   - Feed
   - Search
   - Notifications
   - Profile

2. **E-commerce Apps**

   - Home
   - Categories
   - Cart
   - Account

3. **Productivity Apps**
   - Dashboard
   - Tasks
   - Calendar
   - Settings

## Conclusion

A well-implemented bottom navigation bar enhances your app's usability and provides a familiar navigation pattern for users. By following these guidelines and implementing the provided examples, you can create an effective and user-friendly navigation system for your Flutter application.
