---
title: "Push Notifications in Flutter: A Complete Guide"
summary: "Comprehensive guide on implementing push notifications in Flutter applications, including Firebase Cloud Messaging and local notifications."
date: "2025, 06, 25"
draft: false
tags:
  - flutter
  - push-notifications
  - firebase
  - fcm
  - mobile
---

## Push Notifications in Flutter: A Complete Guide

This guide covers how to implement push notifications in Flutter applications, from basic setup to advanced features.

## Basic Setup

### Dependencies

```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^2.0.0
  firebase_messaging: ^14.0.0
  flutter_local_notifications: ^15.0.0
```

### Firebase Configuration

```dart
class FirebaseConfig {
  static Future<void> initialize() async {
    await Firebase.initializeApp();

    // Request permission
    final messaging = FirebaseMessaging.instance;
    final settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
    }

    // Get FCM token
    final token = await messaging.getToken();
    print('FCM Token: $token');
  }
}
```

## Notification Handling

### FCM Service

```dart
class FCMService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification taps
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
  }

  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('Got a message in foreground!');
    print('Message data: ${message.data}');

    if (message.notification != null) {
      print('Message also contained a notification: ${message.notification}');
      await _showLocalNotification(message);
    }
  }

  Future<void> _handleNotificationTap(RemoteMessage message) async {
    print('Message tapped: ${message.data}');
    // Navigate to appropriate screen
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    final android = message.notification?.android;

    if (notification != null && android != null) {
      await flutterLocalNotificationsPlugin.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            channel.id,
            channel.name,
            channelDescription: channel.description,
            icon: android.smallIcon,
          ),
        ),
      );
    }
  }
}
```

## Local Notifications

### Notification Channel

```dart
class NotificationChannel {
  static const String id = 'high_importance_channel';
  static const String name = 'High Importance Notifications';
  static const String description = 'This channel is used for important notifications.';

  static AndroidNotificationChannel get channel => const AndroidNotificationChannel(
    id,
    name,
    description: description,
    importance: Importance.high,
  );
}
```

### Local Notification Service

```dart
class LocalNotificationService {
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );
  }

  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      NotificationChannel.id,
      NotificationChannel.name,
      channelDescription: NotificationChannel.description,
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      DateTime.now().millisecond,
      title,
      body,
      details,
      payload: payload,
    );
  }

  void _onNotificationTap(NotificationResponse response) {
    print('Notification tapped: ${response.payload}');
    // Handle notification tap
  }
}
```

## Notification Categories

### Category Manager

```dart
class NotificationCategory {
  final String id;
  final String title;
  final String description;
  final Importance importance;

  const NotificationCategory({
    required this.id,
    required this.title,
    required this.description,
    this.importance = Importance.high,
  });
}

class NotificationCategoryManager {
  final List<NotificationCategory> categories = [
    NotificationCategory(
      id: 'messages',
      title: 'Messages',
      description: 'Notifications for new messages',
    ),
    NotificationCategory(
      id: 'updates',
      title: 'Updates',
      description: 'Notifications for app updates',
    ),
  ];

  Future<void> createCategories() async {
    for (final category in categories) {
      await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(
            AndroidNotificationChannel(
              category.id,
              category.title,
              description: category.description,
              importance: category.importance,
            ),
          );
    }
  }
}
```

## State Management

### Notification BLoC

```dart
class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final FCMService _fcmService;
  final LocalNotificationService _localService;

  NotificationBloc(this._fcmService, this._localService)
      : super(NotificationInitial()) {
    on<InitializeNotifications>(_onInitialize);
    on<ShowNotification>(_onShowNotification);
    on<HandleNotificationTap>(_onHandleTap);
  }

  Future<void> _onInitialize(
    InitializeNotifications event,
    Emitter<NotificationState> emit,
  ) async {
    emit(NotificationLoading());
    try {
      await _fcmService.initialize();
      await _localService.initialize();
      emit(NotificationInitialized());
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }

  Future<void> _onShowNotification(
    ShowNotification event,
    Emitter<NotificationState> emit,
  ) async {
    try {
      await _localService.showNotification(
        title: event.title,
        body: event.body,
        payload: event.payload,
      );
    } catch (e) {
      emit(NotificationError(e.toString()));
    }
  }
}
```

## Best Practices

1. Handle different notification states
2. Implement proper error handling
3. Use notification categories
4. Handle notification taps
5. Manage notification permissions
6. Test notification scenarios
7. Monitor notification delivery

## Common Pitfalls

1. Missing permission handling
2. Poor error handling
3. No notification categories
4. Inefficient notification handling
5. No background handling

## Conclusion

Implementing push notifications requires:

- Understanding notification systems
- Following best practices
- Proper permission handling
- Efficient notification management
- Performance optimization

Remember:

- Handle permissions
- Manage notifications
- Test scenarios
- Monitor delivery
- Handle errors

Happy Fluttering!
