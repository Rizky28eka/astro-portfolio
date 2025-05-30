---
title: "Firebase Analytics in Flutter"
summary: "Track user behavior and app performance"
date: "2024, 04, 06"
tags: ["flutter", "firebase", "analytics", "tracking"]
difficulty: "medium"
draft: false
---

## Firebase Analytics in Flutter

Firebase Analytics provides powerful insights into user behavior and app performance. This guide will show you how to implement analytics tracking in your Flutter applications.

## Why Use Firebase Analytics?

Firebase Analytics offers several benefits:

- User behavior tracking
- Conversion tracking
- Custom event tracking
- User segmentation
- Real-time reporting
- Integration with other Firebase services
- Free analytics solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_analytics: ^10.7.4
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

3. **Create Analytics Service**

   ```dart
   class AnalyticsService {
     final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;

     // Screen Tracking
     Future<void> logScreenView({
       required String screenName,
       String? screenClass,
     }) async {
       await _analytics.logScreenView(
         screenName: screenName,
         screenClass: screenClass,
       );
     }

     // Event Tracking
     Future<void> logEvent({
       required String name,
       Map<String, dynamic>? parameters,
     }) async {
       await _analytics.logEvent(
         name: name,
         parameters: parameters,
       );
     }

     // User Properties
     Future<void> setUserProperty({
       required String name,
       required String value,
     }) async {
       await _analytics.setUserProperty(
         name: name,
         value: value,
       );
     }

     // User ID
     Future<void> setUserId(String userId) async {
       await _analytics.setUserId(id: userId);
     }

     // Custom Dimensions
     Future<void> setUserProperties(Map<String, String> properties) async {
       for (var entry in properties.entries) {
         await _analytics.setUserProperty(
           name: entry.key,
           value: entry.value,
         );
       }
     }
   }
   ```

4. **Create Analytics Manager**

   ```dart
   class AnalyticsManager {
     final AnalyticsService _analyticsService = AnalyticsService();

     // Screen Tracking
     Future<void> trackScreenView(String screenName) async {
       await _analyticsService.logScreenView(
         screenName: screenName,
         screenClass: screenName,
       );
     }

     // User Actions
     Future<void> trackButtonClick(String buttonName) async {
       await _analyticsService.logEvent(
         name: 'button_click',
         parameters: {
           'button_name': buttonName,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }

     Future<void> trackFormSubmission(String formName) async {
       await _analyticsService.logEvent(
         name: 'form_submission',
         parameters: {
           'form_name': formName,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }

     // Content Interaction
     Future<void> trackContentView(String contentId, String contentType) async {
       await _analyticsService.logEvent(
         name: 'content_view',
         parameters: {
           'content_id': contentId,
           'content_type': contentType,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }

     Future<void> trackContentShare(String contentId, String contentType) async {
       await _analyticsService.logEvent(
         name: 'content_share',
         parameters: {
           'content_id': contentId,
           'content_type': contentType,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }

     // User Properties
     Future<void> setUserProfile({
       required String userId,
       required String userRole,
       required String userPlan,
     }) async {
       await _analyticsService.setUserId(userId);
       await _analyticsService.setUserProperties({
         'user_role': userRole,
         'user_plan': userPlan,
       });
     }
   }
   ```

5. **Create Analytics UI**

   ```dart
   class AnalyticsScreen extends StatefulWidget {
     @override
   _AnalyticsScreenState createState() => _AnalyticsScreenState();
   }

   class _AnalyticsScreenState extends State<AnalyticsScreen> {
     final AnalyticsManager _analyticsManager = AnalyticsManager();

     @override
     void initState() {
       super.initState();
       _analyticsManager.trackScreenView('analytics_screen');
     }

     void _handleButtonClick(String buttonName) {
       _analyticsManager.trackButtonClick(buttonName);
     }

     void _handleFormSubmission(String formName) {
       _analyticsManager.trackFormSubmission(formName);
     }

     void _handleContentView(String contentId, String contentType) {
       _analyticsManager.trackContentView(contentId, contentType);
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Analytics Demo'),
         ),
         body: SingleChildScrollView(
           padding: EdgeInsets.all(16),
           child: Column(
             crossAxisAlignment: CrossAxisAlignment.stretch,
             children: [
               ElevatedButton(
                 onPressed: () => _handleButtonClick('demo_button'),
                 child: Text('Track Button Click'),
               ),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: () => _handleFormSubmission('demo_form'),
                 child: Text('Track Form Submission'),
               ),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: () => _handleContentView('123', 'article'),
                 child: Text('Track Content View'),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

## Advanced Features

1. **Custom Events**

   ```dart
   class CustomEventService {
     final AnalyticsService _analyticsService = AnalyticsService();

     Future<void> trackPurchase({
       required String productId,
       required double value,
       required String currency,
     }) async {
       await _analyticsService.logEvent(
         name: 'purchase',
         parameters: {
           'product_id': productId,
           'value': value,
           'currency': currency,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }

     Future<void> trackSearch({
       required String searchTerm,
       required int resultCount,
     }) async {
       await _analyticsService.logEvent(
         name: 'search',
         parameters: {
           'search_term': searchTerm,
           'result_count': resultCount,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }
   }
   ```

2. **User Segmentation**

   ```dart
   class UserSegmentationService {
     final AnalyticsService _analyticsService = AnalyticsService();

     Future<void> setUserSegment({
       required String userId,
       required String segment,
     }) async {
       await _analyticsService.setUserProperty(
         name: 'user_segment',
         value: segment,
       );
     }

     Future<void> setUserBehavior({
       required String userId,
       required String behavior,
     }) async {
       await _analyticsService.setUserProperty(
         name: 'user_behavior',
         value: behavior,
       );
     }
   }
   ```

3. **Conversion Tracking**

   ```dart
   class ConversionTrackingService {
     final AnalyticsService _analyticsService = AnalyticsService();

     Future<void> trackConversion({
       required String conversionName,
       required double value,
     }) async {
       await _analyticsService.logEvent(
         name: 'conversion',
         parameters: {
           'conversion_name': conversionName,
           'value': value,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }

     Future<void> trackFunnelStep({
       required String funnelName,
       required String stepName,
       required int stepNumber,
     }) async {
       await _analyticsService.logEvent(
         name: 'funnel_step',
         parameters: {
           'funnel_name': funnelName,
           'step_name': stepName,
           'step_number': stepNumber,
           'timestamp': DateTime.now().toIso8601String(),
         },
       );
     }
   }
   ```

## Best Practices

1. **Event Tracking**

   - Use consistent naming
   - Include relevant parameters
   - Track meaningful events
   - Avoid tracking sensitive data

2. **User Properties**

   - Set relevant properties
   - Update properties timely
   - Use meaningful values
   - Avoid tracking PII

3. **Performance**
   - Batch events when possible
   - Optimize event parameters
   - Handle offline tracking
   - Monitor analytics impact

## Common Use Cases

1. **User Behavior**

   - Screen views
   - Button clicks
   - Form submissions
   - Content interactions

2. **Business Metrics**

   - Conversion tracking
   - Revenue tracking
   - User engagement
   - Feature usage

3. **App Performance**
   - Error tracking
   - Performance metrics
   - User retention
   - App stability

## Conclusion

Implementing Firebase Analytics in your Flutter application provides valuable insights into user behavior and app performance. By following these guidelines and implementing the provided examples, you can create a comprehensive analytics system that helps you make data-driven decisions and improve your app's user experience.
