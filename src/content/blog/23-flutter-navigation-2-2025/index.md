---
title: "Flutter Navigation 2.0: Declarative Routing Explained"
summary: "Complete guide to Flutter's new navigation system, explaining declarative routing concepts and implementation strategies."
date: "2025, 04, 30"
draft: false
tags:
  - flutter
  - navigation-2.0
  - declarative-routing
  - router-delegate
  - navigation
---

## Flutter Navigation 2.0: Declarative Routing Explained

Flutter Navigation 2.0 introduces a more powerful and flexible way to handle navigation in Flutter applications. This guide will help you understand and implement declarative routing effectively.

## Basic Navigation 2.0 Setup

### Router Configuration

```dart
class MyApp extends StatelessWidget {
  final _router = GoRouter(
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => HomeScreen(),
      ),
      GoRoute(
        path: '/profile/:id',
        builder: (context, state) => ProfileScreen(
          id: state.params['id']!,
        ),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => SettingsScreen(),
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: _router,
      title: 'Navigation 2.0 Demo',
    );
  }
}
```

### Custom Router Delegate

```dart
class AppRouterDelegate extends RouterDelegate<PageConfiguration>
    with ChangeNotifier, PopNavigatorRouterDelegateMixin<PageConfiguration> {
  final GlobalKey<NavigatorState> _navigatorKey;
  final List<Page> _pages = [];
  final List<PageConfiguration> _pageConfigurations = [];

  AppRouterDelegate() : _navigatorKey = GlobalKey<NavigatorState>();

  @override
  GlobalKey<NavigatorState> get navigatorKey => _navigatorKey;

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      pages: _pages,
      onPopPage: (route, result) {
        if (!route.didPop(result)) {
          return false;
        }
        _pages.removeLast();
        _pageConfigurations.removeLast();
        notifyListeners();
        return true;
      },
    );
  }

  void pushPage(PageConfiguration configuration) {
    _pages.add(_createPage(configuration));
    _pageConfigurations.add(configuration);
    notifyListeners();
  }

  void replacePage(PageConfiguration configuration) {
    if (_pages.isNotEmpty) {
      _pages.removeLast();
      _pageConfigurations.removeLast();
    }
    _pages.add(_createPage(configuration));
    _pageConfigurations.add(configuration);
    notifyListeners();
  }

  Page _createPage(PageConfiguration configuration) {
    switch (configuration) {
      case HomePageConfiguration():
        return MaterialPage(
          key: ValueKey('Home'),
          child: HomeScreen(),
        );
      case ProfilePageConfiguration():
        return MaterialPage(
          key: ValueKey('Profile'),
          child: ProfileScreen(id: configuration.id),
        );
      case SettingsPageConfiguration():
        return MaterialPage(
          key: ValueKey('Settings'),
          child: SettingsScreen(),
        );
    }
  }
}
```

## Advanced Navigation Patterns

### Nested Navigation

```dart
class NestedRouter extends StatelessWidget {
  final _router = GoRouter(
    routes: [
      ShellRoute(
        builder: (context, state, child) {
          return ScaffoldWithBottomNavBar(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => HomeScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => ProfileScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => SettingsScreen(),
          ),
        ],
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: _router,
    );
  }
}
```

### Route Guards

```dart
class AuthGuard extends GoRouteGuard {
  final AuthService authService;

  AuthGuard(this.authService);

  @override
  Future<String?> redirect(BuildContext context, GoRouterState state) async {
    final isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated && state.matchedLocation != '/login') {
      return '/login';
    }
    return null;
  }
}

final _router = GoRouter(
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => LoginScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => ProfileScreen(),
      redirect: (context, state) {
        if (!authService.isAuthenticated()) {
          return '/login';
        }
        return null;
      },
    ),
  ],
);
```

## State Management Integration

### Provider Integration

```dart
class NavigationProvider extends ChangeNotifier {
  final _router = GoRouter(
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => HomeScreen(),
      ),
    ],
  );

  void navigateToProfile(String id) {
    _router.go('/profile/$id');
  }

  void navigateToSettings() {
    _router.go('/settings');
  }
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => NavigationProvider(),
      child: MaterialApp.router(
        routerConfig: _router,
      ),
    );
  }
}
```

### BLoC Integration

```dart
class NavigationBloc extends Bloc<NavigationEvent, NavigationState> {
  final _router = GoRouter(
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => HomeScreen(),
      ),
    ],
  );

  NavigationBloc() : super(NavigationInitial()) {
    on<NavigateToProfile>(_onNavigateToProfile);
    on<NavigateToSettings>(_onNavigateToSettings);
  }

  void _onNavigateToProfile(
    NavigateToProfile event,
    Emitter<NavigationState> emit,
  ) {
    _router.go('/profile/${event.id}');
  }

  void _onNavigateToSettings(
    NavigateToSettings event,
    Emitter<NavigationState> emit,
  ) {
    _router.go('/settings');
  }
}
```

## Error Handling

```dart
final _router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomeScreen(),
    ),
  ],
  errorBuilder: (context, state) => ErrorScreen(
    error: state.error,
  ),
  redirect: (context, state) {
    if (state.error != null) {
      return '/error';
    }
    return null;
  },
);
```

## Testing Navigation

```dart
void main() {
  testWidgets('Navigation test', (WidgetTester tester) async {
    await tester.pumpWidget(MyApp());

    expect(find.text('Home'), findsOneWidget);

    await tester.tap(find.text('Profile'));
    await tester.pumpAndSettle();

    expect(find.text('Profile Screen'), findsOneWidget);
  });
}
```

## Best Practices

1. Use declarative routing
2. Implement proper error handling
3. Use route guards for authentication
4. Keep navigation logic separate
5. Test navigation flows
6. Handle deep links properly
7. Document navigation structure

## Common Pitfalls

1. Not handling errors
2. Missing route guards
3. Poor state management
4. Complex navigation logic
5. Missing tests

## Conclusion

Implementing Navigation 2.0 requires:

- Understanding declarative routing
- Following best practices
- Proper error handling
- Thorough testing
- Clean architecture

Remember:

- Keep it simple
- Follow patterns
- Handle errors
- Test thoroughly
- Consider user experience

Happy Fluttering!
