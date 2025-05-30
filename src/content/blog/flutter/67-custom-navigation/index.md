---
title: "Custom Navigation System"
summary: "Build a flexible and animated navigation system"
date: "2025, 04, 06"
tags: ["flutter", "navigation", "custom-router", "transitions", "deep-linking"]
difficulty: "advanced"
draft: false
---

## Custom Navigation System

Creating a custom navigation system in Flutter allows for flexible routing, animated transitions, and deep linking support. This tutorial will guide you through implementing a custom navigation system with features like route management, transition animations, and navigation state persistence.

## Features

- Custom route management
- Animated transitions
- Deep linking
- Route guards
- Navigation state
- Route parameters
- Nested navigation
- Modal routes
- Route observers
- Navigation history

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     go_router: ^13.0.0
     shared_preferences: ^2.2.2
     provider: ^6.1.1
     path_provider: ^2.1.2
   ```

2. **Create Navigation Models**

   ```dart
   class NavigationState {
     final String currentRoute;
     final Map<String, dynamic> params;
     final List<String> history;
     final bool isModal;

     NavigationState({
       required this.currentRoute,
       this.params = const {},
       this.history = const [],
       this.isModal = false,
     });

     NavigationState copyWith({
       String? currentRoute,
       Map<String, dynamic>? params,
       List<String>? history,
       bool? isModal,
     }) {
       return NavigationState(
         currentRoute: currentRoute ?? this.currentRoute,
         params: params ?? this.params,
         history: history ?? this.history,
         isModal: isModal ?? this.isModal,
       );
     }
   }

   class RouteDefinition {
     final String path;
     final Widget Function(BuildContext, Map<String, dynamic>) builder;
     final List<RouteGuard> guards;
     final bool isModal;
     final Duration transitionDuration;
     final Curve transitionCurve;

     RouteDefinition({
       required this.path,
       required this.builder,
       this.guards = const [],
       this.isModal = false,
       this.transitionDuration = const Duration(milliseconds: 300),
       this.transitionCurve = Curves.easeInOut,
     });
   }

   abstract class RouteGuard {
     Future<bool> canActivate(
       BuildContext context,
       Map<String, dynamic> params,
     );
   }
   ```

3. **Create Navigation Service**

   ```dart
   class NavigationService {
     final GoRouter _router;
     final SharedPreferences _prefs;
     final List<RouteDefinition> _routes;
     final List<RouteObserver> _observers;

     NavigationService({
       required List<RouteDefinition> routes,
       required SharedPreferences prefs,
       List<RouteObserver>? observers,
     })  : _routes = routes,
           _prefs = prefs,
           _observers = observers ?? [] {
       _router = GoRouter(
         routes: _buildRoutes(),
         observers: _observers,
         initialLocation: _getInitialRoute(),
         redirect: _handleRedirect,
       );
     }

     GoRouter get router => _router;

     List<RouteBase> _buildRoutes() {
       return _routes.map((route) {
         return GoRoute(
           path: route.path,
           builder: (context, state) {
             final params = state.extra as Map<String, dynamic>? ?? {};
             return _buildRouteWithGuards(
               context,
               route,
               params,
             );
           },
         );
       }).toList();
     }

     Widget _buildRouteWithGuards(
       BuildContext context,
       RouteDefinition route,
       Map<String, dynamic> params,
     ) {
       return FutureBuilder<bool>(
         future: _checkGuards(context, route.guards, params),
         builder: (context, snapshot) {
           if (snapshot.connectionState == ConnectionState.waiting) {
             return CircularProgressIndicator();
           }

           if (snapshot.data == true) {
             return route.builder(context, params);
           }

           return _buildErrorScreen(context);
         },
       );
     }

     Future<bool> _checkGuards(
       BuildContext context,
       List<RouteGuard> guards,
       Map<String, dynamic> params,
     ) async {
       for (final guard in guards) {
         if (!await guard.canActivate(context, params)) {
           return false;
         }
       }
       return true;
     }

     Widget _buildErrorScreen(BuildContext context) {
       return Scaffold(
         body: Center(
           child: Text('Access Denied'),
         ),
       );
     }

     String _getInitialRoute() {
       return _prefs.getString('last_route') ?? '/';
     }

     Future<String?> _handleRedirect(
       BuildContext context,
       GoRouterState state,
     ) async {
       // Implement custom redirect logic
       return null;
     }

     void navigateTo(
       String route, {
       Map<String, dynamic>? params,
       bool replace = false,
     }) {
       if (replace) {
         _router.replace(route, extra: params);
       } else {
         _router.push(route, extra: params);
       }
       _saveRoute(route);
     }

     void goBack() {
       _router.pop();
     }

     void _saveRoute(String route) {
       _prefs.setString('last_route', route);
     }
   }
   ```

4. **Create Navigation Provider**

   ```dart
   class NavigationProvider extends ChangeNotifier {
     final NavigationService _navigationService;
     NavigationState _state;

     NavigationProvider({
       required NavigationService navigationService,
     })  : _navigationService = navigationService,
           _state = NavigationState(currentRoute: '/');

     NavigationState get state => _state;

     void navigateTo(
       String route, {
       Map<String, dynamic>? params,
       bool replace = false,
     }) {
       _navigationService.navigateTo(
         route,
         params: params,
         replace: replace,
       );
       _updateState(route, params);
     }

     void goBack() {
       _navigationService.goBack();
       _updateStateFromHistory();
     }

     void _updateState(String route, Map<String, dynamic>? params) {
       final history = List<String>.from(_state.history)..add(route);
       _state = _state.copyWith(
         currentRoute: route,
         params: params ?? {},
         history: history,
       );
       notifyListeners();
     }

     void _updateStateFromHistory() {
       if (_state.history.length > 1) {
         final history = List<String>.from(_state.history)..removeLast();
         final previousRoute = history.last;
         _state = _state.copyWith(
           currentRoute: previousRoute,
           history: history,
         );
         notifyListeners();
       }
     }
   }
   ```

5. **Create Navigation Widgets**

   ```dart
   class CustomNavigator extends StatelessWidget {
     final NavigationService navigationService;
     final Widget child;

     const CustomNavigator({
       required this.navigationService,
       required this.child,
     });

     @override
     Widget build(BuildContext context) {
       return Router(
         routerDelegate: navigationService.router.routerDelegate,
         routeInformationParser: navigationService.router.routeInformationParser,
         routeInformationProvider: navigationService.router.routeInformationProvider,
         backButtonDispatcher: RootBackButtonDispatcher(),
         child: child,
       );
     }
   }

   class NavigationObserver extends RouteObserver<PageRoute<dynamic>> {
     final Function(String) onRouteChanged;

     NavigationObserver({required this.onRouteChanged});

     @override
     void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
       super.didPush(route, previousRoute);
       if (route is PageRoute) {
         onRouteChanged(route.settings.name ?? '');
       }
     }

     @override
     void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
       super.didPop(route, previousRoute);
       if (previousRoute is PageRoute) {
         onRouteChanged(previousRoute.settings.name ?? '');
       }
     }

     @override
     void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
       super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
       if (newRoute is PageRoute) {
         onRouteChanged(newRoute.settings.name ?? '');
       }
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class NavigationDemoScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Custom Navigation Demo'),
         ),
         body: Center(
           child: Column(
             mainAxisAlignment: MainAxisAlignment.center,
             children: [
               ElevatedButton(
                 onPressed: () {
                   context.read<NavigationProvider>().navigateTo(
                         '/details',
                         params: {'id': '123'},
                       );
                 },
                 child: Text('Navigate to Details'),
               ),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: () {
                   context.read<NavigationProvider>().navigateTo(
                         '/settings',
                         replace: true,
                       );
                 },
                 child: Text('Replace with Settings'),
               ),
               SizedBox(height: 16),
               Consumer<NavigationProvider>(
                 builder: (context, provider, child) {
                   return Text(
                     'Current Route: ${provider.state.currentRoute}',
                     style: TextStyle(fontSize: 16),
                   );
                 },
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

## Best Practices

1. **Route Management**

   - Use route constants
   - Handle deep links
   - Implement guards
   - Manage state

2. **Transitions**

   - Use appropriate animations
   - Handle edge cases
   - Optimize performance
   - Consider gestures

3. **State Management**

   - Persist navigation state
   - Handle back stack
   - Manage parameters
   - Track history

4. **Testing**

   - Test navigation
   - Verify transitions
   - Check deep links
   - Test edge cases

## Conclusion

This tutorial has shown you how to implement a custom navigation system in Flutter with features like:

- Custom route management
- Animated transitions
- Deep linking
- Route guards

You can extend this implementation by adding:

- More transition types
- Complex routing
- Authentication flow
- Analytics tracking

Remember to:

- Handle edge cases
- Test thoroughly
- Consider performance
- Follow guidelines
- Keep code clean

This implementation provides a solid foundation for creating a flexible navigation system in Flutter.
