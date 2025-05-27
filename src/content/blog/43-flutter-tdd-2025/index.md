---
title: "Test-Driven Development (TDD) with Flutter"
summary: "Guide to implementing TDD methodology in Flutter development, including practical examples and workflow recommendations."
date: "2025, 08, 10"
draft: false
tags:
  - flutter
  - tdd
  - test-driven-development
  - testing-methodology
  - development-practices
---

## Test-Driven Development (TDD) with Flutter

This guide covers how to implement Test-Driven Development (TDD) in Flutter applications.

## TDD Workflow

### Red-Green-Refactor Cycle

```dart
// Step 1: Write failing test (Red)
void main() {
  group('TodoList', () {
    test('adds new todo item', () {
      final todoList = TodoList();
      todoList.add('Buy groceries');
      expect(todoList.items.length, equals(1));
      expect(todoList.items.first.title, equals('Buy groceries'));
    });
  });
}

// Step 2: Write minimal implementation (Green)
class TodoList {
  final List<TodoItem> items = [];

  void add(String title) {
    items.add(TodoItem(title: title));
  }
}

// Step 3: Refactor implementation
class TodoList {
  final List<TodoItem> _items = [];

  List<TodoItem> get items => List.unmodifiable(_items);

  void add(String title) {
    if (title.isEmpty) {
      throw ArgumentError('Title cannot be empty');
    }
    _items.add(TodoItem(title: title));
  }
}
```

### Feature Development Example

```dart
// Step 1: Write failing test
void main() {
  group('TodoItem', () {
    test('marks item as complete', () {
      final item = TodoItem(title: 'Test');
      expect(item.isComplete, isFalse);

      item.toggleComplete();
      expect(item.isComplete, isTrue);
    });

    test('updates completion timestamp', () {
      final item = TodoItem(title: 'Test');
      expect(item.completedAt, isNull);

      item.toggleComplete();
      expect(item.completedAt, isNotNull);
    });
  });
}

// Step 2: Implement feature
class TodoItem {
  final String title;
  bool _isComplete = false;
  DateTime? _completedAt;

  TodoItem({required this.title});

  bool get isComplete => _isComplete;
  DateTime? get completedAt => _completedAt;

  void toggleComplete() {
    _isComplete = !_isComplete;
    _completedAt = _isComplete ? DateTime.now() : null;
  }
}
```

## TDD Patterns

### Behavior-Driven Development (BDD)

```dart
void main() {
  group('Shopping Cart', () {
    late ShoppingCart cart;

    setUp(() {
      cart = ShoppingCart();
    });

    test('should add item to cart', () {
      // Given
      final item = Product(id: '1', name: 'Test Product', price: 10.0);

      // When
      cart.addItem(item);

      // Then
      expect(cart.items.length, equals(1));
      expect(cart.items.first.name, equals('Test Product'));
    });

    test('should calculate total price', () {
      // Given
      cart.addItem(Product(id: '1', name: 'Item 1', price: 10.0));
      cart.addItem(Product(id: '2', name: 'Item 2', price: 20.0));

      // When
      final total = cart.totalPrice;

      // Then
      expect(total, equals(30.0));
    });
  });
}
```

### Test Doubles

```dart
// Step 1: Define interface
abstract class PaymentGateway {
  Future<bool> processPayment(double amount);
}

// Step 2: Write test with mock
void main() {
  group('PaymentService', () {
    late PaymentService paymentService;
    late MockPaymentGateway mockGateway;

    setUp(() {
      mockGateway = MockPaymentGateway();
      paymentService = PaymentService(mockGateway);
    });

    test('processes payment successfully', () async {
      // Given
      when(mockGateway.processPayment(any)).thenAnswer((_) async => true);

      // When
      final result = await paymentService.pay(100.0);

      // Then
      expect(result, isTrue);
      verify(mockGateway.processPayment(100.0)).called(1);
    });
  });
}
```

## TDD Best Practices

### Test Organization

```dart
// test/unit/services/payment_service_test.dart
void main() {
  group('PaymentService', () {
    group('processPayment', () {
      test('successful payment', () async {
        // Test implementation
      });

      test('failed payment', () async {
        // Test implementation
      });

      test('invalid amount', () async {
        // Test implementation
      });
    });

    group('refund', () {
      test('successful refund', () async {
        // Test implementation
      });

      test('failed refund', () async {
        // Test implementation
      });
    });
  });
}
```

### Test Data Builders

```dart
class TestDataBuilder {
  static User createUser({
    String id = '1',
    String name = 'Test User',
    String email = 'test@example.com',
  }) {
    return User(
      id: id,
      name: name,
      email: email,
    );
  }

  static Product createProduct({
    String id = '1',
    String name = 'Test Product',
    double price = 10.0,
  }) {
    return Product(
      id: id,
      name: name,
      price: price,
    );
  }
}
```

## Best Practices

1. Write tests first
2. Follow red-green-refactor
3. Keep tests focused
4. Use meaningful names
5. Test behavior, not implementation
6. Refactor regularly
7. Maintain test coverage

## Common Pitfalls

1. Testing implementation details
2. Writing tests after code
3. Over-complicated tests
4. Missing edge cases
5. No refactoring

## Conclusion

Implementing TDD requires:

- Understanding TDD workflow
- Following best practices
- Writing tests first
- Regular refactoring
- Continuous improvement

Remember:

- Test first
- Keep it simple
- Refactor often
- Test behavior
- Maintain quality

Happy TDD!
