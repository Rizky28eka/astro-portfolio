---
title: "Firebase Crashlytics in Flutter"
summary: "Track and fix app crashes"
date: "2024, 04, 07"
tags: ["flutter", "firebase", "crashlytics", "error-tracking"]
difficulty: "medium"
draft: false
---

## Firebase Crashlytics in Flutter

Firebase Crashlytics provides real-time crash reporting and analytics for your Flutter applications. This guide will show you how to implement crash reporting and error tracking in your Flutter apps.

## Why Use Firebase Crashlytics?

Firebase Crashlytics offers several benefits:

- Real-time crash reporting
- Detailed crash analytics
- Custom error logging
- Crash grouping
- User impact analysis
- Integration with other Firebase services
- Free crash reporting solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_crashlytics: ^3.4.9
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

3. **Create Crashlytics Service**

   ```dart
   class CrashlyticsService {
     final FirebaseCrashlytics _crashlytics = FirebaseCrashlytics.instance;

     // Set User Identifier
     Future<void> setUserIdentifier(String userId) async {
       await _crashlytics.setUserIdentifier(userId);
     }

     // Log Custom Key
     Future<void> setCustomKey(String key, dynamic value) async {
       await _crashlytics.setCustomKey(key, value);
     }

     // Log Custom Keys
     Future<void> setCustomKeys(Map<String, dynamic> keys) async {
       for (var entry in keys.entries) {
         await _crashlytics.setCustomKey(entry.key, entry.value);
       }
     }

     // Log Message
     Future<void> log(String message) async {
       await _crashlytics.log(message);
     }

     // Force Crash
     Future<void> crash() async {
       await _crashlytics.crash();
     }

     // Record Error
     Future<void> recordError(
       dynamic exception,
       StackTrace? stack, {
       dynamic reason,
       Iterable<DiagnosticsNode>? information,
       bool fatal = false,
     }) async {
       await _crashlytics.recordError(
         exception,
         stack,
         reason: reason,
         information: information,
         fatal: fatal,
       );
     }

     // Record Flutter Error
     Future<void> recordFlutterError(FlutterErrorDetails details) async {
       await _crashlytics.recordFlutterError(details);
     }

     // Record Flutter Fatal Error
     Future<void> recordFlutterFatalError(FlutterErrorDetails details) async {
       await _crashlytics.recordFlutterFatalError(details);
     }
   }
   ```

4. **Create Error Manager**

   ```dart
   class ErrorManager {
     final CrashlyticsService _crashlyticsService = CrashlyticsService();

     // Set User Context
     Future<void> setUserContext({
       required String userId,
       required String userRole,
       required String userPlan,
     }) async {
       await _crashlyticsService.setUserIdentifier(userId);
       await _crashlyticsService.setCustomKeys({
         'user_role': userRole,
         'user_plan': userPlan,
       });
     }

     // Log Error
     Future<void> logError(
       dynamic error,
       StackTrace stackTrace, {
       String? reason,
       bool fatal = false,
     }) async {
       await _crashlyticsService.recordError(
         error,
         stackTrace,
         reason: reason,
         fatal: fatal,
       );
     }

     // Log Flutter Error
     Future<void> logFlutterError(FlutterErrorDetails details) async {
       await _crashlyticsService.recordFlutterError(details);
     }

     // Log Fatal Error
     Future<void> logFatalError(FlutterErrorDetails details) async {
       await _crashlyticsService.recordFlutterFatalError(details);
     }

     // Log Custom Event
     Future<void> logCustomEvent({
       required String eventName,
       required Map<String, dynamic> parameters,
     }) async {
       await _crashlyticsService.log('Event: $eventName');
       await _crashlyticsService.setCustomKeys(parameters);
     }
   }
   ```

5. **Create Error UI**

   ```dart
   class ErrorScreen extends StatefulWidget {
     @override
     _ErrorScreenState createState() => _ErrorScreenState();
   }

   class _ErrorScreenState extends State<ErrorScreen> {
     final ErrorManager _errorManager = ErrorManager();

     void _handleError() {
       try {
         throw Exception('Test error');
       } catch (e, stackTrace) {
         _errorManager.logError(
           e,
           stackTrace,
           reason: 'Test error occurred',
           fatal: false,
         );
       }
     }

     void _handleFatalError() {
       try {
         throw Exception('Test fatal error');
       } catch (e, stackTrace) {
         _errorManager.logError(
           e,
           stackTrace,
           reason: 'Test fatal error occurred',
           fatal: true,
         );
       }
     }

     void _handleCustomEvent() {
       _errorManager.logCustomEvent(
         eventName: 'test_event',
         parameters: {
           'param1': 'value1',
           'param2': 'value2',
         },
       );
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Error Tracking Demo'),
         ),
         body: SingleChildScrollView(
           padding: EdgeInsets.all(16),
           child: Column(
             crossAxisAlignment: CrossAxisAlignment.stretch,
             children: [
               ElevatedButton(
                 onPressed: _handleError,
                 child: Text('Log Error'),
               ),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: _handleFatalError,
                 child: Text('Log Fatal Error'),
               ),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: _handleCustomEvent,
                 child: Text('Log Custom Event'),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

## Advanced Features

1. **Error Handling**

   ```dart
   class ErrorHandlingService {
     final CrashlyticsService _crashlyticsService = CrashlyticsService();

     Future<void> handleError(
       dynamic error,
       StackTrace stackTrace, {
       String? context,
       Map<String, dynamic>? additionalData,
     }) async {
       await _crashlyticsService.log('Error Context: $context');
       if (additionalData != null) {
         await _crashlyticsService.setCustomKeys(additionalData);
       }
       await _crashlyticsService.recordError(
         error,
         stackTrace,
         reason: context,
       );
     }

     Future<void> handleFlutterError(
       FlutterErrorDetails details, {
       Map<String, dynamic>? additionalData,
     }) async {
       if (additionalData != null) {
         await _crashlyticsService.setCustomKeys(additionalData);
       }
       await _crashlyticsService.recordFlutterError(details);
     }
   }
   ```

2. **Error Monitoring**

   ```dart
   class ErrorMonitoringService {
     final CrashlyticsService _crashlyticsService = CrashlyticsService();

     Future<void> monitorError(
       Future<void> Function() operation, {
       String? context,
       Map<String, dynamic>? additionalData,
     }) async {
       try {
         await operation();
       } catch (e, stackTrace) {
         await _crashlyticsService.log('Error in: $context');
         if (additionalData != null) {
           await _crashlyticsService.setCustomKeys(additionalData);
         }
         await _crashlyticsService.recordError(
           e,
           stackTrace,
           reason: context,
         );
         rethrow;
       }
     }

     Future<void> monitorFlutterError(
       Future<void> Function() operation, {
       Map<String, dynamic>? additionalData,
     }) async {
       try {
         await operation();
       } catch (e, stackTrace) {
         if (additionalData != null) {
           await _crashlyticsService.setCustomKeys(additionalData);
         }
         await _crashlyticsService.recordFlutterError(
           FlutterErrorDetails(
             exception: e,
             stack: stackTrace,
           ),
         );
         rethrow;
       }
     }
   }
   ```

3. **Error Reporting**

   ```dart
   class ErrorReportingService {
     final CrashlyticsService _crashlyticsService = CrashlyticsService();

     Future<void> reportError({
       required String errorType,
       required String errorMessage,
       required StackTrace stackTrace,
       Map<String, dynamic>? context,
       Map<String, dynamic>? userInfo,
     }) async {
       await _crashlyticsService.log('Error Type: $errorType');
       await _crashlyticsService.log('Error Message: $errorMessage');

       if (context != null) {
         await _crashlyticsService.setCustomKeys(context);
       }

       if (userInfo != null) {
         await _crashlyticsService.setCustomKeys(userInfo);
       }

       await _crashlyticsService.recordError(
         errorMessage,
         stackTrace,
         reason: errorType,
       );
     }
   }
   ```

## Best Practices

1. **Error Tracking**

   - Log meaningful errors
   - Include stack traces
   - Add context information
   - Set user identifiers

2. **Error Handling**

   - Handle errors gracefully
   - Provide user feedback
   - Implement retry mechanisms
   - Log error details

3. **Performance**
   - Minimize impact
   - Handle offline mode
   - Optimize error logging
   - Monitor crash reports

## Common Use Cases

1. **Crash Reporting**

   - App crashes
   - Unhandled exceptions
   - Flutter errors
   - Fatal errors

2. **Error Tracking**

   - API errors
   - Network errors
   - Validation errors
   - Business logic errors

3. **User Impact**
   - Error frequency
   - User affected
   - Error patterns
   - Error resolution

## Conclusion

Implementing Firebase Crashlytics in your Flutter application provides powerful crash reporting and error tracking capabilities. By following these guidelines and implementing the provided examples, you can create a robust error tracking system that helps you identify and fix issues quickly, improving your app's stability and user experience.
