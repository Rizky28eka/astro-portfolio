---
title: "Implementing Deep Linking in Flutter Applications"
summary: "Step-by-step tutorial on setting up deep linking for Flutter apps, including URL handling and navigation flow management."
date: "2025, 05, 05"
draft: false
tags:
  - flutter
  - deep-linking
  - url-handling
  - navigation
  - app-linking
---

## Implementing Deep Linking in Flutter Applications

Deep linking allows users to navigate directly to specific content within your Flutter application. This guide will show you how to implement deep linking effectively.

## Basic Deep Link Setup

### Android Configuration

```xml
<!-- AndroidManifest.xml -->
<manifest>
    <application>
        <activity>
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="yourapp.com"
                    android:pathPrefix="/" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### iOS Configuration

```xml
<!-- Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>yourapp</string>
        </array>
        <key>CFBundleURLName</key>
        <string>com.yourapp</string>
    </dict>
</array>
```

## URL Handling

### Basic URL Handler

```dart
class DeepLinkHandler {
  static void handleIncomingLinks() {
    // Handle incoming links when app is in background
    FirebaseDynamicLinks.instance.onLink.listen((dynamicLinkData) {
      _handleDeepLink(dynamicLinkData);
    }).onError((error) {
      print('Error handling dynamic links: $error');
    });

    // Handle incoming links when app is terminated
    FirebaseDynamicLinks.instance.getInitialLink().then((dynamicLinkData) {
      if (dynamicLinkData != null) {
        _handleDeepLink(dynamicLinkData);
      }
    });
  }

  static void _handleDeepLink(PendingDynamicLinkData data) {
    final Uri deepLink = data.link;
    if (deepLink != null) {
      // Handle the deep link
      _navigateToScreen(deepLink);
    }
  }

  static void _navigateToScreen(Uri uri) {
    // Parse the URI and navigate accordingly
    final path = uri.path;
    final params = uri.queryParameters;

    switch (path) {
      case '/product':
        final productId = params['id'];
        if (productId != null) {
          navigatorKey.currentState?.pushNamed(
            '/product',
            arguments: productId,
          );
        }
        break;
      case '/profile':
        final userId = params['id'];
        if (userId != null) {
          navigatorKey.currentState?.pushNamed(
            '/profile',
            arguments: userId,
          );
        }
        break;
    }
  }
}
```

### Dynamic Links

```dart
class DynamicLinkService {
  static Future<String> createDynamicLink({
    required String path,
    required Map<String, String> parameters,
  }) async {
    final dynamicLinkParams = DynamicLinkParameters(
      uriPrefix: 'https://yourapp.page.link',
      link: Uri.parse('https://yourapp.com$path?${Uri(queryParameters: parameters).query}'),
      androidParameters: AndroidParameters(
        packageName: 'com.yourapp',
        minimumVersion: 1,
      ),
      iosParameters: IOSParameters(
        bundleId: 'com.yourapp',
        minimumVersion: '1.0.0',
      ),
    );

    final dynamicLink = await FirebaseDynamicLinks.instance.buildShortLink(
      dynamicLinkParams,
    );

    return dynamicLink.shortUrl.toString();
  }
}
```

## Navigation Integration

### GoRouter Integration

```dart
final _router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomeScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (context, state) => ProductScreen(
        id: state.params['id']!,
      ),
    ),
    GoRoute(
      path: '/profile/:id',
      builder: (context, state) => ProfileScreen(
        id: state.params['id']!,
      ),
    ),
  ],
  redirect: (context, state) {
    // Handle deep link redirects
    if (state.uri.queryParameters.containsKey('deep_link')) {
      final deepLink = state.uri.queryParameters['deep_link'];
      return deepLink;
    }
    return null;
  },
);
```

### URL Strategy

```dart
void main() {
  // Use path URL strategy for web
  setUrlStrategy(PathUrlStrategy());

  runApp(MyApp());
}
```

## Testing Deep Links

### Unit Tests

```dart
void main() {
  group('DeepLinkHandler', () {
    test('should parse product deep link correctly', () {
      final uri = Uri.parse('https://yourapp.com/product?id=123');
      final result = DeepLinkHandler.parseDeepLink(uri);
      expect(result.path, equals('/product'));
      expect(result.parameters['id'], equals('123'));
    });

    test('should parse profile deep link correctly', () {
      final uri = Uri.parse('https://yourapp.com/profile?id=456');
      final result = DeepLinkHandler.parseDeepLink(uri);
      expect(result.path, equals('/profile'));
      expect(result.parameters['id'], equals('456'));
    });
  });
}
```

### Integration Tests

```dart
void main() {
  integrationTestWidgets('Deep link navigation test',
      (WidgetTester tester) async {
    await tester.pumpWidget(MyApp());

    // Simulate deep link
    await tester.pumpWidget(
      MaterialApp(
        home: DeepLinkHandler.handleDeepLink(
          Uri.parse('https://yourapp.com/product?id=123'),
        ),
      ),
    );

    expect(find.text('Product 123'), findsOneWidget);
  });
}
```

## Best Practices

1. Handle all possible deep link scenarios
2. Implement proper error handling
3. Test deep links thoroughly
4. Use URL parameters effectively
5. Maintain clean URL structure
6. Document deep link patterns
7. Monitor deep link analytics

## Common Pitfalls

1. Missing platform configurations
2. Poor error handling
3. Incomplete testing
4. Complex URL structures
5. Missing analytics

## Conclusion

Implementing deep linking requires:

- Understanding platform configurations
- Following best practices
- Proper error handling
- Thorough testing
- Clean URL structure

Remember:

- Keep URLs simple
- Handle all scenarios
- Test thoroughly
- Monitor analytics
- Document patterns

Happy Fluttering!
