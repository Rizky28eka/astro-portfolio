---
title: "Integrate Camera Functionality"
summary: "Capture photos with device camera"
date: "2025, 03, 30"
tags: ["flutter", "camera", "image-capture", "permissions", "ui"]
difficulty: "medium"
draft: false
---

## Integrate Camera Functionality

Adding camera functionality to your Flutter app allows users to capture photos and videos directly within your application. This tutorial will guide you through implementing a feature-rich camera interface with various options and controls.

## Features

- Camera preview
- Photo capture
- Video recording
- Flash control
- Camera switching
- Focus control
- Image saving
- Permission handling

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     camera: ^0.10.5+9
     path_provider: ^2.1.2
     path: ^1.8.3
     permission_handler: ^11.2.0
     provider: ^6.1.1
   ```

2. **Configure Platform Settings**

   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <manifest ...>
     <uses-permission android:name="android.permission.CAMERA" />
     <uses-feature android:name="android.hardware.camera" />
     <uses-feature android:name="android.hardware.camera.autofocus" />
   </manifest>
   ```

   ```xml
   <!-- ios/Runner/Info.plist -->
   <dict>
     <key>NSCameraUsageDescription</key>
     <string>This app needs camera access to take photos</string>
     <key>NSMicrophoneUsageDescription</key>
     <string>This app needs microphone access for video recording</string>
   </dict>
   ```

3. **Create Camera Service**

   ```dart
   class CameraService {
     CameraController? _controller;
     List<CameraDescription>? _cameras;
     bool _isInitialized = false;

     CameraController? get controller => _controller;
     List<CameraDescription>? get cameras => _cameras;
     bool get isInitialized => _isInitialized;

     Future<void> initialize() async {
       _cameras = await availableCameras();
       if (_cameras == null || _cameras!.isEmpty) {
         throw Exception('No cameras available');
       }

       _controller = CameraController(
         _cameras![0],
         ResolutionPreset.high,
         enableAudio: true,
       );

       await _controller!.initialize();
       _isInitialized = true;
     }

     Future<void> switchCamera() async {
       if (_cameras == null || _cameras!.length < 2) return;

       final currentIndex = _cameras!.indexOf(_controller!.description);
       final newIndex = (currentIndex + 1) % _cameras!.length;

       _controller = CameraController(
         _cameras![newIndex],
         ResolutionPreset.high,
         enableAudio: true,
       );

       await _controller!.initialize();
     }

     Future<void> setFlashMode(FlashMode mode) async {
       if (_controller == null || !_isInitialized) return;
       await _controller!.setFlashMode(mode);
     }

     Future<String?> takePicture() async {
       if (_controller == null || !_isInitialized) return null;

       try {
         final XFile photo = await _controller!.takePicture();
         return photo.path;
       } catch (e) {
         print('Error taking picture: $e');
         return null;
       }
     }

     Future<String?> startVideoRecording() async {
       if (_controller == null || !_isInitialized) return null;

       try {
         await _controller!.startVideoRecording();
         return null;
       } catch (e) {
         print('Error starting video recording: $e');
         return null;
       }
     }

     Future<String?> stopVideoRecording() async {
       if (_controller == null || !_isInitialized) return null;

       try {
         final XFile video = await _controller!.stopVideoRecording();
         return video.path;
       } catch (e) {
         print('Error stopping video recording: $e');
         return null;
       }
     }

     void dispose() {
       _controller?.dispose();
     }
   }
   ```

4. **Create Camera Provider**

   ```dart
   class CameraProvider extends ChangeNotifier {
     final CameraService _cameraService;
     bool _isRecording = false;
     String? _lastCapturedPath;
     FlashMode _flashMode = FlashMode.off;

     CameraProvider({required CameraService cameraService})
         : _cameraService = cameraService;

     CameraController? get controller => _cameraService.controller;
     bool get isRecording => _isRecording;
     String? get lastCapturedPath => _lastCapturedPath;
     FlashMode get flashMode => _flashMode;

     Future<void> initialize() async {
       await _cameraService.initialize();
       notifyListeners();
     }

     Future<void> switchCamera() async {
       await _cameraService.switchCamera();
       notifyListeners();
     }

     Future<void> setFlashMode(FlashMode mode) async {
       await _cameraService.setFlashMode(mode);
       _flashMode = mode;
       notifyListeners();
     }

     Future<void> takePicture() async {
       final path = await _cameraService.takePicture();
       if (path != null) {
         _lastCapturedPath = path;
         notifyListeners();
       }
     }

     Future<void> startRecording() async {
       final error = await _cameraService.startVideoRecording();
       if (error == null) {
         _isRecording = true;
         notifyListeners();
       }
     }

     Future<void> stopRecording() async {
       final path = await _cameraService.stopVideoRecording();
       _isRecording = false;
       if (path != null) {
         _lastCapturedPath = path;
       }
       notifyListeners();
     }

     @override
     void dispose() {
       _cameraService.dispose();
       super.dispose();
     }
   }
   ```

5. **Create Camera Widgets**

   ```dart
   class CameraPreviewWidget extends StatelessWidget {
     final CameraController controller;
     final bool isRecording;

     const CameraPreviewWidget({
       required this.controller,
       this.isRecording = false,
     });

     @override
     Widget build(BuildContext context) {
       return Stack(
         children: [
           CameraPreview(controller),
           if (isRecording)
             Positioned(
               top: 16,
               right: 16,
               child: Container(
                 padding: EdgeInsets.all(8),
                 decoration: BoxDecoration(
                   color: Colors.red.withOpacity(0.8),
                   borderRadius: BorderRadius.circular(8),
                 ),
                 child: Row(
                   children: [
                     Icon(Icons.fiber_manual_record, color: Colors.white),
                     SizedBox(width: 8),
                     Text(
                       'Recording',
                       style: TextStyle(color: Colors.white),
                     ),
                   ],
                 ),
               ),
             ),
         ],
       );
     }
   }

   class CameraControls extends StatelessWidget {
     final VoidCallback onCapture;
     final VoidCallback onSwitchCamera;
     final Function(FlashMode) onFlashModeChanged;
     final bool isRecording;
     final VoidCallback onRecordStart;
     final VoidCallback onRecordStop;

     const CameraControls({
       required this.onCapture,
       required this.onSwitchCamera,
       required this.onFlashModeChanged,
       required this.isRecording,
       required this.onRecordStart,
       required this.onRecordStop,
     });

     @override
     Widget build(BuildContext context) {
       return Container(
         padding: EdgeInsets.all(16),
         child: Row(
           mainAxisAlignment: MainAxisAlignment.spaceEvenly,
           children: [
             IconButton(
               icon: Icon(Icons.flash_auto),
               onPressed: () {
                 onFlashModeChanged(FlashMode.auto);
               },
             ),
             IconButton(
               icon: Icon(
                 isRecording ? Icons.stop : Icons.fiber_manual_record,
                 color: isRecording ? Colors.red : Colors.white,
                 size: 48,
               ),
               onPressed: isRecording ? onRecordStop : onRecordStart,
             ),
             IconButton(
               icon: Icon(Icons.camera),
               onPressed: onCapture,
             ),
             IconButton(
               icon: Icon(Icons.flip_camera_ios),
               onPressed: onSwitchCamera,
             ),
           ],
         ),
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class CameraScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: Consumer<CameraProvider>(
           builder: (context, provider, child) {
             if (provider.controller == null) {
               return Center(
                 child: CircularProgressIndicator(),
               );
             }

             return Stack(
               children: [
                 CameraPreviewWidget(
                   controller: provider.controller!,
                   isRecording: provider.isRecording,
                 ),
                 Positioned(
                   bottom: 0,
                   left: 0,
                   right: 0,
                   child: CameraControls(
                     onCapture: () => provider.takePicture(),
                     onSwitchCamera: () => provider.switchCamera(),
                     onFlashModeChanged: (mode) => provider.setFlashMode(mode),
                     isRecording: provider.isRecording,
                     onRecordStart: () => provider.startRecording(),
                     onRecordStop: () => provider.stopRecording(),
                   ),
                 ),
               ],
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance**

   - Handle camera lifecycle
   - Manage resources
   - Optimize preview
   - Handle orientation

2. **User Experience**

   - Show loading states
   - Provide feedback
   - Handle errors
   - Support gestures

3. **Security**

   - Request permissions
   - Handle sensitive data
   - Secure storage
   - Validate input

4. **Testing**
   - Test permissions
   - Verify capture
   - Check recording
   - Test edge cases

## Conclusion

This tutorial has shown you how to implement camera functionality in Flutter with features like:

- Photo capture
- Video recording
- Camera switching
- Flash control
- Permission handling

You can extend this implementation by adding:

- Image filters
- Video trimming
- Slow motion
- Time-lapse
- AR features

Remember to:

- Handle permissions properly
- Test on multiple devices
- Consider performance
- Follow platform guidelines
- Keep dependencies updated

This implementation provides a solid foundation for adding camera functionality to your Flutter app.
