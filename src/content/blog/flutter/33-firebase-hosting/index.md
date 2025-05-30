---
title: "Firebase Hosting in Flutter"
summary: "Host your Flutter web app"
date: "2024, 04, 17"
tags: ["flutter", "firebase", "hosting", "web"]
difficulty: "medium"
draft: false
---

## Firebase Hosting in Flutter

Firebase Hosting provides fast and secure hosting for your Flutter web applications. This guide will show you how to deploy and host your Flutter web app using Firebase Hosting.

## Why Use Firebase Hosting?

Firebase Hosting offers several benefits:

- Fast content delivery
- Secure hosting
- Easy deployment
- Custom domains
- SSL certificates
- CDN integration
- Free hosting solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_hosting: ^0.1.0
   ```

2. **Configure Firebase**

   Create a `firebase.json` file in your project root:

   ```json
   {
     "hosting": {
       "public": "build/web",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "**/*.@(js|css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

3. **Create Hosting Service**

   ```dart
   class HostingService {
     final FirebaseHosting _hosting = FirebaseHosting.instance;

     // Get Hosting URL
     Future<String> getHostingUrl() async {
       try {
         final config = await _hosting.getConfig();
         return config['hosting']['site'];
       } catch (e) {
         print('Error getting hosting URL: $e');
         rethrow;
       }
     }

     // Get Deployment Status
     Future<Map<String, dynamic>> getDeploymentStatus() async {
       try {
         final status = await _hosting.getDeploymentStatus();
         return status;
       } catch (e) {
         print('Error getting deployment status: $e');
         rethrow;
       }
     }

     // Get Site Configuration
     Future<Map<String, dynamic>> getSiteConfig() async {
       try {
         final config = await _hosting.getConfig();
         return config;
       } catch (e) {
         print('Error getting site config: $e');
         rethrow;
       }
     }
   }
   ```

4. **Create Hosting Manager**

   ```dart
   class HostingManager {
     final HostingService _hostingService = HostingService();

     // Get Hosting URL
     Future<String> getHostingUrl() async {
       return await _hostingService.getHostingUrl();
     }

     // Get Deployment Status
     Future<Map<String, dynamic>> getDeploymentStatus() async {
       return await _hostingService.getDeploymentStatus();
     }

     // Get Site Configuration
     Future<Map<String, dynamic>> getSiteConfig() async {
       return await _hostingService.getSiteConfig();
     }
   }
   ```

5. **Create Hosting UI**

   ```dart
   class HostingScreen extends StatefulWidget {
     @override
     _HostingScreenState createState() => _HostingScreenState();
   }

   class _HostingScreenState extends State<HostingScreen> {
     final HostingManager _hostingManager = HostingManager();
     bool _isLoading = false;
     String _hostingUrl = '';
     Map<String, dynamic> _deploymentStatus = {};
     Map<String, dynamic> _siteConfig = {};

     @override
     void initState() {
       super.initState();
       _loadHostingInfo();
     }

     Future<void> _loadHostingInfo() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final url = await _hostingManager.getHostingUrl();
         final status = await _hostingManager.getDeploymentStatus();
         final config = await _hostingManager.getSiteConfig();

         setState(() {
           _hostingUrl = url;
           _deploymentStatus = status;
           _siteConfig = config;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error loading hosting info: $e')),
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
           title: Text('Firebase Hosting Demo'),
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : SingleChildScrollView(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       'Hosting Information:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 16),
                     Text('Hosting URL: $_hostingUrl'),
                     SizedBox(height: 16),
                     Text(
                       'Deployment Status:',
                       style: Theme.of(context).textTheme.titleMedium,
                     ),
                     SizedBox(height: 8),
                     Text(_deploymentStatus.toString()),
                     SizedBox(height: 16),
                     Text(
                       'Site Configuration:',
                       style: Theme.of(context).textTheme.titleMedium,
                     ),
                     SizedBox(height: 8),
                     Text(_siteConfig.toString()),
                   ],
                 ),
               ),
       );
     }
   }
   ```

## Advanced Features

1. **Custom Domain Configuration**

   ```dart
   class CustomDomainService {
     final FirebaseHosting _hosting = FirebaseHosting.instance;

     Future<void> addCustomDomain(String domain) async {
       try {
         await _hosting.addCustomDomain(domain);
       } catch (e) {
         print('Error adding custom domain: $e');
         rethrow;
       }
     }

     Future<void> removeCustomDomain(String domain) async {
       try {
         await _hosting.removeCustomDomain(domain);
       } catch (e) {
         print('Error removing custom domain: $e');
         rethrow;
       }
     }

     Future<List<String>> getCustomDomains() async {
       try {
         final domains = await _hosting.getCustomDomains();
         return List<String>.from(domains);
       } catch (e) {
         print('Error getting custom domains: $e');
         rethrow;
       }
     }
   }
   ```

2. **Deployment Management**

   ```dart
   class DeploymentService {
     final FirebaseHosting _hosting = FirebaseHosting.instance;

     Future<void> deploy(String path) async {
       try {
         await _hosting.deploy(path);
       } catch (e) {
         print('Error deploying: $e');
         rethrow;
       }
     }

     Future<void> rollback(String version) async {
       try {
         await _hosting.rollback(version);
       } catch (e) {
         print('Error rolling back: $e');
         rethrow;
       }
     }

     Future<List<Map<String, dynamic>>> getDeployments() async {
       try {
         final deployments = await _hosting.getDeployments();
         return List<Map<String, dynamic>>.from(deployments);
       } catch (e) {
         print('Error getting deployments: $e');
         rethrow;
       }
     }
   }
   ```

3. **Cache Control**

   ```dart
   class CacheControlService {
     final FirebaseHosting _hosting = FirebaseHosting.instance;

     Future<void> setCacheControl(String path, String value) async {
       try {
         await _hosting.setCacheControl(path, value);
       } catch (e) {
         print('Error setting cache control: $e');
         rethrow;
       }
     }

     Future<String> getCacheControl(String path) async {
       try {
         final control = await _hosting.getCacheControl(path);
         return control;
       } catch (e) {
         print('Error getting cache control: $e');
         rethrow;
       }
     }

     Future<void> clearCache(String path) async {
       try {
         await _hosting.clearCache(path);
       } catch (e) {
         print('Error clearing cache: $e');
         rethrow;
       }
     }
   }
   ```

## Best Practices

1. **Deployment**

   - Version control
   - Testing
   - Rollback plan
   - Monitoring

2. **Configuration**

   - Security rules
   - Cache settings
   - Domain setup
   - SSL certificates

3. **Performance**
   - Asset optimization
   - CDN usage
   - Cache strategy
   - Load balancing

## Common Use Cases

1. **Web Applications**

   - Single page apps
   - Progressive web apps
   - Static websites
   - Dynamic content

2. **Content Delivery**

   - Media files
   - Static assets
   - API endpoints
   - Documentation

3. **Microservices**
   - Backend services
   - API gateways
   - Webhooks
   - Serverless functions

## Conclusion

Implementing Firebase Hosting in your Flutter web application provides fast and secure hosting capabilities. By following these guidelines and implementing the provided examples, you can create an effective hosting solution that ensures your app is always available and performs well.
