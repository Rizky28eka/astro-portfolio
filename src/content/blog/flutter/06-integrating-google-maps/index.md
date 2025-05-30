---
title: "Integrate Google Maps in Flutter"
summary: "Show locations on interactive map"
date: "2024, 03, 25"
tags: ["flutter", "maps", "google-maps", "location"]
difficulty: "medium"
draft: false
---

## Integrate Google Maps in Flutter

Google Maps integration in Flutter allows you to add powerful mapping capabilities to your application. This guide will show you how to implement and customize Google Maps in your Flutter app.

## Why Use Google Maps?

Google Maps offers several advantages:

- Rich mapping features
- Real-time location tracking
- Custom markers and overlays
- Geocoding capabilities
- Route planning

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     google_maps_flutter: ^latest_version
     location: ^latest_version
   ```

2. **Configure Platform Settings**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <application>
       <meta-data
         android:name="com.google.android.geo.API_KEY"
         android:value="YOUR_API_KEY"/>
     </application>
   </manifest>
   ```

   iOS (ios/Runner/AppDelegate.swift):

   ```swift
   import UIKit
   import Flutter
   import GoogleMaps

   @UIApplicationMain
   @objc class AppDelegate: FlutterAppDelegate {
     override func application(
       _ application: UIApplication,
       didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
     ) -> Bool {
       GMSServices.provideAPIKey("YOUR_API_KEY")
       GeneratedPluginRegistrant.register(with: self)
       return super.application(application, didFinishLaunchingWithOptions: launchOptions)
     }
   }
   ```

3. **Basic Map Implementation**

   ```dart
   class MapScreen extends StatefulWidget {
     @override
     _MapScreenState createState() => _MapScreenState();
   }

   class _MapScreenState extends State<MapScreen> {
     GoogleMapController? mapController;
     final Set<Marker> markers = {};
     final LatLng _center = const LatLng(45.521563, -122.677433);

     void _onMapCreated(GoogleMapController controller) {
       mapController = controller;
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(title: Text('Google Maps')),
         body: GoogleMap(
           onMapCreated: _onMapCreated,
           initialCameraPosition: CameraPosition(
             target: _center,
             zoom: 11.0,
           ),
           markers: markers,
         ),
       );
     }
   }
   ```

## Advanced Features

1. **Custom Markers**

   ```dart
   void _addMarker(LatLng position) {
     setState(() {
       markers.add(
         Marker(
           markerId: MarkerId(position.toString()),
           position: position,
           infoWindow: InfoWindow(
             title: 'Custom Marker',
             snippet: 'This is a custom marker',
           ),
           icon: BitmapDescriptor.defaultMarkerWithHue(
             BitmapDescriptor.hueViolet,
           ),
         ),
       );
     });
   }
   ```

2. **Current Location**

   ```dart
   Future<void> _getCurrentLocation() async {
     Location location = Location();
     LocationData locationData = await location.getLocation();

     setState(() {
       mapController?.animateCamera(
         CameraUpdate.newCameraPosition(
           CameraPosition(
             target: LatLng(
               locationData.latitude!,
               locationData.longitude!,
             ),
             zoom: 15,
           ),
         ),
       );
     });
   }
   ```

3. **Polylines for Routes**

   ```dart
   Set<Polyline> polylines = {};

   void _drawRoute(List<LatLng> points) {
     setState(() {
       polylines.add(
         Polyline(
           polylineId: PolylineId('route'),
           points: points,
           color: Colors.blue,
           width: 5,
         ),
       );
     });
   }
   ```

## Best Practices

1. **Performance Optimization**

   - Use marker clustering for many markers
   - Implement proper caching
   - Optimize map loading
   - Handle memory efficiently

2. **User Experience**

   - Add loading indicators
   - Handle errors gracefully
   - Provide clear feedback
   - Implement proper permissions

3. **Security**
   - Secure API key usage
   - Implement proper access control
   - Handle location permissions
   - Protect user data

## Common Use Cases

1. **Location-Based Services**

   - Find nearby places
   - Show user location
   - Display points of interest
   - Track movement

2. **Navigation Features**

   - Show routes
   - Calculate distances
   - Provide directions
   - Display traffic

3. **Custom Map Features**
   - Custom markers
   - Info windows
   - Map overlays
   - Custom styling

## Conclusion

Google Maps integration provides powerful mapping capabilities to your Flutter application. By following these guidelines and implementing the provided examples, you can create feature-rich mapping solutions that enhance your app's functionality and user experience.
