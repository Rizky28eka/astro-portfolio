---
title: "Integrating In-App Purchase in Flutter"
summary: "Monetize your app features"
date: "2024, 04, 01"
tags: ["flutter", "in-app-purchase", "monetization", "revenue"]
difficulty: "advanced"
draft: false
---

## Integrating In-App Purchase in Flutter

Implementing in-app purchases in Flutter allows you to monetize your application by offering premium features, subscriptions, or digital content. This guide will show you how to integrate in-app purchases using the `in_app_purchase` package.

## Why Implement In-App Purchases?

In-app purchases offer several advantages:

- Generate revenue
- Offer premium features
- Provide subscription services
- Sell digital content
- Implement freemium model
- Create recurring revenue
- Monetize user base

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     in_app_purchase: ^3.1.13
     in_app_purchase_android: ^0.3.8
     in_app_purchase_storekit: ^0.3.8
   ```

2. **Configure Platform Settings**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="com.android.vending.BILLING" />
   </manifest>
   ```

   iOS (ios/Runner/Info.plist):

   ```xml
   <key>StoreKit</key>
   <array>
     <dict>
       <key>SKPaymentQueue</key>
       <true/>
     </dict>
   </array>
   ```

3. **Create Purchase Service**

   ```dart
   class PurchaseService {
     final InAppPurchase _inAppPurchase = InAppPurchase.instance;
     final List<String> _productIds = [
       'premium_feature',
       'monthly_subscription',
       'yearly_subscription',
     ];

     Stream<List<PurchaseDetails>> get purchaseStream =>
         _inAppPurchase.purchaseStream;

     Future<bool> get isAvailable => _inAppPurchase.isAvailable();

     Future<List<ProductDetails>> loadProducts() async {
       final ProductDetailsResponse response =
           await _inAppPurchase.queryProductDetails(_productIds.toSet());

       if (response.notFoundIDs.isNotEmpty) {
         print('Products not found: ${response.notFoundIDs}');
       }

       if (response.error != null) {
         print('Error loading products: ${response.error}');
         return [];
       }

       return response.productDetails;
     }

     Future<bool> buyProduct(ProductDetails product) async {
       final PurchaseParam purchaseParam =
           PurchaseParam(productDetails: product);

       try {
         return await _inAppPurchase.buyNonConsumable(
           purchaseParam: purchaseParam,
         );
       } catch (e) {
         print('Error purchasing product: $e');
         return false;
       }
     }

     Future<bool> buySubscription(ProductDetails product) async {
       final PurchaseParam purchaseParam =
           PurchaseParam(productDetails: product);

       try {
         return await _inAppPurchase.buyConsumable(
           purchaseParam: purchaseParam,
         );
       } catch (e) {
         print('Error purchasing subscription: $e');
         return false;
       }
     }

     Future<void> restorePurchases() async {
       try {
         await _inAppPurchase.restorePurchases();
       } catch (e) {
         print('Error restoring purchases: $e');
       }
     }
   }
   ```

4. **Create Purchase Manager**

   ```dart
   class PurchaseManager {
     final PurchaseService _purchaseService = PurchaseService();
     List<ProductDetails> _products = [];
     List<PurchaseDetails> _purchases = [];

     Future<void> initialize() async {
       if (await _purchaseService.isAvailable) {
         _products = await _purchaseService.loadProducts();
         _listenToPurchaseUpdates();
       }
     }

     void _listenToPurchaseUpdates() {
       _purchaseService.purchaseStream.listen(
         (purchaseDetailsList) {
           _handlePurchaseUpdates(purchaseDetailsList);
         },
         onDone: () {
           print('Purchase stream closed');
         },
         onError: (error) {
           print('Error in purchase stream: $error');
         },
       );
     }

     void _handlePurchaseUpdates(List<PurchaseDetails> purchaseDetailsList) {
       for (final purchaseDetails in purchaseDetailsList) {
         if (purchaseDetails.status == PurchaseStatus.pending) {
           _handlePendingPurchase(purchaseDetails);
         } else if (purchaseDetails.status == PurchaseStatus.error) {
           _handleErrorPurchase(purchaseDetails);
         } else if (purchaseDetails.status == PurchaseStatus.purchased ||
                    purchaseDetails.status == PurchaseStatus.restored) {
           _handleSuccessfulPurchase(purchaseDetails);
         }
       }
     }

     void _handlePendingPurchase(PurchaseDetails purchaseDetails) {
       // Show loading indicator
     }

     void _handleErrorPurchase(PurchaseDetails purchaseDetails) {
       // Show error message
       print('Error: ${purchaseDetails.error}');
     }

     void _handleSuccessfulPurchase(PurchaseDetails purchaseDetails) {
       // Update app state
       _purchases.add(purchaseDetails);
       _verifyPurchase(purchaseDetails);
     }

     Future<void> _verifyPurchase(PurchaseDetails purchaseDetails) async {
       // Implement server-side verification
     }

     Future<bool> buyProduct(String productId) async {
       final product = _products.firstWhere(
         (p) => p.id == productId,
         orElse: () => throw Exception('Product not found'),
       );

       return await _purchaseService.buyProduct(product);
     }

     Future<bool> buySubscription(String productId) async {
       final product = _products.firstWhere(
         (p) => p.id == productId,
         orElse: () => throw Exception('Product not found'),
       );

       return await _purchaseService.buySubscription(product);
     }

     Future<void> restorePurchases() async {
       await _purchaseService.restorePurchases();
     }
   }
   ```

5. **Create Purchase UI**

   ```dart
   class PurchaseScreen extends StatefulWidget {
     @override
     _PurchaseScreenState createState() => _PurchaseScreenState();
   }

   class _PurchaseScreenState extends State<PurchaseScreen> {
     final PurchaseManager _purchaseManager = PurchaseManager();
     List<ProductDetails> _products = [];
     bool _isLoading = true;

     @override
     void initState() {
       super.initState();
       _initializePurchases();
     }

     Future<void> _initializePurchases() async {
       await _purchaseManager.initialize();
       setState(() {
         _products = _purchaseManager._products;
         _isLoading = false;
       });
     }

     @override
     Widget build(BuildContext context) {
       if (_isLoading) {
         return Center(child: CircularProgressIndicator());
       }

       return Scaffold(
         appBar: AppBar(
           title: Text('Premium Features'),
           actions: [
             IconButton(
               icon: Icon(Icons.restore),
               onPressed: () => _purchaseManager.restorePurchases(),
             ),
           ],
         ),
         body: ListView.builder(
           itemCount: _products.length,
           itemBuilder: (context, index) {
             final product = _products[index];
             return ListTile(
               title: Text(product.title),
               subtitle: Text(product.description),
               trailing: ElevatedButton(
                 onPressed: () => _purchaseProduct(product),
                 child: Text(product.price),
               ),
             );
           },
         ),
       );
     }

     Future<void> _purchaseProduct(ProductDetails product) async {
       try {
         final success = await _purchaseManager.buyProduct(product.id);
         if (success) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('Purchase successful')),
           );
         }
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error: $e')),
         );
       }
     }
   }
   ```

## Advanced Features

1. **Subscription Management**

   ```dart
   class SubscriptionManager {
     final PurchaseManager _purchaseManager = PurchaseManager();

     Future<bool> isSubscribed() async {
       // Check subscription status
       return false;
     }

     Future<void> cancelSubscription() async {
       // Implement subscription cancellation
     }

     Future<void> updateSubscription() async {
       // Handle subscription updates
     }
   }
   ```

2. **Receipt Validation**

   ```dart
   class ReceiptValidator {
     Future<bool> validateReceipt(PurchaseDetails purchase) async {
       // Implement server-side validation
       return true;
     }

     Future<void> verifyPurchase(PurchaseDetails purchase) async {
       // Verify purchase with server
     }
   }
   ```

3. **Analytics Integration**

   ```dart
   class PurchaseAnalytics {
     void trackPurchase(PurchaseDetails purchase) {
       // Track purchase events
     }

     void trackSubscription(ProductDetails subscription) {
       // Track subscription events
     }
   }
   ```

## Best Practices

1. **Purchase Flow**

   - Implement proper error handling
   - Show loading indicators
   - Provide clear feedback
   - Handle edge cases

2. **Security**

   - Validate purchases server-side
   - Secure payment information
   - Handle sensitive data
   - Follow platform guidelines

3. **User Experience**
   - Clear pricing information
   - Easy purchase process
   - Restore purchases option
   - Subscription management

## Common Use Cases

1. **Premium Features**

   - Unlock advanced features
   - Remove advertisements
   - Access premium content
   - Enable additional functionality

2. **Subscriptions**

   - Monthly subscriptions
   - Yearly subscriptions
   - Premium membership
   - Content access

3. **Digital Content**
   - In-app currency
   - Virtual goods
   - Digital products
   - Premium content

## Conclusion

Implementing in-app purchases in Flutter provides a powerful way to monetize your application. By following these guidelines and implementing the provided examples, you can create a robust in-app purchase system that generates revenue while providing value to your users.
