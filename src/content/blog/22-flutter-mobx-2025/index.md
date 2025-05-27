---
title: "MobX in Flutter: A Complete Guide to Reactive State Management"
summary: "Learn how to implement MobX for reactive state management in Flutter applications, with practical examples and best practices."
date: "2025, 04, 25"
draft: false
tags:
  - flutter
  - mobx
  - state-management
  - reactive-programming
  - architecture
---

## MobX in Flutter: A Complete Guide to Reactive State Management

MobX is a powerful state management library that makes state management simple and scalable by transparently applying functional reactive programming. This guide will show you how to use MobX effectively in your Flutter applications.

## Basic MobX Setup

### Counter Example

```dart
// Store
class CounterStore = _CounterStore with _$CounterStore;

abstract class _CounterStore with Store {
  @observable
  int count = 0;

  @action
  void increment() {
    count++;
  }

  @action
  void decrement() {
    count--;
  }
}

// View
class CounterScreen extends StatelessWidget {
  final CounterStore store = CounterStore();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('MobX Counter')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Observer(
              builder: (_) => Text(
                'Count: ${store.count}',
                style: Theme.of(context).textTheme.headline4,
              ),
            ),
            ElevatedButton(
              onPressed: store.increment,
              child: Text('Increment'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## State Management

### Observable State

```dart
class UserStore = _UserStore with _$UserStore;

abstract class _UserStore with Store {
  @observable
  String name = '';

  @observable
  int age = 0;

  @observable
  bool isLoggedIn = false;

  @action
  void updateName(String newName) {
    name = newName;
  }

  @action
  void updateAge(int newAge) {
    age = newAge;
  }

  @action
  void toggleLogin() {
    isLoggedIn = !isLoggedIn;
  }
}

class ProfileScreen extends StatelessWidget {
  final UserStore store = UserStore();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Observer(() => Text('Name: ${store.name}')),
          Observer(() => Text('Age: ${store.age}')),
          Observer(() => Text(
            'Status: ${store.isLoggedIn ? "Logged In" : "Logged Out"}',
          )),
          ElevatedButton(
            onPressed: () => store.updateName('John Doe'),
            child: Text('Update Name'),
          ),
        ],
      ),
    );
  }
}
```

### Computed Values

```dart
class TodoStore = _TodoStore with _$TodoStore;

abstract class _TodoStore with Store {
  @observable
  List<String> todos = [];

  @observable
  bool isLoading = false;

  @computed
  int get totalTodos => todos.length;

  @computed
  bool get hasTodos => todos.isNotEmpty;

  @action
  void addTodo(String todo) {
    todos.add(todo);
  }

  @action
  void removeTodo(int index) {
    todos.removeAt(index);
  }

  @action
  Future<void> loadTodos() async {
    isLoading = true;
    try {
      final result = await todoService.getTodos();
      todos = result;
    } finally {
      isLoading = false;
    }
  }
}

class TodoScreen extends StatelessWidget {
  final TodoStore store = TodoStore();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Todos')),
      body: Observer(() {
        if (store.isLoading) {
          return Center(child: CircularProgressIndicator());
        }
        return Column(
          children: [
            Observer(() => Text('Total Todos: ${store.totalTodos}')),
            Expanded(
              child: ListView.builder(
                itemCount: store.todos.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(store.todos[index]),
                    trailing: IconButton(
                      icon: Icon(Icons.delete),
                      onPressed: () => store.removeTodo(index),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: Text('Add Todo'),
              content: TextField(
                onSubmitted: (value) {
                  store.addTodo(value);
                  Navigator.pop(context);
                },
              ),
            ),
          );
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
```

## Advanced Patterns

### Form Management

```dart
class LoginStore = _LoginStore with _$LoginStore;

abstract class _LoginStore with Store {
  @observable
  String email = '';

  @observable
  String password = '';

  @observable
  bool isLoading = false;

  @observable
  String? error;

  @computed
  bool get isValid => email.isNotEmpty && password.isNotEmpty;

  @action
  void updateEmail(String value) {
    email = value;
  }

  @action
  void updatePassword(String value) {
    password = value;
  }

  @action
  Future<void> login() async {
    if (!isValid) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = null;

    try {
      await authService.login(email, password);
      // Navigate to home screen
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
    }
  }
}

class LoginScreen extends StatelessWidget {
  final LoginStore store = LoginStore();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              onChanged: store.updateEmail,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            TextField(
              onChanged: store.updatePassword,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            Observer(() {
              if (store.error != null) {
                return Text(
                  store.error!,
                  style: TextStyle(color: Colors.red),
                );
              }
              return SizedBox.shrink();
            }),
            Observer(() => ElevatedButton(
              onPressed: store.isLoading ? null : store.login,
              child: store.isLoading
                  ? CircularProgressIndicator()
                  : Text('Login'),
            )),
          ],
        ),
      ),
    );
  }
}
```

### List Management

```dart
class ProductStore = _ProductStore with _$ProductStore;

abstract class _ProductStore with Store {
  @observable
  List<Product> products = [];

  @observable
  List<Product> cart = [];

  @observable
  bool isLoading = false;

  @computed
  double get total => cart.fold(
        0,
        (sum, product) => sum + product.price,
      );

  @action
  Future<void> loadProducts() async {
    isLoading = true;
    try {
      products = await productService.getProducts();
    } finally {
      isLoading = false;
    }
  }

  @action
  void addToCart(Product product) {
    cart.add(product);
  }

  @action
  void removeFromCart(Product product) {
    cart.remove(product);
  }
}

class ProductScreen extends StatelessWidget {
  final ProductStore store = ProductStore();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Products'),
        actions: [
          IconButton(
            icon: Icon(Icons.shopping_cart),
            onPressed: () {
              // Navigate to cart screen
            },
          ),
        ],
      ),
      body: Observer(() {
        if (store.isLoading) {
          return Center(child: CircularProgressIndicator());
        }
        return ListView.builder(
          itemCount: store.products.length,
          itemBuilder: (context, index) {
            final product = store.products[index];
            return ListTile(
              title: Text(product.name),
              subtitle: Text('\$${product.price}'),
              trailing: IconButton(
                icon: Icon(Icons.add_shopping_cart),
                onPressed: () => store.addToCart(product),
              ),
            );
          },
        );
      }),
    );
  }
}
```

## Testing MobX

### Store Tests

```dart
void main() {
  group('CounterStore', () {
    late CounterStore store;

    setUp(() {
      store = CounterStore();
    });

    test('initial count is 0', () {
      expect(store.count, equals(0));
    });

    test('increment increases count by 1', () {
      store.increment();
      expect(store.count, equals(1));
    });

    test('decrement decreases count by 1', () {
      store.decrement();
      expect(store.count, equals(-1));
    });
  });
}
```

### Widget Tests

```dart
void main() {
  testWidgets('Counter screen test', (WidgetTester tester) async {
    final store = CounterStore();
    await tester.pumpWidget(
      MaterialApp(
        home: CounterScreen(store: store),
      ),
    );

    expect(find.text('Count: 0'), findsOneWidget);

    store.increment();
    await tester.pump();

    expect(find.text('Count: 1'), findsOneWidget);
  });
}
```

## Best Practices

1. Use observables for state
2. Use actions for state modifications
3. Use computed values for derived state
4. Keep stores focused
5. Implement proper error handling
6. Test thoroughly
7. Document code

## Common Pitfalls

1. Not using actions
2. Overusing observables
3. Missing error handling
4. Poor state organization
5. Unnecessary rebuilds

## Conclusion

Using MobX effectively requires:

- Understanding reactive programming
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
