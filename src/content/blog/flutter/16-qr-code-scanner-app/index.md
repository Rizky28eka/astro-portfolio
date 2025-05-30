---
title: "QR Code Scanner App"
summary: "Scan and display QR data"
date: "2024, 03, 31"
tags: ["flutter", "qr-code", "scanner", "camera"]
difficulty: "medium"
draft: false
---

## QR Code Scanner App

Building a QR code scanner app in Flutter allows you to create applications that can read and process QR codes. This guide will show you how to implement a fully functional QR code scanner with additional features.

## Why Build a QR Code Scanner?

QR code scanning offers several advantages:

- Quick data access
- Contactless interaction
- Easy information sharing
- Business applications
- Inventory management
- Event ticketing
- Payment processing

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     mobile_scanner: ^3.5.6
     permission_handler: ^11.1.0
     flutter_svg: ^2.0.9
   ```

2. **Request Camera Permissions**

   ```dart
   class PermissionService {
     Future<bool> requestCameraPermission() async {
       final status = await Permission.camera.request();
       return status.isGranted;
     }

     Future<bool> checkCameraPermission() async {
       final status = await Permission.camera.status;
       return status.isGranted;
     }
   }
   ```

3. **Create Scanner Screen**

   ```dart
   class QRScannerScreen extends StatefulWidget {
     @override
     _QRScannerScreenState createState() => _QRScannerScreenState();
   }

   class _QRScannerScreenState extends State<QRScannerScreen> {
     final MobileScannerController controller = MobileScannerController();
     final PermissionService _permissionService = PermissionService();
     bool _hasPermission = false;

     @override
     void initState() {
       super.initState();
       _checkPermission();
     }

     Future<void> _checkPermission() async {
       final hasPermission = await _permissionService.checkCameraPermission();
       if (!hasPermission) {
         final granted = await _permissionService.requestCameraPermission();
         setState(() {
           _hasPermission = granted;
         });
       } else {
         setState(() {
           _hasPermission = true;
         });
       }
     }

     @override
     Widget build(BuildContext context) {
       if (!_hasPermission) {
         return Scaffold(
           body: Center(
             child: Column(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                 Text('Camera permission is required'),
                 ElevatedButton(
                   onPressed: _checkPermission,
                   child: Text('Grant Permission'),
                 ),
               ],
             ),
           ),
         );
       }

       return Scaffold(
         appBar: AppBar(
           title: Text('QR Scanner'),
           actions: [
             IconButton(
               icon: ValueListenableBuilder(
                 valueListenable: controller.torchState,
                 builder: (context, state, child) {
                   switch (state) {
                     case TorchState.off:
                       return Icon(Icons.flash_off);
                     case TorchState.on:
                       return Icon(Icons.flash_on);
                   }
                 },
               ),
               onPressed: () => controller.toggleTorch(),
             ),
             IconButton(
               icon: ValueListenableBuilder(
                 valueListenable: controller.cameraFacingState,
                 builder: (context, state, child) {
                   switch (state) {
                     case CameraFacing.front:
                       return Icon(Icons.camera_front);
                     case CameraFacing.back:
                       return Icon(Icons.camera_rear);
                   }
                 },
               ),
               onPressed: () => controller.switchCamera(),
             ),
           ],
         ),
         body: MobileScanner(
           controller: controller,
           onDetect: (capture) {
             final List<Barcode> barcodes = capture.barcodes;
             for (final barcode in barcodes) {
               _handleBarcode(barcode);
             }
           },
         ),
       );
     }

     void _handleBarcode(Barcode barcode) {
       if (barcode.rawValue == null) return;

       // Handle different barcode types
       switch (barcode.type) {
         case BarcodeType.qrCode:
           _processQRCode(barcode.rawValue!);
           break;
         case BarcodeType.barcode:
           _processBarcode(barcode.rawValue!);
           break;
         default:
           print('Unsupported barcode type');
       }
     }

     void _processQRCode(String value) {
       // Process QR code data
       print('QR Code: $value');
       // Show result dialog or navigate to result screen
       _showResultDialog(value);
     }

     void _processBarcode(String value) {
       // Process barcode data
       print('Barcode: $value');
       // Show result dialog or navigate to result screen
       _showResultDialog(value);
     }

     void _showResultDialog(String value) {
       showDialog(
         context: context,
         builder: (context) => AlertDialog(
           title: Text('Scan Result'),
           content: Text(value),
           actions: [
             TextButton(
               onPressed: () => Navigator.pop(context),
               child: Text('Close'),
             ),
             TextButton(
               onPressed: () {
                 // Copy to clipboard
                 Clipboard.setData(ClipboardData(text: value));
                 Navigator.pop(context);
                 ScaffoldMessenger.of(context).showSnackBar(
                   SnackBar(content: Text('Copied to clipboard')),
                 );
               },
               child: Text('Copy'),
             ),
           ],
         ),
       );
     }

     @override
     void dispose() {
       controller.dispose();
       super.dispose();
     }
   }
   ```

4. **Create Result Screen**

   ```dart
   class ScanResultScreen extends StatelessWidget {
     final String result;

     ScanResultScreen({required this.result});

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Scan Result'),
         ),
         body: Padding(
           padding: EdgeInsets.all(16),
           child: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text(
                 'Scanned Data:',
                 style: TextStyle(
                   fontSize: 18,
                   fontWeight: FontWeight.bold,
                 ),
               ),
               SizedBox(height: 8),
               Text(result),
               SizedBox(height: 16),
               ElevatedButton(
                 onPressed: () {
                   Clipboard.setData(ClipboardData(text: result));
                   ScaffoldMessenger.of(context).showSnackBar(
                     SnackBar(content: Text('Copied to clipboard')),
                   );
                 },
                 child: Text('Copy to Clipboard'),
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

## Advanced Features

1. **Custom Scanner Overlay**

   ```dart
   class ScannerOverlay extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Stack(
         children: [
           Container(
             color: Colors.black.withOpacity(0.5),
           ),
           Center(
             child: Container(
               width: 250,
               height: 250,
               decoration: BoxDecoration(
                 border: Border.all(
                   color: Colors.white,
                   width: 2,
                 ),
                 borderRadius: BorderRadius.circular(12),
               ),
             ),
           ),
           Positioned(
             bottom: 50,
             left: 0,
             right: 0,
             child: Text(
               'Position QR code within the frame',
               textAlign: TextAlign.center,
               style: TextStyle(
                 color: Colors.white,
                 fontSize: 16,
               ),
             ),
           ),
         ],
       );
     }
   }
   ```

2. **History Management**

   ```dart
   class ScanHistory {
     final String data;
     final DateTime timestamp;
     final String type;

     ScanHistory({
       required this.data,
       required this.timestamp,
       required this.type,
     });
   }

   class HistoryManager {
     final List<ScanHistory> _history = [];

     void addToHistory(ScanHistory scan) {
       _history.add(scan);
     }

     List<ScanHistory> getHistory() {
       return List.from(_history);
     }

     void clearHistory() {
       _history.clear();
     }
   }
   ```

3. **QR Code Generation**

   ```dart
   class QRGenerator extends StatelessWidget {
     final String data;

     QRGenerator({required this.data});

     @override
     Widget build(BuildContext context) {
       return QrImageView(
         data: data,
         version: QrVersions.auto,
         size: 200.0,
         backgroundColor: Colors.white,
       );
     }
   }
   ```

## Best Practices

1. **User Experience**

   - Provide clear instructions
   - Show scanning feedback
   - Handle errors gracefully
   - Implement proper permissions

2. **Performance**

   - Optimize camera usage
   - Handle memory efficiently
   - Implement proper cleanup
   - Manage battery usage

3. **Security**
   - Validate scanned data
   - Handle sensitive information
   - Implement proper permissions
   - Follow privacy guidelines

## Common Use Cases

1. **Business Applications**

   - Inventory management
   - Asset tracking
   - Product information
   - Contact sharing

2. **Event Management**

   - Ticket validation
   - Attendee check-in
   - Event information
   - Access control

3. **Payment Processing**
   - Mobile payments
   - Transaction verification
   - Payment information
   - Receipt generation

## Conclusion

Building a QR code scanner app in Flutter provides a powerful tool for various applications. By following these guidelines and implementing the provided examples, you can create a robust and user-friendly QR code scanner that meets your specific needs.
