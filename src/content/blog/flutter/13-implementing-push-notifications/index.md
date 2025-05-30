---
title: "Implementing Push Notifications"
summary: "Send alerts with Firebase Cloud"
date: "2024, 03, 28"
tags: ["flutter", "firebase", "notifications", "fcm"]
difficulty: "advanced"
draft: false
---

## Implementing Push Notifications

Firebase Cloud Messaging (FCM) is a powerful solution for implementing push notifications in Flutter applications. This guide will show you how to set up and implement push notifications using Firebase Cloud Messaging.

## Why Use Firebase Cloud Messaging?

FCM offers several advantages:

- Cross-platform support
- Reliable message delivery
- Rich notification features
- Easy integration
- Scalable solution
- Free tier available
- Analytics integration

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_messaging: ^14.7.10
     flutter_local_notifications: ^16.3.0
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <application>
       <service
         android:name="io.flutter.plugins.firebase.messaging.FlutterFirebaseMessagingService"
         android:exported="false">
         <intent-filter>
           <action android:name="com.google.firebase.MESSAGING_EVENT"/>
         </intent-filter>
       </service>
     </application>
   </manifest>
   ```

   iOS (ios/Runner/AppDelegate.swift):

   ```swift
   import UIKit
   import Flutter
   import FirebaseCore
   import FirebaseMessaging

   @UIApplicationMain
   @objc class AppDelegate: FlutterAppDelegate {
     override func application(
       _ application: UIApplication,
       didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
     ) -> Bool {
       FirebaseApp.configure()
       Messaging.messaging().delegate = self

       if #available(iOS 10.0, *) {
         UNUserNotificationCenter.current().delegate = self
         let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
         UNUserNotificationCenter.current().requestAuthorization(
           options: authOptions,
           completionHandler: { _, _ in }
         )
       }

       application.registerForRemoteNotifications()
       GeneratedPluginRegistrant.register(with: self)
       return super.application(application, didFinishLaunchingWithOptions: launchOptions)
     }
   }
   ```

3. **Initialize Firebase Messaging**

   ```dart
   class NotificationService {
     final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
     final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

     Future<void> initialize() async {
       // Request permission
       NotificationSettings settings = await _firebaseMessaging.requestPermission(
         alert: true,
         badge: true,
         sound: true,
       );

       // Initialize local notifications
       const AndroidInitializationSettings androidSettings =
           AndroidInitializationSettings('@mipmap/ic_launcher');
       const DarwinInitializationSettings iosSettings =
           DarwinInitializationSettings();
       const InitializationSettings initSettings = InitializationSettings(
         android: androidSettings,
         iOS: iosSettings,
       );
       await _localNotifications.initialize(initSettings);

       // Get FCM token
       String? token = await _firebaseMessaging.getToken();
       print('FCM Token: $token');

       // Handle incoming messages
       FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
       FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
     }

     Future<void> _handleForegroundMessage(RemoteMessage message) async {
       print('Handling foreground message: ${message.messageId}');

       // Show local notification
       const AndroidNotificationDetails androidDetails =
           AndroidNotificationDetails(
         'high_importance_channel',
         'High Importance Notifications',
         importance: Importance.max,
         priority: Priority.high,
       );
       const DarwinNotificationDetails iosDetails =
           DarwinNotificationDetails();
       const NotificationDetails details = NotificationDetails(
         android: androidDetails,
         iOS: iosDetails,
       );

       await _localNotifications.show(
         message.hashCode,
         message.notification?.title,
         message.notification?.body,
         details,
       );
     }

     void _handleBackgroundMessage(RemoteMessage message) {
       print('Handling background message: ${message.messageId}');
       // Handle notification tap
     }
   }
   ```

4. **Create Notification Handler**

   ```dart
   class NotificationHandler {
     final NotificationService _notificationService;

     NotificationHandler(this._notificationService);

     Future<void> setupNotifications() async {
       await _notificationService.initialize();
     }

     Future<void> subscribeToTopic(String topic) async {
       await FirebaseMessaging.instance.subscribeToTopic(topic);
     }

     Future<void> unsubscribeFromTopic(String topic) async {
       await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
     }
   }
   ```

5. **Implement in Main App**

   ```dart
   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     await Firebase.initializeApp();

     final notificationHandler = NotificationHandler(NotificationService());
     await notificationHandler.setupNotifications();

     runApp(MyApp());
   }
   ```

## Advanced Features

1. **Custom Notification Channels**

   ```dart
   Future<void> createNotificationChannels() async {
     const AndroidNotificationChannel channel = AndroidNotificationChannel(
       'high_importance_channel',
       'High Importance Notifications',
       description: 'This channel is used for important notifications.',
       importance: Importance.high,
     );

     await _localNotifications
         .resolvePlatformSpecificImplementation<
             AndroidFlutterLocalNotificationsPlugin>()
         ?.createNotificationChannel(channel);
   }
   ```

2. **Data Messages**

   ```dart
   Future<void> sendDataMessage({
     required String token,
     required Map<String, dynamic> data,
   }) async {
     await http.post(
       Uri.parse('https://fcm.googleapis.com/fcm/send'),
       headers: {
         'Content-Type': 'application/json',
         'Authorization': 'key=YOUR_SERVER_KEY',
       },
       body: jsonEncode({
         'to': token,
         'data': data,
       }),
     );
   }
   ```

3. **Notification Groups**

   ```dart
   Future<void> showGroupedNotifications() async {
     const AndroidNotificationDetails androidDetails =
         AndroidNotificationDetails(
       'group_channel',
       'Group Notifications',
       groupKey: 'com.example.group',
       setAsGroupSummary: true,
     );

     await _localNotifications.show(
       0,
       'Group Summary',
       'You have 3 new messages',
       const NotificationDetails(android: androidDetails),
     );
   }
   ```

## Best Practices

1. **Notification Management**

   - Handle different notification types
   - Implement notification actions
   - Manage notification permissions
   - Handle notification taps

2. **User Experience**

   - Customize notification appearance
   - Implement notification preferences
   - Handle notification grouping
   - Provide clear call-to-actions

3. **Security**
   - Secure FCM token handling
   - Implement proper authentication
   - Handle sensitive data
   - Follow privacy guidelines

## Common Use Cases

1. **User Engagement**

   - New content notifications
   - Reminder notifications
   - Social interaction alerts
   - Promotional messages

2. **Real-time Updates**

   - Chat messages
   - Status updates
   - Live events
   - Breaking news

3. **Business Features**
   - Order updates
   - Payment notifications
   - Appointment reminders
   - Service alerts

## Conclusion

Implementing push notifications with Firebase Cloud Messaging provides a robust solution for engaging users and keeping them informed. By following these guidelines and implementing the provided examples, you can create an effective notification system that enhances your app's functionality and user experience.
