---
title: "Firebase Dynamic Links in Flutter"
summary: "Create and handle dynamic links"
date: "2024, 04, 11"
tags: ["flutter", "firebase", "dynamic-links", "deep-linking"]
difficulty: "medium"
draft: false
---

## Firebase Dynamic Links in Flutter

Firebase Dynamic Links are smart URLs that can change behavior dynamically based on the platform and context. This guide will show you how to implement dynamic links in your Flutter applications.

## Why Use Firebase Dynamic Links?

Firebase Dynamic Links offers several benefits:

- Cross-platform support
- Deep linking
- App installation tracking
- Analytics integration
- Custom parameters
- Fallback URLs
- Free link solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_dynamic_links: ^5.4.8
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

3. **Create Dynamic Links Service**

   ```dart
   class DynamicLinksService {
     final FirebaseDynamicLinks _dynamicLinks = FirebaseDynamicLinks.instance;

     // Create Dynamic Link
     Future<String> createDynamicLink({
       required String link,
       String? title,
       String? description,
       String? imageUrl,
     }) async {
       try {
         final parameters = DynamicLinkParameters(
           uriPrefix: 'https://yourapp.page.link',
           link: Uri.parse(link),
           androidParameters: AndroidParameters(
             packageName: 'com.example.app',
             minimumVersion: 1,
           ),
           iosParameters: IOSParameters(
             bundleId: 'com.example.app',
             minimumVersion: '1.0.0',
           ),
           socialMetaTagParameters: SocialMetaTagParameters(
             title: title,
             description: description,
             imageUrl: imageUrl != null ? Uri.parse(imageUrl) : null,
           ),
         );

         final shortLink = await _dynamicLinks.buildShortLink(parameters);
         return shortLink.shortUrl.toString();
       } catch (e) {
         print('Error creating dynamic link: $e');
         rethrow;
       }
     }

     // Handle Incoming Links
     Future<Uri?> handleIncomingLinks() async {
       try {
         final initialLink = await _dynamicLinks.getInitialLink();
         return initialLink?.link;
       } catch (e) {
         print('Error handling incoming links: $e');
         return null;
       }
     }

     // Listen to Incoming Links
     Stream<Uri> listenToIncomingLinks() {
       return _dynamicLinks.onLink.map((event) => event.link);
     }

     // Get Link Parameters
     Map<String, String> getLinkParameters(Uri link) {
       return link.queryParameters;
     }

     // Create Short Link
     Future<String> createShortLink(String longLink) async {
       try {
         final parameters = DynamicLinkParameters(
           uriPrefix: 'https://yourapp.page.link',
           link: Uri.parse(longLink),
         );

         final shortLink = await _dynamicLinks.buildShortLink(parameters);
         return shortLink.shortUrl.toString();
       } catch (e) {
         print('Error creating short link: $e');
         rethrow;
       }
     }
   }
   ```

4. **Create Dynamic Links Manager**

   ```dart
   class DynamicLinksManager {
     final DynamicLinksService _dynamicLinksService = DynamicLinksService();

     // Create Share Link
     Future<String> createShareLink(String contentId) async {
       final link = 'https://yourapp.com/share?content=$contentId';
       return await _dynamicLinksService.createDynamicLink(
         link: link,
         title: 'Check out this content!',
         description: 'Shared from MyApp',
       );
     }

     // Create Invite Link
     Future<String> createInviteLink(String userId) async {
       final link = 'https://yourapp.com/invite?user=$userId';
       return await _dynamicLinksService.createDynamicLink(
         link: link,
         title: 'Join me on MyApp!',
         description: 'Invitation from MyApp',
       );
     }

     // Create Content Link
     Future<String> createContentLink(String contentId) async {
       final link = 'https://yourapp.com/content?id=$contentId';
       return await _dynamicLinksService.createDynamicLink(
         link: link,
         title: 'View this content',
         description: 'Content from MyApp',
       );
     }

     // Handle Incoming Link
     Future<Map<String, dynamic>> handleIncomingLink() async {
       final link = await _dynamicLinksService.handleIncomingLinks();
       if (link != null) {
         return _dynamicLinksService.getLinkParameters(link);
       }
       return {};
     }

     // Listen to Links
     Stream<Map<String, dynamic>> listenToLinks() {
       return _dynamicLinksService
           .listenToIncomingLinks()
           .map((link) => _dynamicLinksService.getLinkParameters(link));
     }
   }
   ```

5. **Create Dynamic Links UI**

   ```dart
   class DynamicLinksScreen extends StatefulWidget {
     @override
     _DynamicLinksScreenState createState() => _DynamicLinksScreenState();
   }

   class _DynamicLinksScreenState extends State<DynamicLinksScreen> {
     final DynamicLinksManager _dynamicLinksManager = DynamicLinksManager();
     bool _isLoading = false;
     String _generatedLink = '';
     Map<String, dynamic> _incomingLink = {};

     @override
     void initState() {
       super.initState();
       _handleIncomingLink();
       _setupLinkListener();
     }

     Future<void> _handleIncomingLink() async {
       final link = await _dynamicLinksManager.handleIncomingLink();
       setState(() {
         _incomingLink = link;
       });
     }

     void _setupLinkListener() {
       _dynamicLinksManager.listenToLinks().listen((link) {
         setState(() {
           _incomingLink = link;
         });
       });
     }

     Future<void> _createShareLink() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final link = await _dynamicLinksManager.createShareLink('123');
         setState(() {
           _generatedLink = link;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error creating share link: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _createInviteLink() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final link = await _dynamicLinksManager.createInviteLink('user123');
         setState(() {
           _generatedLink = link;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error creating invite link: $e')),
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
           title: Text('Dynamic Links Demo'),
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : SingleChildScrollView(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       'Generated Link:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_generatedLink),
                     SizedBox(height: 16),
                     Text(
                       'Incoming Link Parameters:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     Text(_incomingLink.toString()),
                     SizedBox(height: 24),
                     Center(
                       child: Column(
                         children: [
                           ElevatedButton(
                             onPressed: _createShareLink,
                             child: Text('Create Share Link'),
                           ),
                           SizedBox(height: 16),
                           ElevatedButton(
                             onPressed: _createInviteLink,
                             child: Text('Create Invite Link'),
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

1. **Link Analytics**

   ```dart
   class LinkAnalyticsService {
     final DynamicLinksService _dynamicLinksService = DynamicLinksService();

     Future<Map<String, dynamic>> getLinkAnalytics(String link) async {
       // Implementation depends on Firebase Analytics API
       return {};
     }

     Future<void> trackLinkClick(String link) async {
       // Implementation depends on Firebase Analytics API
     }

     Future<void> trackLinkConversion(String link) async {
       // Implementation depends on Firebase Analytics API
     }
   }
   ```

2. **Link Management**

   ```dart
   class LinkManagementService {
     final DynamicLinksService _dynamicLinksService = DynamicLinksService();

     Future<void> updateLink(String link, Map<String, dynamic> parameters) async {
       // Implementation depends on Firebase Dynamic Links API
     }

     Future<void> deleteLink(String link) async {
       // Implementation depends on Firebase Dynamic Links API
     }

     Future<List<Map<String, dynamic>>> getLinkHistory() async {
       // Implementation depends on Firebase Dynamic Links API
       return [];
     }
   }
   ```

3. **Link Validation**

   ```dart
   class LinkValidationService {
     final DynamicLinksService _dynamicLinksService = DynamicLinksService();

     Future<bool> validateLink(String link) async {
       // Implementation depends on Firebase Dynamic Links API
       return true;
     }

     Future<bool> isLinkExpired(String link) async {
       // Implementation depends on Firebase Dynamic Links API
       return false;
     }

     Future<bool> isLinkValid(String link) async {
       // Implementation depends on Firebase Dynamic Links API
       return true;
     }
   }
   ```

## Best Practices

1. **Link Creation**

   - Use meaningful parameters
   - Set proper fallbacks
   - Handle errors
   - Monitor usage

2. **Link Handling**

   - Validate links
   - Handle deep links
   - Process parameters
   - Track analytics

3. **Performance**
   - Optimize creation
   - Handle errors
   - Monitor impact
   - Set limits

## Common Use Cases

1. **App Sharing**

   - Content sharing
   - User invites
   - Feature sharing
   - Promotion links

2. **Deep Linking**

   - Content navigation
   - Feature access
   - User onboarding
   - Campaign tracking

3. **Analytics**
   - Link tracking
   - Conversion tracking
   - User behavior
   - Campaign analysis

## Conclusion

Implementing Firebase Dynamic Links in your Flutter application provides powerful deep linking and sharing capabilities. By following these guidelines and implementing the provided examples, you can create a robust dynamic linking system that enhances user engagement and app discoverability.
