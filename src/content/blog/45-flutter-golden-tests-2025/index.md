---
title: "Golden Tests in Flutter: Visual Regression Testing"
summary: "Guide to implementing golden tests for visual regression testing, ensuring UI consistency across different builds and platforms."
date: "2025, 08, 20"
draft: false
tags:
  - flutter
  - golden-tests
  - visual-testing
  - regression-testing
  - ui-testing
---

## Golden Tests in Flutter: Visual Regression Testing

This guide covers how to implement golden tests for visual regression testing in Flutter applications.

## Basic Golden Tests

### Simple Widget Test

```dart
// button_test.dart
void main() {
  testWidgets('CustomButton matches golden file', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CustomButton(
          text: 'Click Me',
          onPressed: () {},
        ),
      ),
    );

    await expectLater(
      find.byType(CustomButton),
      matchesGoldenFile('custom_button.png'),
    );
  });
}
```

### Multiple States

```dart
void main() {
  testWidgets('Button states match golden files', (WidgetTester tester) async {
    // Normal state
    await tester.pumpWidget(
      MaterialApp(
        home: CustomButton(
          text: 'Normal',
          onPressed: () {},
        ),
      ),
    );
    await expectLater(
      find.byType(CustomButton),
      matchesGoldenFile('button_normal.png'),
    );

    // Pressed state
    await tester.press(find.byType(CustomButton));
    await tester.pump();
    await expectLater(
      find.byType(CustomButton),
      matchesGoldenFile('button_pressed.png'),
    );

    // Disabled state
    await tester.pumpWidget(
      MaterialApp(
        home: CustomButton(
          text: 'Disabled',
          onPressed: null,
        ),
      ),
    );
    await expectLater(
      find.byType(CustomButton),
      matchesGoldenFile('button_disabled.png'),
    );
  });
}
```

## Complex UI Testing

### Responsive Layouts

```dart
void main() {
  testWidgets('Responsive layout matches golden files',
      (WidgetTester tester) async {
    // Mobile layout
    await tester.binding.setSurfaceSize(const Size(375, 812));
    await tester.pumpWidget(
      MaterialApp(
        home: ResponsiveLayout(),
      ),
    );
    await expectLater(
      find.byType(ResponsiveLayout),
      matchesGoldenFile('layout_mobile.png'),
    );

    // Tablet layout
    await tester.binding.setSurfaceSize(const Size(768, 1024));
    await tester.pumpWidget(
      MaterialApp(
        home: ResponsiveLayout(),
      ),
    );
    await expectLater(
      find.byType(ResponsiveLayout),
      matchesGoldenFile('layout_tablet.png'),
    );

    // Desktop layout
    await tester.binding.setSurfaceSize(const Size(1440, 900));
    await tester.pumpWidget(
      MaterialApp(
        home: ResponsiveLayout(),
      ),
    );
    await expectLater(
      find.byType(ResponsiveLayout),
      matchesGoldenFile('layout_desktop.png'),
    );
  });
}
```

### Theme Testing

```dart
void main() {
  testWidgets('Theme variations match golden files',
      (WidgetTester tester) async {
    // Light theme
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData.light(),
        home: ThemedWidget(),
      ),
    );
    await expectLater(
      find.byType(ThemedWidget),
      matchesGoldenFile('themed_widget_light.png'),
    );

    // Dark theme
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData.dark(),
        home: ThemedWidget(),
      ),
    );
    await expectLater(
      find.byType(ThemedWidget),
      matchesGoldenFile('themed_widget_dark.png'),
    );
  });
}
```

## Golden Test Utilities

### Custom Matcher

```dart
class CustomGoldenMatcher extends GoldenMatcher {
  final String fileName;
  final double tolerance;

  CustomGoldenMatcher(this.fileName, {this.tolerance = 0.0});

  @override
  Future<bool> matches(dynamic item) async {
    final bytes = await item.toImage().then((image) => image.toByteData());
    final goldenBytes = await loadGoldenFile(fileName);

    return compareImages(bytes, goldenBytes, tolerance);
  }

  @override
  Description describe(Description description) {
    return description.add('matches golden file "$fileName"');
  }
}
```

### Test Helper

```dart
class GoldenTestHelper {
  static Future<void> pumpAndMatch(
    WidgetTester tester,
    Widget widget,
    String goldenFile, {
    Duration? duration,
    Size? surfaceSize,
  }) async {
    if (surfaceSize != null) {
      await tester.binding.setSurfaceSize(surfaceSize);
    }

    await tester.pumpWidget(widget);
    if (duration != null) {
      await tester.pump(duration);
    }

    await expectLater(
      find.byType(widget.runtimeType),
      matchesGoldenFile(goldenFile),
    );
  }
}
```

## Best Practices

1. Use meaningful file names
2. Test different states
3. Test responsive layouts
4. Test theme variations
5. Keep tests focused
6. Update golden files carefully
7. Document test cases

## Common Pitfalls

1. Flaky tests
2. Missing states
3. Platform differences
4. No error handling
5. Poor organization

## Conclusion

Implementing golden tests requires:

- Understanding visual testing
- Following best practices
- Proper test organization
- Regular maintenance
- Careful updates

Remember:

- Test thoroughly
- Keep organized
- Handle errors
- Document well
- Update carefully

Happy Testing!
