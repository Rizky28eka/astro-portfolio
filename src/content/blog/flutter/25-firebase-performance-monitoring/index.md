---
title: "Firebase Performance Monitoring in Flutter"
summary: "Track app performance metrics"
date: "2024, 04, 09"
tags: ["flutter", "firebase", "performance", "monitoring"]
difficulty: "medium"
draft: false
---

## Firebase Performance Monitoring in Flutter

Firebase Performance Monitoring helps you gain insight into the performance characteristics of your Flutter app. This guide will show you how to implement performance monitoring and track key metrics in your Flutter applications.

## Why Use Firebase Performance Monitoring?

Firebase Performance Monitoring offers several benefits:

- Track app performance
- Monitor network requests
- Measure screen load times
- Track custom traces
- Real-time monitoring
- Automatic tracking
- Free monitoring solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_performance: ^0.9.3+8
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

3. **Create Performance Service**

   ```dart
   class PerformanceService {
     final FirebasePerformance _performance = FirebasePerformance.instance;

     // Start Custom Trace
     Trace startTrace(String traceName) {
       return _performance.newTrace(traceName);
     }

     // Start HTTP Metric
     HttpMetric startHttpMetric(String url, String method) {
       return _performance.newHttpMetric(url, HttpMethod.values.firstWhere(
         (e) => e.toString() == 'HttpMethod.$method',
       ));
     }

     // Add Custom Attribute
     void addAttribute(Trace trace, String attribute, String value) {
       trace.putAttribute(attribute, value);
     }

     // Add Custom Metric
     void addMetric(Trace trace, String metricName, int value) {
       trace.putMetric(metricName, value);
     }

     // Stop Trace
     Future<void> stopTrace(Trace trace) async {
       await trace.stop();
     }

     // Stop HTTP Metric
     Future<void> stopHttpMetric(HttpMetric metric) async {
       await metric.stop();
     }

     // Get Performance Instance
     FirebasePerformance getPerformance() {
       return _performance;
     }

     // Set Performance Collection Enabled
     Future<void> setPerformanceCollectionEnabled(bool enabled) async {
       await _performance.setPerformanceCollectionEnabled(enabled);
     }

     // Is Performance Collection Enabled
     Future<bool> isPerformanceCollectionEnabled() async {
       return await _performance.isPerformanceCollectionEnabled();
     }
   }
   ```

4. **Create Performance Manager**

   ```dart
   class PerformanceManager {
     final PerformanceService _performanceService = PerformanceService();

     // Track Screen Load
     Future<void> trackScreenLoad(String screenName) async {
       final trace = _performanceService.startTrace('screen_load_$screenName');
       _performanceService.addAttribute(trace, 'screen_name', screenName);
       await _performanceService.stopTrace(trace);
     }

     // Track Network Request
     Future<void> trackNetworkRequest(String url, String method) async {
       final metric = _performanceService.startHttpMetric(url, method);
       await _performanceService.stopHttpMetric(metric);
     }

     // Track Custom Operation
     Future<void> trackOperation(String operationName, Future<void> Function() operation) async {
       final trace = _performanceService.startTrace(operationName);
       try {
         await operation();
       } finally {
         await _performanceService.stopTrace(trace);
       }
     }

     // Track User Action
     Future<void> trackUserAction(String actionName) async {
       final trace = _performanceService.startTrace('user_action_$actionName');
       _performanceService.addAttribute(trace, 'action_name', actionName);
       await _performanceService.stopTrace(trace);
     }

     // Track Feature Usage
     Future<void> trackFeatureUsage(String featureName) async {
       final trace = _performanceService.startTrace('feature_usage_$featureName');
       _performanceService.addAttribute(trace, 'feature_name', featureName);
       await _performanceService.stopTrace(trace);
     }
   }
   ```

5. **Create Performance UI**

   ```dart
   class PerformanceScreen extends StatefulWidget {
     @override
     _PerformanceScreenState createState() => _PerformanceScreenState();
   }

   class _PerformanceScreenState extends State<PerformanceScreen> {
     final PerformanceManager _performanceManager = PerformanceManager();
     bool _isLoading = false;

     Future<void> _trackScreenLoad() async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _performanceManager.trackScreenLoad('performance_screen');
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Screen load tracked')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error tracking screen load: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _trackNetworkRequest() async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _performanceManager.trackNetworkRequest(
           'https://api.example.com/data',
           'GET',
         );
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Network request tracked')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error tracking network request: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _trackUserAction() async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _performanceManager.trackUserAction('button_click');
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('User action tracked')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error tracking user action: $e')),
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
           title: Text('Performance Monitoring Demo'),
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : Center(
                 child: Column(
                   mainAxisAlignment: MainAxisAlignment.center,
                   children: [
                     ElevatedButton(
                       onPressed: _trackScreenLoad,
                       child: Text('Track Screen Load'),
                     ),
                     SizedBox(height: 16),
                     ElevatedButton(
                       onPressed: _trackNetworkRequest,
                       child: Text('Track Network Request'),
                     ),
                     SizedBox(height: 16),
                     ElevatedButton(
                       onPressed: _trackUserAction,
                       child: Text('Track User Action'),
                     ),
                   ],
                 ),
               ),
       );
     }
   }
   ```

## Advanced Features

1. **Custom Metrics**

   ```dart
   class CustomMetricsService {
     final PerformanceService _performanceService = PerformanceService();

     Future<void> trackCustomMetric(String metricName, int value) async {
       final trace = _performanceService.startTrace('custom_metric_$metricName');
       _performanceService.addMetric(trace, metricName, value);
       await _performanceService.stopTrace(trace);
     }

     Future<void> trackCustomAttribute(String attributeName, String value) async {
       final trace = _performanceService.startTrace('custom_attribute_$attributeName');
       _performanceService.addAttribute(trace, attributeName, value);
       await _performanceService.stopTrace(trace);
     }
   }
   ```

2. **Network Monitoring**

   ```dart
   class NetworkMonitoringService {
     final PerformanceService _performanceService = PerformanceService();

     Future<void> trackApiCall(String url, String method, int responseCode) async {
       final metric = _performanceService.startHttpMetric(url, method);
       metric.httpResponseCode = responseCode;
       await _performanceService.stopHttpMetric(metric);
     }

     Future<void> trackDownloadSize(String url, int bytes) async {
       final metric = _performanceService.startHttpMetric(url, 'GET');
       metric.responsePayloadSize = bytes;
       await _performanceService.stopHttpMetric(metric);
     }
   }
   ```

3. **Screen Performance**

   ```dart
   class ScreenPerformanceService {
     final PerformanceService _performanceService = PerformanceService();

     Future<void> trackScreenRender(String screenName, int renderTime) async {
       final trace = _performanceService.startTrace('screen_render_$screenName');
       _performanceService.addMetric(trace, 'render_time', renderTime);
       await _performanceService.stopTrace(trace);
     }

     Future<void> trackScreenInteraction(String screenName, String interaction) async {
       final trace = _performanceService.startTrace('screen_interaction_$screenName');
       _performanceService.addAttribute(trace, 'interaction', interaction);
       await _performanceService.stopTrace(trace);
     }
   }
   ```

## Best Practices

1. **Performance Tracking**

   - Track key metrics
   - Monitor network calls
   - Measure screen times
   - Track user actions

2. **Custom Metrics**

   - Use meaningful names
   - Track important events
   - Monitor trends
   - Set thresholds

3. **Performance**
   - Optimize tracking
   - Handle errors
   - Monitor impact
   - Set limits

## Common Use Cases

1. **App Performance**

   - Screen load times
   - Network requests
   - User interactions
   - Feature usage

2. **Network Monitoring**

   - API calls
   - Download sizes
   - Response times
   - Error rates

3. **User Experience**
   - Action tracking
   - Feature usage
   - Error tracking
   - Performance issues

## Conclusion

Implementing Firebase Performance Monitoring in your Flutter application provides valuable insights into app performance and user experience. By following these guidelines and implementing the provided examples, you can create a comprehensive performance monitoring system that helps you identify and resolve performance issues.
