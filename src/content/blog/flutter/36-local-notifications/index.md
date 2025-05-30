---
title: "Implementing Local Notifications in Flutter"
summary: "Alert users without internet"
date: "2024, 04, 16"
tags: ["flutter", "notifications", "local-storage", "user-experience"]
difficulty: "medium"
draft: false
---

## Implementing Local Notifications in Flutter

Local notifications are a powerful way to engage users even when they're not actively using your app. This guide will show you how to implement local notifications in Flutter to keep users informed and engaged.

## Why Use Local Notifications?

- Alert users about important events
- Remind users about tasks or appointments
- Provide offline functionality
- Increase user engagement
- Improve user experience
- Save battery and data usage
- Work without internet connection

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter_local_notifications: ^16.3.2
     timezone: ^0.9.2
   ```

2. **Initialize Notifications**

   ```dart
   class NotificationService {
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

     void _onNotificationTap(NotificationResponse response) {
       // Handle notification tap
       print('Notification tapped: ${response.payload}');
     }
   }
   ```

3. **Request Permissions**

   ```dart
   Future<void> requestPermissions() async {
     final android = await _notifications
         .resolvePlatformSpecificImplementation<
             AndroidFlutterLocalNotificationsPlugin>();
     await android?.requestPermission();

     final ios = await _notifications
         .resolvePlatformSpecificImplementation<
             IOSFlutterLocalNotificationsPlugin>();
     await ios?.requestPermissions(
       alert: true,
       badge: true,
       sound: true,
     );
   }
   ```

4. **Show Basic Notification**

   ```dart
   Future<void> showNotification({
     required String title,
     required String body,
     String? payload,
   }) async {
     const androidDetails = AndroidNotificationDetails(
       'default_channel',
       'Default Channel',
       channelDescription: 'Default notification channel',
       importance: Importance.high,
       priority: Priority.high,
     );

     const iosDetails = DarwinNotificationDetails(
       presentAlert: true,
       presentBadge: true,
       presentSound: true,
     );

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
   ```

5. **Schedule Notification**

   ```dart
   Future<void> scheduleNotification({
     required String title,
     required String body,
     required DateTime scheduledDate,
     String? payload,
   }) async {
     const androidDetails = AndroidNotificationDetails(
       'scheduled_channel',
       'Scheduled Notifications',
       channelDescription: 'Channel for scheduled notifications',
       importance: Importance.high,
       priority: Priority.high,
     );

     const iosDetails = DarwinNotificationDetails(
       presentAlert: true,
       presentBadge: true,
       presentSound: true,
     );

     const details = NotificationDetails(
       android: androidDetails,
       iOS: iosDetails,
     );

     await _notifications.zonedSchedule(
       DateTime.now().millisecond,
       title,
       body,
       TZDateTime.from(scheduledDate, local),
       details,
       androidAllowWhileIdle: true,
       uiLocalNotificationDateInterpretation:
           UILocalNotificationDateInterpretation.absoluteTime,
       payload: payload,
     );
   }
   ```

## Advanced Features

1. **Custom Notification Sound**

   ```dart
   Future<void> showNotificationWithSound({
     required String title,
     required String body,
     String? payload,
   }) async {
     const androidDetails = AndroidNotificationDetails(
       'sound_channel',
       'Sound Notifications',
       channelDescription: 'Notifications with custom sound',
       importance: Importance.high,
       priority: Priority.high,
       sound: RawResourceAndroidNotificationSound('notification_sound'),
     );

     const iosDetails = DarwinNotificationDetails(
       presentAlert: true,
       presentBadge: true,
       presentSound: true,
       sound: 'notification_sound.aiff',
     );

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
   ```

2. **Grouped Notifications**

   ```dart
   Future<void> showGroupedNotifications() async {
     const androidDetails = AndroidNotificationDetails(
       'group_channel',
       'Grouped Notifications',
       channelDescription: 'Notifications that can be grouped',
       importance: Importance.high,
       priority: Priority.high,
       groupKey: 'com.example.group',
     );

     const details = NotificationDetails(android: androidDetails);

     // Show first notification
     await _notifications.show(
       1,
       'First Notification',
       'This is the first notification in the group',
       details,
     );

     // Show second notification
     await _notifications.show(
       2,
       'Second Notification',
       'This is the second notification in the group',
       details,
     );
   }
   ```

3. **Cancel Notifications**

   ```dart
   Future<void> cancelNotification(int id) async {
     await _notifications.cancel(id);
   }

   Future<void> cancelAllNotifications() async {
     await _notifications.cancelAll();
   }
   ```

## Best Practices

1. **Notification Design**

   - Keep titles short and clear
   - Use actionable content
   - Include relevant information
   - Consider user preferences
   - Respect notification limits
   - Test on different devices

2. **Implementation**

   - Handle permissions properly
   - Implement error handling
   - Consider timezone differences
   - Test offline functionality
   - Monitor notification delivery
   - Clean up old notifications

3. **User Experience**
   - Don't spam users
   - Provide value in notifications
   - Allow notification preferences
   - Consider quiet hours
   - Handle notification taps
   - Track notification engagement

## Common Use Cases

1. **Reminders**

   - Task reminders
   - Appointment notifications
   - Event alerts
   - Daily check-ins
   - Goal tracking
   - Habit formation

2. **Updates**

   - Content updates
   - Status changes
   - Progress notifications
   - Achievement alerts
   - System updates
   - Maintenance notices

3. **Engagement**
   - Welcome messages
   - Re-engagement prompts
   - Feature highlights
   - Special offers
   - User milestones
   - Community updates

## Conclusion

Implementing local notifications in Flutter provides a powerful way to engage users and keep them informed about important events. By following these guidelines and implementing the provided examples, you can create an effective notification system that enhances your app's user experience.
