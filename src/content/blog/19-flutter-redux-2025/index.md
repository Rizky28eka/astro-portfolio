---
title: "Redux for Flutter: When and How to Use It"
summary: "Guide to implementing Redux pattern in Flutter applications, including when it's beneficial and how to structure your app architecture."
date: "2025, 04, 10"
draft: false
tags:
  - flutter
  - redux
  - state-management
  - predictable-state
  - architecture
---

## Redux for Flutter: When and How to Use It

Redux is a predictable state management pattern that can help manage complex application states in Flutter. This guide will show you how to implement Redux effectively.

## Basic Redux Structure

### Store Setup

```dart
// State
class AppState {
  final int counter;
  final bool isLoading;
  final String? error;

  AppState({
    this.counter = 0,
    this.isLoading = false,
    this.error,
  });

  AppState copyWith({
    int? counter,
    bool? isLoading,
    String? error,
  }) {
    return AppState(
      counter: counter ?? this.counter,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Actions
abstract class AppAction {}

class IncrementAction extends AppAction {}
class DecrementAction extends AppAction {}
class SetLoadingAction extends AppAction {
  final bool isLoading;
  SetLoadingAction(this.isLoading);
}
class SetErrorAction extends AppAction {
  final String? error;
  SetErrorAction(this.error);
}

// Reducer
AppState appReducer(AppState state, dynamic action) {
  if (action is IncrementAction) {
    return state.copyWith(counter: state.counter + 1);
  }
  if (action is DecrementAction) {
    return state.copyWith(counter: state.counter - 1);
  }
  if (action is SetLoadingAction) {
    return state.copyWith(isLoading: action.isLoading);
  }
  if (action is SetErrorAction) {
    return state.copyWith(error: action.error);
  }
  return state;
}

// Store
final store = Store<AppState>(
  appReducer,
  initialState: AppState(),
);
```

### Using Redux

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StoreProvider(
      store: store,
      child: MaterialApp(
        home: CounterScreen(),
      ),
    );
  }
}

class CounterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StoreConnector<AppState, int>(
      converter: (store) => store.state.counter,
      builder: (context, count) {
        return Scaffold(
          appBar: AppBar(title: Text('Counter')),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Count: $count',
                  style: Theme.of(context).textTheme.headline4,
                ),
                ElevatedButton(
                  onPressed: () {
                    StoreProvider.of<AppState>(context)
                        .dispatch(IncrementAction());
                  },
                  child: Text('Increment'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
```

## Advanced Redux Patterns

### Middleware

```dart
// Logger Middleware
void loggingMiddleware(
  Store<AppState> store,
  dynamic action,
  NextDispatcher next,
) {
  print('Action: $action');
  next(action);
  print('New State: ${store.state}');
}

// API Middleware
void apiMiddleware(
  Store<AppState> store,
  dynamic action,
  NextDispatcher next,
) {
  if (action is FetchDataAction) {
    store.dispatch(SetLoadingAction(true));
    api.getData().then(
      (data) {
        store.dispatch(SetDataAction(data));
        store.dispatch(SetLoadingAction(false));
      },
    ).catchError((error) {
      store.dispatch(SetErrorAction(error.toString()));
      store.dispatch(SetLoadingAction(false));
    });
  }
  next(action);
}

// Store with Middleware
final store = Store<AppState>(
  appReducer,
  initialState: AppState(),
  middleware: [
    loggingMiddleware,
    apiMiddleware,
  ],
);
```

### Selectors

```dart
// Selectors
int selectCounter(AppState state) => state.counter;
bool selectIsLoading(AppState state) => state.isLoading;
String? selectError(AppState state) => state.error;

// Using Selectors
class CounterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StoreConnector<AppState, int>(
      converter: selectCounter,
      builder: (context, count) {
        return Text('Count: $count');
      },
    );
  }
}
```

## Real-World Examples

### Authentication

```dart
// State
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Actions
abstract class AuthAction {}

class LoginRequested extends AuthAction {
  final String email;
  final String password;
  LoginRequested(this.email, this.password);
}

class LoginSucceeded extends AuthAction {
  final User user;
  LoginSucceeded(this.user);
}

class LoginFailed extends AuthAction {
  final String error;
  LoginFailed(this.error);
}

// Reducer
AuthState authReducer(AuthState state, dynamic action) {
  if (action is LoginRequested) {
    return state.copyWith(isLoading: true, error: null);
  }
  if (action is LoginSucceeded) {
    return state.copyWith(
      user: action.user,
      isLoading: false,
      error: null,
    );
  }
  if (action is LoginFailed) {
    return state.copyWith(
      isLoading: false,
      error: action.error,
    );
  }
  return state;
}

// Middleware
void authMiddleware(
  Store<AuthState> store,
  dynamic action,
  NextDispatcher next,
) {
  if (action is LoginRequested) {
    authRepository
        .login(action.email, action.password)
        .then((user) {
      store.dispatch(LoginSucceeded(user));
    }).catchError((error) {
      store.dispatch(LoginFailed(error.toString()));
    });
  }
  next(action);
}
```

### Shopping Cart

```dart
// State
class CartState {
  final Map<String, CartItem> items;
  final bool isLoading;
  final String? error;

  CartState({
    this.items = const {},
    this.isLoading = false,
    this.error,
  });

  double get total => items.values.fold(
        0,
        (sum, item) => sum + (item.price * item.quantity),
      );

  CartState copyWith({
    Map<String, CartItem>? items,
    bool? isLoading,
    String? error,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Actions
abstract class CartAction {}

class AddToCart extends CartAction {
  final Product product;
  final int quantity;
  AddToCart(this.product, this.quantity);
}

class RemoveFromCart extends CartAction {
  final String productId;
  RemoveFromCart(this.productId);
}

// Reducer
CartState cartReducer(CartState state, dynamic action) {
  if (action is AddToCart) {
    final updatedItems = Map<String, CartItem>.from(state.items);
    if (updatedItems.containsKey(action.product.id)) {
      updatedItems[action.product.id]!.quantity += action.quantity;
    } else {
      updatedItems[action.product.id] = CartItem(
        id: action.product.id,
        name: action.product.name,
        price: action.product.price,
        quantity: action.quantity,
      );
    }
    return state.copyWith(items: updatedItems);
  }
  if (action is RemoveFromCart) {
    final updatedItems = Map<String, CartItem>.from(state.items);
    updatedItems.remove(action.productId);
    return state.copyWith(items: updatedItems);
  }
  return state;
}
```

## Testing Redux

### Reducer Tests

```dart
void main() {
  group('AppReducer', () {
    test('should handle IncrementAction', () {
      final initialState = AppState(counter: 0);
      final action = IncrementAction();
      final nextState = appReducer(initialState, action);
      expect(nextState.counter, equals(1));
    });

    test('should handle DecrementAction', () {
      final initialState = AppState(counter: 1);
      final action = DecrementAction();
      final nextState = appReducer(initialState, action);
      expect(nextState.counter, equals(0));
    });
  });
}
```

### Store Tests

```dart
void main() {
  testWidgets('Counter test', (WidgetTester tester) async {
    final store = Store<AppState>(
      appReducer,
      initialState: AppState(),
    );

    await tester.pumpWidget(
      StoreProvider(
        store: store,
        child: MaterialApp(home: CounterScreen()),
      ),
    );

    expect(find.text('Count: 0'), findsOneWidget);

    store.dispatch(IncrementAction());
    await tester.pump();

    expect(find.text('Count: 1'), findsOneWidget);
  });
}
```

## Best Practices

1. Keep actions simple
2. Use immutable state
3. Implement proper middleware
4. Use selectors
5. Test thoroughly
6. Follow unidirectional data flow
7. Keep reducers pure

## Common Pitfalls

1. Over-complicated actions
2. Mutable state
3. Missing middleware
4. Poor error handling
5. Unnecessary re-renders

## When to Use Redux

1. Complex application state
2. Predictable state updates
3. Centralized state management
4. Time-travel debugging
5. Large team collaboration

## Conclusion

Implementing Redux requires:

- Understanding the pattern
- Following best practices
- Proper state management
- Thorough testing
- Clean architecture

Remember:

- Keep it simple
- Follow patterns
- Handle errors
- Test thoroughly
- Consider performance

Happy Fluttering!
