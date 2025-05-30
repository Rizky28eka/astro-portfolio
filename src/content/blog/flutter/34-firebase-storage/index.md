---
title: "Firebase Storage in Flutter"
summary: "Store and serve files"
date: "2024, 04, 18"
tags: ["flutter", "firebase", "storage", "files"]
difficulty: "medium"
draft: false
---

## Firebase Storage in Flutter

Firebase Storage provides secure file storage and serving capabilities for your Flutter applications. This guide will show you how to implement file storage and retrieval using Firebase Storage.

## Why Use Firebase Storage?

Firebase Storage offers several benefits:

- Secure file storage
- Easy file serving
- Real-time updates
- File metadata
- Access control
- CDN integration
- Free storage solution

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_storage: ^11.6.0
     image_picker: ^1.0.7
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
   </manifest>
   ```

3. **Create Storage Service**

   ```dart
   class StorageService {
     final FirebaseStorage _storage = FirebaseStorage.instance;

     // Upload File
     Future<String> uploadFile(File file, String path) async {
       try {
         final ref = _storage.ref().child(path);
         final uploadTask = ref.putFile(file);
         final snapshot = await uploadTask;
         return await snapshot.ref.getDownloadURL();
       } catch (e) {
         print('Error uploading file: $e');
         rethrow;
       }
     }

     // Download File
     Future<File> downloadFile(String path, String localPath) async {
       try {
         final ref = _storage.ref().child(path);
         final file = File(localPath);
         await ref.writeToFile(file);
         return file;
       } catch (e) {
         print('Error downloading file: $e');
         rethrow;
       }
     }

     // Delete File
     Future<void> deleteFile(String path) async {
       try {
         final ref = _storage.ref().child(path);
         await ref.delete();
       } catch (e) {
         print('Error deleting file: $e');
         rethrow;
       }
     }

     // Get File Metadata
     Future<Map<String, dynamic>> getFileMetadata(String path) async {
       try {
         final ref = _storage.ref().child(path);
         final metadata = await ref.getMetadata();
         return {
           'name': metadata.name,
           'size': metadata.size,
           'contentType': metadata.contentType,
           'timeCreated': metadata.timeCreated,
           'updated': metadata.updated,
         };
       } catch (e) {
         print('Error getting file metadata: $e');
         rethrow;
       }
     }

     // List Files
     Future<List<String>> listFiles(String path) async {
       try {
         final ref = _storage.ref().child(path);
         final result = await ref.listAll();
         return result.items.map((item) => item.fullPath).toList();
       } catch (e) {
         print('Error listing files: $e');
         rethrow;
       }
     }
   }
   ```

4. **Create Storage Manager**

   ```dart
   class StorageManager {
     final StorageService _storageService = StorageService();

     // Upload Image
     Future<String> uploadImage(File image, String path) async {
       return await _storageService.uploadFile(image, path);
     }

     // Upload Video
     Future<String> uploadVideo(File video, String path) async {
       return await _storageService.uploadFile(video, path);
     }

     // Upload Document
     Future<String> uploadDocument(File document, String path) async {
       return await _storageService.uploadFile(document, path);
     }

     // Download File
     Future<File> downloadFile(String path, String localPath) async {
       return await _storageService.downloadFile(path, localPath);
     }

     // Delete File
     Future<void> deleteFile(String path) async {
       await _storageService.deleteFile(path);
     }

     // Get File Metadata
     Future<Map<String, dynamic>> getFileMetadata(String path) async {
       return await _storageService.getFileMetadata(path);
     }

     // List Files
     Future<List<String>> listFiles(String path) async {
       return await _storageService.listFiles(path);
     }
   }
   ```

5. **Create Storage UI**

   ```dart
   class StorageScreen extends StatefulWidget {
     @override
     _StorageScreenState createState() => _StorageScreenState();
   }

   class _StorageScreenState extends State<StorageScreen> {
     final StorageManager _storageManager = StorageManager();
     final ImagePicker _picker = ImagePicker();
     bool _isLoading = false;
     String _uploadedFileUrl = '';
     List<String> _files = [];
     Map<String, dynamic> _fileMetadata = {};

     @override
     void initState() {
       super.initState();
       _loadFiles();
     }

     Future<void> _loadFiles() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final files = await _storageManager.listFiles('uploads');
         setState(() {
           _files = files;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error loading files: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _pickAndUploadImage() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final image = await _picker.pickImage(source: ImageSource.gallery);
         if (image != null) {
           final file = File(image.path);
           final url = await _storageManager.uploadImage(
             file,
             'uploads/${DateTime.now().millisecondsSinceEpoch}.jpg',
           );
           setState(() {
             _uploadedFileUrl = url;
           });
           await _loadFiles();
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('Image uploaded successfully')),
           );
         }
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error uploading image: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _getFileMetadata(String path) async {
       setState(() {
         _isLoading = true;
       });

       try {
         final metadata = await _storageManager.getFileMetadata(path);
         setState(() {
           _fileMetadata = metadata;
         });
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error getting file metadata: $e')),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _deleteFile(String path) async {
       setState(() {
         _isLoading = true;
       });

       try {
         await _storageManager.deleteFile(path);
         await _loadFiles();
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('File deleted successfully')),
         );
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error deleting file: $e')),
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
           title: Text('Firebase Storage Demo'),
         ),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : SingleChildScrollView(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       'Storage Actions:',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 24),
                     Center(
                       child: ElevatedButton(
                         onPressed: _pickAndUploadImage,
                         child: Text('Upload Image'),
                       ),
                     ),
                     if (_uploadedFileUrl.isNotEmpty) ...[
                       SizedBox(height: 16),
                       Text('Uploaded File URL: $_uploadedFileUrl'),
                     ],
                     SizedBox(height: 24),
                     Text(
                       'Files:',
                       style: Theme.of(context).textTheme.titleMedium,
                     ),
                     SizedBox(height: 8),
                     ListView.builder(
                       shrinkWrap: true,
                       physics: NeverScrollableScrollPhysics(),
                       itemCount: _files.length,
                       itemBuilder: (context, index) {
                         final file = _files[index];
                         return ListTile(
                           title: Text(file),
                           trailing: Row(
                             mainAxisSize: MainAxisSize.min,
                             children: [
                               IconButton(
                                 icon: Icon(Icons.info),
                                 onPressed: () => _getFileMetadata(file),
                               ),
                               IconButton(
                                 icon: Icon(Icons.delete),
                                 onPressed: () => _deleteFile(file),
                               ),
                             ],
                           ),
                         );
                       },
                     ),
                     if (_fileMetadata.isNotEmpty) ...[
                       SizedBox(height: 16),
                       Text(
                         'File Metadata:',
                         style: Theme.of(context).textTheme.titleMedium,
                       ),
                       SizedBox(height: 8),
                       Text(_fileMetadata.toString()),
                     ],
                   ],
                 ),
               ),
       );
     }
   }
   ```

## Advanced Features

1. **File Compression**

   ```dart
   class FileCompressionService {
     final FirebaseStorage _storage = FirebaseStorage.instance;

     Future<String> uploadCompressedImage(File image, String path) async {
       try {
         // Implement image compression logic here
         final compressedFile = await compressImage(image);
         final ref = _storage.ref().child(path);
         final uploadTask = ref.putFile(compressedFile);
         final snapshot = await uploadTask;
         return await snapshot.ref.getDownloadURL();
       } catch (e) {
         print('Error uploading compressed image: $e');
         rethrow;
       }
     }

     Future<File> compressImage(File file) async {
       // Implement image compression logic here
       return file;
     }
   }
   ```

2. **File Encryption**

   ```dart
   class FileEncryptionService {
     final FirebaseStorage _storage = FirebaseStorage.instance;

     Future<String> uploadEncryptedFile(File file, String path) async {
       try {
         // Implement file encryption logic here
         final encryptedFile = await encryptFile(file);
         final ref = _storage.ref().child(path);
         final uploadTask = ref.putFile(encryptedFile);
         final snapshot = await uploadTask;
         return await snapshot.ref.getDownloadURL();
       } catch (e) {
         print('Error uploading encrypted file: $e');
         rethrow;
       }
     }

     Future<File> encryptFile(File file) async {
       // Implement file encryption logic here
       return file;
     }
   }
   ```

3. **File Resumable Upload**

   ```dart
   class ResumableUploadService {
     final FirebaseStorage _storage = FirebaseStorage.instance;

     Future<String> uploadFileWithResume(File file, String path) async {
       try {
         final ref = _storage.ref().child(path);
         final uploadTask = ref.putFile(
           file,
           SettableMetadata(
             contentType: 'application/octet-stream',
           ),
         );

         uploadTask.snapshotEvents.listen((TaskSnapshot snapshot) {
           final progress = snapshot.bytesTransferred / snapshot.totalBytes;
           print('Upload progress: ${(progress * 100).toStringAsFixed(2)}%');
         });

         final snapshot = await uploadTask;
         return await snapshot.ref.getDownloadURL();
       } catch (e) {
         print('Error uploading file with resume: $e');
         rethrow;
       }
     }
   }
   ```

## Best Practices

1. **File Management**

   - File naming
   - Path structure
   - Access control
   - Cleanup policy

2. **Implementation**

   - Error handling
   - Progress tracking
   - Retry logic
   - Security rules

3. **User Experience**
   - Upload progress
   - Error feedback
   - File preview
   - Download options

## Common Use Cases

1. **Media Storage**

   - Images
   - Videos
   - Audio files
   - Documents

2. **User Content**

   - Profile pictures
   - User uploads
   - Shared files
   - Attachments

3. **App Assets**
   - Static files
   - Configuration
   - Templates
   - Resources

## Conclusion

Implementing Firebase Storage in your Flutter application provides powerful file storage and serving capabilities. By following these guidelines and implementing the provided examples, you can create an effective storage system that securely manages your app's files.
