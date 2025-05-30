---
title: "Custom State Management"
summary: "Build a scalable state management solution"
date: "2025, 04, 07"
tags:
  [
    "flutter",
    "state-management",
    "reactive",
    "immutable",
    "dependency-injection",
  ]
difficulty: "advanced"
draft: false
---

## Custom State Management

Creating a custom state management system in Flutter allows for better control over application state, improved performance, and easier testing. This tutorial will guide you through implementing a custom state management system with features like immutable state, reactive updates, and dependency injection.

## Features

- Immutable state
- Reactive updates
- Dependency injection
- State persistence
- Middleware support
- Action dispatching
- State selectors
- Dev tools
- Time travel
- Hot reload

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     freezed_annotation: ^2.4.1
     json_annotation: ^4.8.1
     get_it: ^7.6.4
     shared_preferences: ^2.2.2
     path_provider: ^2.1.2
   ```

2. **Create State Models**

   ```dart
   @freezed
   class AppState with _$AppState {
     const factory AppState({
       required UserState user,
       required SettingsState settings,
       required ThemeState theme,
       required NavigationState navigation,
     }) = _AppState;

     factory AppState.initial() => AppState(
           user: UserState.initial(),
           settings: SettingsState.initial(),
           theme: ThemeState.initial(),
           navigation: NavigationState.initial(),
         );
   }

   @freezed
   class UserState with _$UserState {
     const factory UserState({
       required bool isAuthenticated,
       required User? user,
       required List<String> permissions,
       required Map<String, dynamic> preferences,
     }) = _UserState;

     factory UserState.initial() => UserState(
           isAuthenticated: false,
           user: null,
           permissions: [],
           preferences: {},
         );
   }

   @freezed
   class SettingsState with _$SettingsState {
     const factory SettingsState({
       required bool isDarkMode,
       required String language,
       required Map<String, dynamic> appSettings,
     }) = _SettingsState;

     factory SettingsState.initial() => SettingsState(
           isDarkMode: false,
           language: 'en',
           appSettings: {},
         );
   }

   @freezed
   class ThemeState with _$ThemeState {
     const factory ThemeState({
       required ThemeMode mode,
       required Color primaryColor,
       required Color accentColor,
       required Map<String, dynamic> customTheme,
     }) = _ThemeState;

     factory ThemeState.initial() => ThemeState(
           mode: ThemeMode.system,
           primaryColor: Colors.blue,
           accentColor: Colors.orange,
           customTheme: {},
         );
   }
   ```

3. **Create Store**

   ```dart
   class Store {
     final GetIt _container;
     final List<Middleware> _middleware;
     final StatePersistence _persistence;
     AppState _state;
     final _stateController = StreamController<AppState>.broadcast();

     Store({
       required GetIt container,
       List<Middleware>? middleware,
       StatePersistence? persistence,
     })  : _container = container,
           _middleware = middleware ?? [],
           _persistence = persistence ?? NoOpPersistence(),
           _state = AppState.initial() {
       _loadState();
     }

     Stream<AppState> get stateStream => _stateController.stream;
     AppState get state => _state;

     Future<void> _loadState() async {
       final savedState = await _persistence.loadState();
       if (savedState != null) {
         _state = savedState;
         _stateController.add(_state);
       }
     }

     Future<void> dispatch(Action action) async {
       for (final middleware in _middleware) {
         final result = await middleware.handle(action, _state);
         if (result != null) {
           action = result;
         }
       }

       _state = _reduce(_state, action);
       _stateController.add(_state);
       await _persistence.saveState(_state);
     }

     AppState _reduce(AppState state, Action action) {
       return state.copyWith(
         user: _reduceUser(state.user, action),
         settings: _reduceSettings(state.settings, action),
         theme: _reduceTheme(state.theme, action),
         navigation: _reduceNavigation(state.navigation, action),
       );
     }

     UserState _reduceUser(UserState state, Action action) {
       if (action is UserAction) {
         return action.reduce(state);
       }
       return state;
     }

     SettingsState _reduceSettings(SettingsState state, Action action) {
       if (action is SettingsAction) {
         return action.reduce(state);
       }
       return state;
     }

     ThemeState _reduceTheme(ThemeState state, Action action) {
       if (action is ThemeAction) {
         return action.reduce(state);
       }
       return state;
     }

     NavigationState _reduceNavigation(NavigationState state, Action action) {
       if (action is NavigationAction) {
         return action.reduce(state);
       }
       return state;
     }

     T select<T>(Selector<AppState, T> selector) {
       return selector(_state);
     }

     void dispose() {
       _stateController.close();
     }
   }
   ```

4. **Create Actions**

   ```dart
   abstract class Action {}

   abstract class UserAction extends Action {
     UserState reduce(UserState state);
   }

   class LoginAction extends UserAction {
     final User user;
     final List<String> permissions;

     LoginAction({
       required this.user,
       required this.permissions,
     });

     @override
     UserState reduce(UserState state) {
       return state.copyWith(
         isAuthenticated: true,
         user: user,
         permissions: permissions,
       );
     }
   }

   class LogoutAction extends UserAction {
     @override
     UserState reduce(UserState state) {
       return UserState.initial();
     }
   }

   abstract class SettingsAction extends Action {
     SettingsState reduce(SettingsState state);
   }

   class UpdateSettingsAction extends SettingsAction {
     final Map<String, dynamic> settings;

     UpdateSettingsAction(this.settings);

     @override
     SettingsState reduce(SettingsState state) {
       return state.copyWith(
         appSettings: {...state.appSettings, ...settings},
       );
     }
   }

   abstract class ThemeAction extends Action {
     ThemeState reduce(ThemeState state);
   }

   class UpdateThemeAction extends ThemeAction {
     final ThemeMode mode;
     final Color? primaryColor;
     final Color? accentColor;

     UpdateThemeAction({
       required this.mode,
       this.primaryColor,
       this.accentColor,
     });

     @override
     ThemeState reduce(ThemeState state) {
       return state.copyWith(
         mode: mode,
         primaryColor: primaryColor ?? state.primaryColor,
         accentColor: accentColor ?? state.accentColor,
       );
     }
   }
   ```

5. **Create Middleware**

   ```dart
   abstract class Middleware {
     Future<Action?> handle(Action action, AppState state);
   }

   class LoggingMiddleware extends Middleware {
     @override
     Future<Action?> handle(Action action, AppState state) async {
       print('Action: ${action.runtimeType}');
       print('State before: $state');
       return null;
     }
   }

   class AnalyticsMiddleware extends Middleware {
     final AnalyticsService _analytics;

     AnalyticsMiddleware(this._analytics);

     @override
     Future<Action?> handle(Action action, AppState state) async {
       await _analytics.trackEvent(
         'action_dispatched',
         {
           'action_type': action.runtimeType.toString(),
           'state': state.toJson(),
         },
       );
       return null;
     }
   }

   class PersistenceMiddleware extends Middleware {
     final StatePersistence _persistence;

     PersistenceMiddleware(this._persistence);

     @override
     Future<Action?> handle(Action action, AppState state) async {
       await _persistence.saveState(state);
       return null;
     }
   }
   ```

6. **Create State Selectors**

   ```dart
   typedef Selector<S, T> = T Function(S state);

   class Selectors {
     static Selector<AppState, User?> currentUser = (state) => state.user.user;

     static Selector<AppState, bool> isAuthenticated = (state) =>
         state.user.isAuthenticated;

     static Selector<AppState, ThemeMode> themeMode = (state) =>
         state.theme.mode;

     static Selector<AppState, Map<String, dynamic>> userPreferences =
         (state) => state.user.preferences;

     static Selector<AppState, String> currentLanguage = (state) =>
         state.settings.language;
   }
   ```

7. **Create Main Screen**

   ```dart
   class StateManagementDemoScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('State Management Demo'),
         ),
         body: Center(
           child: Column(
             mainAxisAlignment: MainAxisAlignment.center,
             children: [
               Consumer<Store>(
                 builder: (context, store, child) {
                   final user = store.select(Selectors.currentUser);
                   final isAuthenticated =
                       store.select(Selectors.isAuthenticated);
                   final themeMode = store.select(Selectors.themeMode);

                   return Column(
                     children: [
                       Text(
                         'User: ${user?.name ?? 'Not logged in'}',
                         style: TextStyle(fontSize: 18),
                       ),
                       SizedBox(height: 16),
                       Text(
                         'Theme: ${themeMode.toString()}',
                         style: TextStyle(fontSize: 16),
                       ),
                       SizedBox(height: 32),
                       ElevatedButton(
                         onPressed: () {
                           if (isAuthenticated) {
                             store.dispatch(LogoutAction());
                           } else {
                             store.dispatch(
                               LoginAction(
                                 user: User(
                                   id: '1',
                                   name: 'John Doe',
                                   email: 'john@example.com',
                                 ),
                                 permissions: ['read', 'write'],
                               ),
                             );
                           }
                         },
                         child: Text(
                           isAuthenticated ? 'Logout' : 'Login',
                         ),
                       ),
                       SizedBox(height: 16),
                       ElevatedButton(
                         onPressed: () {
                           store.dispatch(
                             UpdateThemeAction(
                               mode: themeMode == ThemeMode.dark
                                   ? ThemeMode.light
                                   : ThemeMode.dark,
                             ),
                           );
                         },
                         child: Text('Toggle Theme'),
                       ),
                     ],
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

1. **State Management**

   - Use immutable state
   - Implement selectors
   - Handle side effects
   - Manage dependencies

2. **Performance**

   - Optimize updates
   - Use memoization
   - Handle large state
   - Profile changes

3. **Testing**

   - Test reducers
   - Test actions
   - Test middleware
   - Test selectors

4. **Development**

   - Add dev tools
   - Enable time travel
   - Support hot reload
   - Log actions

## Conclusion

This tutorial has shown you how to implement a custom state management system in Flutter with features like:

- Immutable state
- Reactive updates
- Dependency injection
- Middleware support

You can extend this implementation by adding:

- More middleware
- Complex selectors
- State persistence
- Dev tools

Remember to:

- Keep state minimal
- Test thoroughly
- Handle errors
- Follow patterns
- Document code

This implementation provides a solid foundation for creating a scalable state management system in Flutter.
