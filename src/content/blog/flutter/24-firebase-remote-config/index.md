---
title: "Firebase Remote Config in Flutter"
summary: "Dynamic app configuration"
date: "2024, 04, 08"
tags: ["flutter", "firebase", "remote-config", "configuration"]
difficulty: "medium"
draft: false
---

## Firebase Remote Config in Flutter

Firebase Remote Config allows you to change the behavior and appearance of your Flutter app without requiring users to download an app update. This guide will show you how to implement dynamic configuration in your Flutter applications.

## Why Use Firebase Remote Config?

Firebase Remote Config offers several benefits:

- Dynamic configuration
- A/B testing
- Feature flags
- Gradual rollouts
- User segmentation
- Real-time updates
- Free configuration solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_remote_config: ^4.3.8
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

3. **Create Remote Config Service**

   ```dart
   class RemoteConfigService {
     final FirebaseRemoteConfig _remoteConfig = FirebaseRemoteConfig.instance;

     // Initialize Remote Config
     Future<void> initialize() async {
       try {
         await _remoteConfig.setConfigSettings(RemoteConfigSettings(
           fetchTimeout: const Duration(minutes: 1),
           minimumFetchInterval: const Duration(hours: 1),
         ));

         await _remoteConfig.setDefaults({
           'welcome_message': 'Welcome to the app!',
           'feature_enabled': false,
           'app_version': '1.0.0',
           'maintenance_mode': false,
         });

         await _remoteConfig.fetchAndActivate();
       } catch (e) {
         print('Error initializing Remote Config: $e');
       }
     }

     // Get String Value
     String getString(String key) {
       return _remoteConfig.getString(key);
     }

     // Get Boolean Value
     bool getBool(String key) {
       return _remoteConfig.getBool(key);
     }

     // Get Integer Value
     int getInt(String key) {
       return _remoteConfig.getInt(key);
     }

     // Get Double Value
     double getDouble(String key) {
       return _remoteConfig.getDouble(key);
     }

     // Get JSON Value
     Map<String, dynamic> getJSON(String key) {
       final jsonString = _remoteConfig.getString(key);
       return json.decode(jsonString);
     }

     // Fetch and Activate
     Future<bool> fetchAndActivate() async {
       try {
         return await _remoteConfig.fetchAndActivate();
       } catch (e) {
         print('Error fetching Remote Config: $e');
         return false;
       }
     }

     // Get Last Fetch Time
     DateTime getLastFetchTime() {
       return _remoteConfig.lastFetchTime;
     }

     // Get Fetch Status
     RemoteConfigFetchStatus getFetchStatus() {
       return _remoteConfig.lastFetchStatus;
     }
   }
   ```

4. **Create Config Manager**

   ```dart
   class ConfigManager {
     final RemoteConfigService _remoteConfigService = RemoteConfigService();

     // Initialize Config
     Future<void> initialize() async {
       await _remoteConfigService.initialize();
     }

     // Get App Configuration
     Map<String, dynamic> getAppConfig() {
       return {
         'welcome_message': _remoteConfigService.getString('welcome_message'),
         'feature_enabled': _remoteConfigService.getBool('feature_enabled'),
         'app_version': _remoteConfigService.getString('app_version'),
         'maintenance_mode': _remoteConfigService.getBool('maintenance_mode'),
       };
     }

     // Check Feature Flag
     bool isFeatureEnabled(String featureKey) {
       return _remoteConfigService.getBool(featureKey);
     }

     // Get Feature Configuration
     Map<String, dynamic> getFeatureConfig(String featureKey) {
       return _remoteConfigService.getJSON(featureKey);
     }

     // Refresh Configuration
     Future<bool> refreshConfig() async {
       return await _remoteConfigService.fetchAndActivate();
     }

     // Get Last Update Time
     DateTime getLastUpdateTime() {
       return _remoteConfigService.getLastFetchTime();
     }
   }
   ```

5. **Create Config UI**

   ```dart
   class ConfigScreen extends StatefulWidget {
     @override
     _ConfigScreenState createState() => _ConfigScreenState();
   }

   class _ConfigScreenState extends State<ConfigScreen> {
     final ConfigManager _configManager = ConfigManager();
     Map<String, dynamic> _appConfig = {};
     bool _isLoading = false;

     @override
     void initState() {
       super.initState();
       _loadConfig();
     }

     Future<void> _loadConfig() async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _configManager.initialize();
         setState(() {
           _appConfig = _configManager.getAppConfig();
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error loading config: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _refreshConfig() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final updated = await _configManager.refreshConfig();
         if (updated) {
           setState(() {
             _appConfig = _configManager.getAppConfig();
           });
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('Config updated successfully')),
           );
         }
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error refreshing config: $e')),
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
           title: Text('Remote Config Demo'),
           actions: [
             IconButton(
               icon: Icon(Icons.refresh),
               onPressed: _isLoading ? null : _refreshConfig,
             ),
           ],
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : SingleChildScrollView(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       'Welcome Message:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_appConfig['welcome_message'] ?? ''),
                     SizedBox(height: 16),
                     Text(
                       'Feature Status:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(
                       'Feature Enabled: ${_appConfig['feature_enabled'] ?? false}',
                     ),
                     SizedBox(height: 16),
                     Text(
                       'App Version:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_appConfig['app_version'] ?? ''),
                     SizedBox(height: 16),
                     Text(
                       'Maintenance Mode:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(
                       'Maintenance Mode: ${_appConfig['maintenance_mode'] ?? false}',
                     ),
                   ],
                 ),
               ),
       );
     }
   }
   ```

## Advanced Features

1. **A/B Testing**

   ```dart
   class ABTestingService {
     final RemoteConfigService _remoteConfigService = RemoteConfigService();

     Future<Map<String, dynamic>> getExperimentConfig(String experimentId) async {
       return _remoteConfigService.getJSON('experiment_$experimentId');
     }

     Future<bool> isUserInExperiment(String experimentId) async {
       return _remoteConfigService.getBool('experiment_${experimentId}_enabled');
     }

     Future<String> getExperimentVariant(String experimentId) async {
       return _remoteConfigService.getString('experiment_${experimentId}_variant');
     }
   }
   ```

2. **Feature Flags**

   ```dart
   class FeatureFlagService {
     final RemoteConfigService _remoteConfigService = RemoteConfigService();

     Future<Map<String, bool>> getAllFeatureFlags() async {
       final config = _remoteConfigService.getJSON('feature_flags');
       return Map<String, bool>.from(config);
     }

     Future<bool> isFeatureEnabled(String featureKey) async {
       return _remoteConfigService.getBool('feature_$featureKey');
     }

     Future<Map<String, dynamic>> getFeatureConfig(String featureKey) async {
       return _remoteConfigService.getJSON('feature_${featureKey}_config');
     }
   }
   ```

3. **User Segmentation**

   ```dart
   class UserSegmentationService {
     final RemoteConfigService _remoteConfigService = RemoteConfigService();

     Future<Map<String, dynamic>> getUserSegmentConfig(String segmentId) async {
       return _remoteConfigService.getJSON('segment_$segmentId');
     }

     Future<bool> isUserInSegment(String segmentId) async {
       return _remoteConfigService.getBool('segment_${segmentId}_enabled');
     }

     Future<Map<String, dynamic>> getSegmentFeatures(String segmentId) async {
       return _remoteConfigService.getJSON('segment_${segmentId}_features');
     }
   }
   ```

## Best Practices

1. **Configuration Management**

   - Set default values
   - Handle fetch errors
   - Implement caching
   - Monitor changes

2. **Feature Flags**

   - Use meaningful names
   - Document changes
   - Test thoroughly
   - Monitor usage

3. **Performance**
   - Optimize fetch intervals
   - Handle offline mode
   - Cache values
   - Monitor impact

## Common Use Cases

1. **App Configuration**

   - Feature toggles
   - UI customization
   - Content updates
   - Maintenance mode

2. **A/B Testing**

   - UI variations
   - Feature testing
   - Content testing
   - Performance testing

3. **User Segmentation**
   - User groups
   - Feature access
   - Content targeting
   - Experiment groups

## Conclusion

Implementing Firebase Remote Config in your Flutter application provides powerful dynamic configuration capabilities. By following these guidelines and implementing the provided examples, you can create a flexible configuration system that allows you to modify your app's behavior and appearance without requiring app updates.
