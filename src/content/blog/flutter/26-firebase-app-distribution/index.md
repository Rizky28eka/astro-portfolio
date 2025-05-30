---
title: "Firebase App Distribution in Flutter"
summary: "Distribute app to testers"
date: "2024, 04, 10"
tags: ["flutter", "firebase", "distribution", "testing"]
difficulty: "medium"
draft: false
---

## Firebase App Distribution in Flutter

Firebase App Distribution makes it easy to distribute pre-release versions of your Flutter app to testers. This guide will show you how to set up and use Firebase App Distribution for your Flutter applications.

## Why Use Firebase App Distribution?

Firebase App Distribution offers several benefits:

- Easy distribution
- Tester management
- Release notes
- Crash reporting
- Feedback collection
- Version tracking
- Free distribution solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_app_distribution: ^0.3.0
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

3. **Create Distribution Service**

   ```dart
   class DistributionService {
     final FirebaseAppDistribution _distribution = FirebaseAppDistribution.instance;

     // Check for Updates
     Future<bool> checkForUpdates() async {
       try {
         return await _distribution.isUpdateAvailable();
       } catch (e) {
         print('Error checking for updates: $e');
         return false;
       }
     }

     // Get Latest Release
     Future<AppDistributionRelease?> getLatestRelease() async {
       try {
         return await _distribution.getLatestRelease();
       } catch (e) {
         print('Error getting latest release: $e');
         return null;
       }
     }

     // Update App
     Future<void> updateApp() async {
       try {
         await _distribution.updateApp();
       } catch (e) {
         print('Error updating app: $e');
       }
     }

     // Get Tester Groups
     Future<List<String>> getTesterGroups() async {
       try {
         return await _distribution.getTesterGroups();
       } catch (e) {
         print('Error getting tester groups: $e');
         return [];
       }
     }

     // Get Release Notes
     Future<String?> getReleaseNotes() async {
       try {
         final release = await _distribution.getLatestRelease();
         return release?.releaseNotes;
       } catch (e) {
         print('Error getting release notes: $e');
         return null;
       }
     }

     // Get Version
     Future<String?> getVersion() async {
       try {
         final release = await _distribution.getLatestRelease();
         return release?.displayVersion;
       } catch (e) {
         print('Error getting version: $e');
         return null;
       }
     }
   }
   ```

4. **Create Distribution Manager**

   ```dart
   class DistributionManager {
     final DistributionService _distributionService = DistributionService();

     // Check for Updates
     Future<bool> checkForUpdates() async {
       return await _distributionService.checkForUpdates();
     }

     // Get Latest Release Info
     Future<Map<String, dynamic>> getLatestReleaseInfo() async {
       final release = await _distributionService.getLatestRelease();
       return {
         'version': release?.displayVersion,
         'notes': release?.releaseNotes,
         'buildNumber': release?.buildNumber,
       };
     }

     // Update App
     Future<void> updateApp() async {
       await _distributionService.updateApp();
     }

     // Get Tester Groups
     Future<List<String>> getTesterGroups() async {
       return await _distributionService.getTesterGroups();
     }

     // Get Release Notes
     Future<String?> getReleaseNotes() async {
       return await _distributionService.getReleaseNotes();
     }

     // Get Version
     Future<String?> getVersion() async {
       return await _distributionService.getVersion();
     }
   }
   ```

5. **Create Distribution UI**

   ```dart
   class DistributionScreen extends StatefulWidget {
     @override
     _DistributionScreenState createState() => _DistributionScreenState();
   }

   class _DistributionScreenState extends State<DistributionScreen> {
     final DistributionManager _distributionManager = DistributionManager();
     bool _isLoading = false;
     Map<String, dynamic> _releaseInfo = {};
     bool _updateAvailable = false;

     @override
     void initState() {
       super.initState();
       _loadReleaseInfo();
     }

     Future<void> _loadReleaseInfo() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final releaseInfo = await _distributionManager.getLatestReleaseInfo();
         final updateAvailable = await _distributionManager.checkForUpdates();
         setState(() {
           _releaseInfo = releaseInfo;
           _updateAvailable = updateAvailable;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error loading release info: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _updateApp() async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _distributionManager.updateApp();
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('App updated successfully')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error updating app: $e')),
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
           title: Text('App Distribution Demo'),
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : SingleChildScrollView(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       'Current Version:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_releaseInfo['version'] ?? 'Unknown'),
                     SizedBox(height: 16),
                     Text(
                       'Release Notes:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_releaseInfo['notes'] ?? 'No release notes available'),
                     SizedBox(height: 16),
                     Text(
                       'Build Number:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_releaseInfo['buildNumber']?.toString() ?? 'Unknown'),
                     SizedBox(height: 24),
                     if (_updateAvailable)
                       Center(
                         child: ElevatedButton(
                           onPressed: _updateApp,
                           child: Text('Update Available - Tap to Update'),
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

1. **Tester Management**

   ```dart
   class TesterManagementService {
     final DistributionService _distributionService = DistributionService();

     Future<List<String>> getTesterGroups() async {
       return await _distributionService.getTesterGroups();
     }

     Future<void> addTesterToGroup(String email, String group) async {
       // Implementation depends on Firebase App Distribution API
     }

     Future<void> removeTesterFromGroup(String email, String group) async {
       // Implementation depends on Firebase App Distribution API
     }
   }
   ```

2. **Release Management**

   ```dart
   class ReleaseManagementService {
     final DistributionService _distributionService = DistributionService();

     Future<void> createRelease(String version, String notes) async {
       // Implementation depends on Firebase App Distribution API
     }

     Future<void> updateReleaseNotes(String version, String notes) async {
       // Implementation depends on Firebase App Distribution API
     }

     Future<void> deleteRelease(String version) async {
       // Implementation depends on Firebase App Distribution API
     }
   }
   ```

3. **Feedback Collection**

   ```dart
   class FeedbackService {
     final DistributionService _distributionService = DistributionService();

     Future<void> submitFeedback(String feedback) async {
       // Implementation depends on Firebase App Distribution API
     }

     Future<List<Map<String, dynamic>>> getFeedback() async {
       // Implementation depends on Firebase App Distribution API
       return [];
     }
   }
   ```

## Best Practices

1. **Distribution Management**

   - Manage testers
   - Track versions
   - Update notes
   - Monitor feedback

2. **Release Process**

   - Version control
   - Release notes
   - Testing process
   - Feedback loop

3. **Performance**
   - Optimize updates
   - Handle errors
   - Monitor usage
   - Set limits

## Common Use Cases

1. **App Testing**

   - Beta testing
   - User feedback
   - Bug reporting
   - Feature testing

2. **Release Management**

   - Version control
   - Release notes
   - Update process
   - Feedback collection

3. **Tester Management**
   - Group management
   - Access control
   - Communication
   - Feedback tracking

## Conclusion

Implementing Firebase App Distribution in your Flutter application provides a powerful solution for distributing pre-release versions to testers. By following these guidelines and implementing the provided examples, you can create an efficient distribution system that helps you manage your app's testing and release process.
