---
title: "Image Picker with Cropping Feature"
summary: "Choose and edit user images"
date: "2025, 04, 01"
tags: ["flutter", "image-picker", "image-cropping", "ui", "permissions"]
difficulty: "medium"
draft: false
---

## Image Picker with Cropping Feature

Implementing an image picker with cropping functionality in Flutter allows users to select and edit images from their device. This tutorial will guide you through building a feature-rich image picker with cropping capabilities.

## Features

- Image selection from gallery
- Camera capture
- Image cropping
- Aspect ratio control
- Image compression
- Preview functionality
- Multiple image selection
- Custom crop shapes

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     image_picker: ^1.0.7
     image_cropper: ^5.0.1
     path_provider: ^2.1.2
     permission_handler: ^11.2.0
     provider: ^6.1.1
     path: ^1.8.3
   ```

2. **Configure Platform Settings**

   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <manifest ...>
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
     <uses-permission android:name="android.permission.CAMERA" />
   </manifest>
   ```

   ```xml
   <!-- ios/Runner/Info.plist -->
   <dict>
     <key>NSPhotoLibraryUsageDescription</key>
     <string>This app needs access to photo library to select images</string>
     <key>NSCameraUsageDescription</key>
     <string>This app needs camera access to take photos</string>
   </dict>
   ```

3. **Create Image Service**

   ```dart
   class ImageService {
     final ImagePicker _picker = ImagePicker();
     final ImageCropper _cropper = ImageCropper();

     Future<XFile?> pickImage({
       required ImageSource source,
       int? maxWidth,
       int? maxHeight,
       int? imageQuality,
     }) async {
       try {
         final XFile? image = await _picker.pickImage(
           source: source,
           maxWidth: maxWidth,
           maxHeight: maxHeight,
           imageQuality: imageQuality,
         );
         return image;
       } catch (e) {
         print('Error picking image: $e');
         return null;
       }
     }

     Future<List<XFile>> pickMultiImage({
       int? maxWidth,
       int? maxHeight,
       int? imageQuality,
     }) async {
       try {
         final List<XFile> images = await _picker.pickMultiImage(
           maxWidth: maxWidth,
           maxHeight: maxHeight,
           imageQuality: imageQuality,
         );
         return images;
       } catch (e) {
         print('Error picking multiple images: $e');
         return [];
       }
     }

     Future<CroppedFile?> cropImage({
       required String imagePath,
       CropAspectRatio? aspectRatio,
       List<CropAspectRatioPreset>? aspectRatioPresets,
       CropStyle cropStyle = CropStyle.rectangle,
     }) async {
       try {
         final CroppedFile? croppedFile = await _cropper.cropImage(
           sourcePath: imagePath,
           aspectRatio: aspectRatio,
           aspectRatioPresets: aspectRatioPresets,
           cropStyle: cropStyle,
           compressFormat: ImageCompressFormat.jpg,
           compressQuality: 90,
           uiSettings: [
             AndroidUiSettings(
               toolbarTitle: 'Crop Image',
               toolbarColor: Colors.black,
               toolbarWidgetColor: Colors.white,
               initAspectRatio: CropAspectRatioPreset.original,
               lockAspectRatio: false,
             ),
             IOSUiSettings(
               title: 'Crop Image',
               aspectRatioPresets: [
                 CropAspectRatioPreset.square,
                 CropAspectRatioPreset.original,
                 CropAspectRatioPreset.ratio3x2,
                 CropAspectRatioPreset.ratio4x3,
                 CropAspectRatioPreset.ratio16x9,
               ],
             ),
           ],
         );
         return croppedFile;
       } catch (e) {
         print('Error cropping image: $e');
         return null;
       }
     }

     Future<String?> saveImage(String imagePath) async {
       try {
         final directory = await getApplicationDocumentsDirectory();
         final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
         final savedPath = '${directory.path}/$fileName';
         await File(imagePath).copy(savedPath);
         return savedPath;
       } catch (e) {
         print('Error saving image: $e');
         return null;
       }
     }
   }
   ```

4. **Create Image Provider**

   ```dart
   class ImageProvider extends ChangeNotifier {
     final ImageService _imageService;
     List<String> _selectedImages = [];
     bool _isLoading = false;
     String? _error;

     ImageProvider({required ImageService imageService})
         : _imageService = imageService;

     List<String> get selectedImages => _selectedImages;
     bool get isLoading => _isLoading;
     String? get error => _error;

     Future<void> pickAndCropImage(ImageSource source) async {
       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         final XFile? image = await _imageService.pickImage(
           source: source,
           maxWidth: 1920,
           maxHeight: 1080,
           imageQuality: 85,
         );

         if (image != null) {
           final CroppedFile? croppedFile = await _imageService.cropImage(
             imagePath: image.path,
             aspectRatioPresets: [
               CropAspectRatioPreset.square,
               CropAspectRatioPreset.original,
               CropAspectRatioPreset.ratio3x2,
               CropAspectRatioPreset.ratio4x3,
               CropAspectRatioPreset.ratio16x9,
             ],
           );

           if (croppedFile != null) {
             final savedPath = await _imageService.saveImage(croppedFile.path);
             if (savedPath != null) {
               _selectedImages.add(savedPath);
             }
           }
         }
       } catch (e) {
         _error = e.toString();
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }

     Future<void> pickMultipleImages() async {
       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         final List<XFile> images = await _imageService.pickMultiImage(
           maxWidth: 1920,
           maxHeight: 1080,
           imageQuality: 85,
         );

         for (final image in images) {
           final CroppedFile? croppedFile = await _imageService.cropImage(
             imagePath: image.path,
             aspectRatioPresets: [
               CropAspectRatioPreset.square,
               CropAspectRatioPreset.original,
               CropAspectRatioPreset.ratio3x2,
               CropAspectRatioPreset.ratio4x3,
               CropAspectRatioPreset.ratio16x9,
             ],
           );

           if (croppedFile != null) {
             final savedPath = await _imageService.saveImage(croppedFile.path);
             if (savedPath != null) {
               _selectedImages.add(savedPath);
             }
           }
         }
       } catch (e) {
         _error = e.toString();
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }

     void removeImage(String path) {
       _selectedImages.remove(path);
       notifyListeners();
     }

     void clearImages() {
       _selectedImages.clear();
       notifyListeners();
     }
   }
   ```

5. **Create Image Widgets**

   ```dart
   class ImagePickerButton extends StatelessWidget {
     final VoidCallback onGalleryTap;
     final VoidCallback onCameraTap;

     const ImagePickerButton({
       required this.onGalleryTap,
       required this.onCameraTap,
     });

     @override
     Widget build(BuildContext context) {
       return Row(
         mainAxisAlignment: MainAxisAlignment.spaceEvenly,
         children: [
           ElevatedButton.icon(
             onPressed: onGalleryTap,
             icon: Icon(Icons.photo_library),
             label: Text('Gallery'),
           ),
           ElevatedButton.icon(
             onPressed: onCameraTap,
             icon: Icon(Icons.camera_alt),
             label: Text('Camera'),
           ),
         ],
       );
     }
   }

   class ImagePreview extends StatelessWidget {
     final String imagePath;
     final VoidCallback onRemove;

     const ImagePreview({
       required this.imagePath,
       required this.onRemove,
     });

     @override
     Widget build(BuildContext context) {
       return Stack(
         children: [
           Container(
             width: 200,
             height: 200,
             decoration: BoxDecoration(
               borderRadius: BorderRadius.circular(8),
               image: DecorationImage(
                 image: FileImage(File(imagePath)),
                 fit: BoxFit.cover,
               ),
             ),
           ),
           Positioned(
             top: 8,
             right: 8,
             child: IconButton(
               icon: Icon(Icons.close, color: Colors.white),
               onPressed: onRemove,
             ),
           ),
         ],
       );
     }
   }

   class ImageGrid extends StatelessWidget {
     final List<String> images;
     final Function(String) onRemove;

     const ImageGrid({
       required this.images,
       required this.onRemove,
     });

     @override
     Widget build(BuildContext context) {
       return GridView.builder(
         shrinkWrap: true,
         physics: NeverScrollableScrollPhysics(),
         gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
           crossAxisCount: 3,
           crossAxisSpacing: 8,
           mainAxisSpacing: 8,
         ),
         itemCount: images.length,
         itemBuilder: (context, index) {
           return ImagePreview(
             imagePath: images[index],
             onRemove: () => onRemove(images[index]),
           );
         },
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class ImagePickerScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Image Picker'),
         ),
         body: Consumer<ImageProvider>(
           builder: (context, provider, child) {
             if (provider.isLoading) {
               return Center(
                 child: CircularProgressIndicator(),
               );
             }

             if (provider.error != null) {
               return Center(
                 child: Text(provider.error!),
               );
             }

             return SingleChildScrollView(
               padding: EdgeInsets.all(16),
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.stretch,
                 children: [
                   ImagePickerButton(
                     onGalleryTap: () => provider.pickAndCropImage(
                       ImageSource.gallery,
                     ),
                     onCameraTap: () => provider.pickAndCropImage(
                       ImageSource.camera,
                     ),
                   ),
                   SizedBox(height: 16),
                   ElevatedButton.icon(
                     onPressed: provider.pickMultipleImages,
                     icon: Icon(Icons.photo_library),
                     label: Text('Pick Multiple Images'),
                   ),
                   SizedBox(height: 24),
                   if (provider.selectedImages.isNotEmpty) ...[
                     Text(
                       'Selected Images',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 16),
                     ImageGrid(
                       images: provider.selectedImages,
                       onRemove: provider.removeImage,
                     ),
                     SizedBox(height: 16),
                     ElevatedButton(
                       onPressed: provider.clearImages,
                       child: Text('Clear All'),
                       style: ElevatedButton.styleFrom(
                         backgroundColor: Colors.red,
                         foregroundColor: Colors.white,
                       ),
                     ),
                   ],
                 ],
               ),
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance**

   - Optimize image size
   - Handle memory
   - Cache images
   - Compress when needed

2. **User Experience**

   - Show loading states
   - Provide feedback
   - Handle errors
   - Support gestures

3. **Security**

   - Request permissions
   - Validate files
   - Handle sensitive data
   - Secure storage

4. **Testing**
   - Test permissions
   - Verify cropping
   - Check compression
   - Test edge cases

## Conclusion

This tutorial has shown you how to implement an image picker with cropping functionality in Flutter with features like:

- Image selection
- Camera capture
- Image cropping
- Multiple selection
- Preview functionality

You can extend this implementation by adding:

- Image filters
- Custom crop shapes
- Batch processing
- Image editing
- Cloud storage

Remember to:

- Handle permissions properly
- Test on multiple devices
- Consider performance
- Follow platform guidelines
- Keep dependencies updated

This implementation provides a solid foundation for adding image picking and cropping functionality to your Flutter app.
