---
title: "Firebase Cloud Messaging in Flutter"
summary: "Send and receive push notifications"
date: "2024, 04, 12"
tags: ["flutter", "firebase", "fcm", "notifications"]
difficulty: "medium"
draft: false
---

## Firebase Cloud Messaging in Flutter

Firebase Cloud Messaging (FCM) provides a reliable and battery-efficient connection between your server and devices. This guide will show you how to implement push notifications in your Flutter applications.

## Why Use Firebase Cloud Messaging?

Firebase Cloud Messaging offers several benefits:

- Cross-platform support
- Reliable delivery
- Battery efficient
- Rich notifications
- Topic messaging
- Analytics integration
- Free messaging solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_messaging: ^14.7.9
     flutter_local_notifications: ^16.3.0
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
     <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
   </manifest>
   ```

3. **Create Messaging Service**

   ```dart
   class MessagingService {
     final FirebaseMessaging _messaging = FirebaseMessaging.instance;
     final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

     // Initialize Messaging
     Future<void> initialize() async {
       // Request permission
       await _messaging.requestPermission(
         alert: true,
         badge: true,
         sound: true,
       );

       // Initialize local notifications
       const initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
       const initializationSettingsIOS = DarwinInitializationSettings();
       const initializationSettings = InitializationSettings(
         android: initializationSettingsAndroid,
         iOS: initializationSettingsIOS,
       );

       await _localNotifications.initialize(
         initializationSettings,
         onDidReceiveNotificationResponse: _onNotificationTap,
       );

       // Get FCM token
       final token = await _messaging.getToken();
       print('FCM Token: $token');

       // Handle token refresh
       _messaging.onTokenRefresh.listen((token) {
         print('FCM Token Refreshed: $token');
       });

       // Handle incoming messages
       FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
       FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
     }

     // Handle Foreground Message
     Future<void> _handleForegroundMessage(RemoteMessage message) async {
       print('Handling foreground message: ${message.messageId}');

       // Show local notification
       await _showLocalNotification(message);
     }

     // Handle Background Message
     Future<void> _handleBackgroundMessage(RemoteMessage message) async {
       print('Handling background message: ${message.messageId}');
       // Navigate to appropriate screen based on message data
     }

     // Show Local Notification
     Future<void> _showLocalNotification(RemoteMessage message) async {
       final androidDetails = AndroidNotificationDetails(
         'high_importance_channel',
         'High Importance Notifications',
         importance: Importance.high,
         priority: Priority.high,
       );

       final iosDetails = DarwinNotificationDetails();

       final details = NotificationDetails(
         android: androidDetails,
         iOS: iosDetails,
       );

       await _localNotifications.show(
         message.hashCode,
         message.notification?.title ?? 'New Message',
         message.notification?.body ?? '',
         details,
         payload: message.data.toString(),
       );
     }

     // Handle Notification Tap
     void _onNotificationTap(NotificationResponse response) {
       print('Notification tapped: ${response.payload}');
       // Navigate to appropriate screen based on payload
     }

     // Subscribe to Topic
     Future<void> subscribeToTopic(String topic) async {
       await _messaging.subscribeToTopic(topic);
     }

     // Unsubscribe from Topic
     Future<void> unsubscribeFromTopic(String topic) async {
       await _messaging.unsubscribeFromTopic(topic);
     }

     // Get FCM Token
     Future<String?> getToken() async {
       return await _messaging.getToken();
     }
   }
   ```

4. **Create Messaging Manager**

   ```dart
   class MessagingManager {
     final MessagingService _messagingService = MessagingService();

     // Initialize Messaging
     Future<void> initialize() async {
       await _messagingService.initialize();
     }

     // Subscribe to Topic
     Future<void> subscribeToTopic(String topic) async {
       await _messagingService.subscribeToTopic(topic);
     }

     // Unsubscribe from Topic
     Future<void> unsubscribeFromTopic(String topic) async {
       await _messagingService.unsubscribeFromTopic(topic);
     }

     // Get FCM Token
     Future<String?> getToken() async {
       return await _messagingService.getToken();
     }

     // Send Test Notification
     Future<void> sendTestNotification() async {
       // Implementation depends on your backend
     }
   }
   ```

5. **Create Messaging UI**

   ```dart
   class MessagingScreen extends StatefulWidget {
     @override
     _MessagingScreenState createState() => _MessagingScreenState();
   }

   class _MessagingScreenState extends State<MessagingScreen> {
     final MessagingManager _messagingManager = MessagingManager();
     bool _isLoading = false;
     String? _fcmToken;

     @override
     void initState() {
       super.initState();
       _initializeMessaging();
     }

     Future<void> _initializeMessaging() async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _messagingManager.initialize();
         final token = await _messagingManager.getToken();
         setState(() {
           _fcmToken = token;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error initializing messaging: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _subscribeToTopic(String topic) async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _messagingManager.subscribeToTopic(topic);
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Subscribed to topic: $topic')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error subscribing to topic: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _unsubscribeFromTopic(String topic) async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _messagingManager.unsubscribeFromTopic(topic);
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Unsubscribed from topic: $topic')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error unsubscribing from topic: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Firebase Cloud Messaging Demo'),
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : SingleChildScrollView(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       'FCM Token:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_fcmToken ?? 'Not available'),
                     SizedBox(height: 24),
                     Center(
                       child: Column(
                         children: [
                           ElevatedButton(
                             onPressed: () => _subscribeToTopic('news'),
                             child: Text('Subscribe to News'),
                           ),
                           SizedBox(height: 16),
                           ElevatedButton(
                             onPressed: () => _unsubscribeFromTopic('news'),
                             child: Text('Unsubscribe from News'),
                           ),
                         ],
                       ),
                     ),
                   ],
                 ),
               ),
       );
     }
   }
   ```

## Advanced Features

1. **Notification Channels**

   ```dart
   class NotificationChannelService {
     final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

     Future<void> createNotificationChannel() async {
       const androidChannel = AndroidNotificationChannel(
         'high_importance_channel',
         'High Importance Notifications',
         importance: Importance.high,
       );

       await _localNotifications
           .resolvePlatformSpecificImplementation<
               AndroidFlutterLocalNotificationsPlugin>()
           ?.createNotificationChannel(androidChannel);
     }

     Future<void> createCustomChannel(String id, String name, String description) async {
       final androidChannel = AndroidNotificationChannel(
         id,
         name,
         description: description,
         importance: Importance.high,
       );

       await _localNotifications
           .resolvePlatformSpecificImplementation<
               AndroidFlutterLocalNotificationsPlugin>()
           ?.createNotificationChannel(androidChannel);
     }
   }
   ```

2. **Notification Actions**

   ```dart
   class NotificationActionService {
     final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

     Future<void> showNotificationWithActions() async {
       const androidDetails = AndroidNotificationDetails(
         'action_channel',
         'Action Notifications',
         importance: Importance.high,
         priority: Priority.high,
         actions: [
           AndroidNotificationAction('accept', 'Accept'),
           AndroidNotificationAction('decline', 'Decline'),
         ],
       );

       const details = NotificationDetails(android: androidDetails);

       await _localNotifications.show(
         0,
         'Action Required',
         'Please respond to this notification',
         details,
         payload: 'action_required',
       );
     }
   }
   ```

3. **Notification Scheduling**

   ```dart
   class NotificationSchedulingService {
     final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

     Future<void> scheduleNotification({
       required int id,
       required String title,
       required String body,
       required DateTime scheduledDate,
     }) async {
       const androidDetails = AndroidNotificationDetails(
         'scheduled_channel',
         'Scheduled Notifications',
         importance: Importance.high,
         priority: Priority.high,
       );

       const details = NotificationDetails(android: androidDetails);

       await _localNotifications.zonedSchedule(
         id,
         title,
         body,
         TZDateTime.from(scheduledDate, local),
         details,
         androidAllowWhileIdle: true,
         uiLocalNotificationDateInterpretation:
             UILocalNotificationDateInterpretation.absoluteTime,
       );
     }
   }
   ```

## Best Practices

1. **Notification Management**

   - Handle permissions
   - Create channels
   - Manage topics
   - Track delivery

2. **Message Handling**

   - Handle foreground
   - Handle background
   - Handle data
   - Handle actions

3. **Performance**
   - Optimize delivery
   - Handle errors
   - Monitor usage
   - Set limits

## Common Use Cases

1. **Push Notifications**

   - User notifications
   - System alerts
   - Marketing messages
   - Updates

2. **Topic Messaging**

   - News updates
   - Category updates
   - Location updates
   - User groups

3. **Rich Notifications**
   - Images
   - Actions
   - Deep links
   - Custom layouts

## Conclusion

Implementing Firebase Cloud Messaging in your Flutter application provides powerful push notification capabilities. By following these guidelines and implementing the provided examples, you can create a robust messaging system that enhances user engagement and communication.
