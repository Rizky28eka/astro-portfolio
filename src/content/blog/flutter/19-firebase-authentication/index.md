---
title: "Firebase Authentication in Flutter"
summary: "Secure user authentication"
date: "2024, 04, 03"
tags: ["flutter", "firebase", "authentication", "security"]
difficulty: "medium"
draft: false
---

## Firebase Authentication in Flutter

Firebase Authentication provides a complete authentication system for your Flutter applications. This guide will show you how to implement various authentication methods using Firebase.

## Why Use Firebase Authentication?

Firebase Authentication offers several benefits:

- Multiple sign-in methods
- Secure authentication
- Easy integration
- User management
- Cross-platform support
- Real-time updates
- Cost-effective

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_auth: ^4.15.3
     google_sign_in: ^6.1.6
     flutter_facebook_auth: ^6.0.3
     sign_in_with_apple: ^5.0.0
   ```

2. **Configure Firebase**

   Android (android/app/src/main/AndroidManifest.xml):

   ```xml
   <manifest>
     <uses-permission android:name="android.permission.INTERNET"/>
   </manifest>
   ```

   iOS (ios/Runner/Info.plist):

   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>fb[YOUR_FACEBOOK_APP_ID]</string>
       </array>
     </dict>
   </array>
   ```

3. **Create Authentication Service**

   ```dart
   class AuthService {
     final FirebaseAuth _auth = FirebaseAuth.instance;
     final GoogleSignIn _googleSignIn = GoogleSignIn();
     final FacebookAuth _facebookAuth = FacebookAuth.instance;

     // Email & Password Authentication
     Future<UserCredential?> signInWithEmailAndPassword(
       String email,
       String password,
     ) async {
       try {
         return await _auth.signInWithEmailAndPassword(
           email: email,
           password: password,
         );
       } catch (e) {
         print('Error signing in: $e');
         return null;
       }
     }

     Future<UserCredential?> createUserWithEmailAndPassword(
       String email,
       String password,
     ) async {
       try {
         return await _auth.createUserWithEmailAndPassword(
           email: email,
           password: password,
         );
       } catch (e) {
         print('Error creating user: $e');
         return null;
       }
     }

     // Google Sign-In
     Future<UserCredential?> signInWithGoogle() async {
       try {
         final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
         if (googleUser == null) return null;

         final GoogleSignInAuthentication googleAuth =
             await googleUser.authentication;

         final credential = GoogleAuthProvider.credential(
           accessToken: googleAuth.accessToken,
           idToken: googleAuth.idToken,
         );

         return await _auth.signInWithCredential(credential);
       } catch (e) {
         print('Error signing in with Google: $e');
         return null;
       }
     }

     // Facebook Sign-In
     Future<UserCredential?> signInWithFacebook() async {
       try {
         final LoginResult result = await _facebookAuth.login();
         if (result.status != LoginStatus.success) return null;

         final AccessToken accessToken = result.accessToken!;
         final OAuthCredential credential =
             FacebookAuthProvider.credential(accessToken.token);

         return await _auth.signInWithCredential(credential);
       } catch (e) {
         print('Error signing in with Facebook: $e');
         return null;
       }
     }

     // Apple Sign-In
     Future<UserCredential?> signInWithApple() async {
       try {
         final appleCredential = await SignInWithApple.getAppleIDCredential(
           scopes: [
             AppleIDAuthorizationScopes.email,
             AppleIDAuthorizationScopes.fullName,
           ],
         );

         final oauthCredential = OAuthProvider('apple.com').credential(
           idToken: appleCredential.identityToken,
           accessToken: appleCredential.authorizationCode,
         );

         return await _auth.signInWithCredential(oauthCredential);
       } catch (e) {
         print('Error signing in with Apple: $e');
         return null;
       }
     }

     // Sign Out
     Future<void> signOut() async {
       await Future.wait([
         _auth.signOut(),
         _googleSignIn.signOut(),
         _facebookAuth.logOut(),
       ]);
     }

     // Get Current User
     User? get currentUser => _auth.currentUser;

     // Stream of Auth State Changes
     Stream<User?> get authStateChanges => _auth.authStateChanges();
   }
   ```

4. **Create Authentication Manager**

   ```dart
   class AuthManager {
     final AuthService _authService = AuthService();

     Future<User?> signInWithEmailAndPassword(
       String email,
       String password,
     ) async {
       final credential = await _authService.signInWithEmailAndPassword(
         email,
         password,
       );
       return credential?.user;
     }

     Future<User?> createUserWithEmailAndPassword(
       String email,
       String password,
     ) async {
       final credential = await _authService.createUserWithEmailAndPassword(
         email,
         password,
       );
       return credential?.user;
     }

     Future<User?> signInWithGoogle() async {
       final credential = await _authService.signInWithGoogle();
       return credential?.user;
     }

     Future<User?> signInWithFacebook() async {
       final credential = await _authService.signInWithFacebook();
       return credential?.user;
     }

     Future<User?> signInWithApple() async {
       final credential = await _authService.signInWithApple();
       return credential?.user;
     }

     Future<void> signOut() async {
       await _authService.signOut();
     }

     User? get currentUser => _authService.currentUser;

     Stream<User?> get authStateChanges => _authService.authStateChanges;
   }
   ```

5. **Create Authentication UI**

   ```dart
   class AuthScreen extends StatefulWidget {
     @override
     _AuthScreenState createState() => _AuthScreenState();
   }

   class _AuthScreenState extends State<AuthScreen> {
     final AuthManager _authManager = AuthManager();
     final _formKey = GlobalKey<FormState>();
     final _emailController = TextEditingController();
     final _passwordController = TextEditingController();
     bool _isLoading = false;
     bool _isSignUp = false;

     Future<void> _handleEmailPasswordAuth() async {
       if (!_formKey.currentState!.validate()) return;

       setState(() {
         _isLoading = true;
       });

       try {
         final user = _isSignUp
             ? await _authManager.createUserWithEmailAndPassword(
                 _emailController.text,
                 _passwordController.text,
               )
             : await _authManager.signInWithEmailAndPassword(
                 _emailController.text,
                 _passwordController.text,
               );

         if (user != null) {
           Navigator.pushReplacement(
             context,
             MaterialPageRoute(builder: (context) => HomeScreen()),
           );
         }
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text(e.toString())),
         );
       } finally {
         setState(() {
           _isLoading = false;
         });
       }
     }

     Future<void> _handleGoogleSignIn() async {
       setState(() {
         _isLoading = true;
       });

       try {
         final user = await _authManager.signInWithGoogle();
         if (user != null) {
           Navigator.pushReplacement(
             context,
             MaterialPageRoute(builder: (context) => HomeScreen()),
           );
         }
       } catch (e) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text(e.toString())),
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
           title: Text(_isSignUp ? 'Sign Up' : 'Sign In'),
         ),
         body: SingleChildScrollView(
           padding: EdgeInsets.all(16),
           child: Form(
             key: _formKey,
             child: Column(
               crossAxisAlignment: CrossAxisAlignment.stretch,
               children: [
                 TextFormField(
                   controller: _emailController,
                   decoration: InputDecoration(
                     labelText: 'Email',
                     border: OutlineInputBorder(),
                   ),
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Please enter your email';
                     }
                     return null;
                   },
                 ),
                 SizedBox(height: 16),
                 TextFormField(
                   controller: _passwordController,
                   decoration: InputDecoration(
                     labelText: 'Password',
                     border: OutlineInputBorder(),
                   ),
                   obscureText: true,
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Please enter your password';
                     }
                     return null;
                   },
                 ),
                 SizedBox(height: 16),
                 ElevatedButton(
                   onPressed: _isLoading ? null : _handleEmailPasswordAuth,
                   child: _isLoading
                       ? CircularProgressIndicator()
                       : Text(_isSignUp ? 'Sign Up' : 'Sign In'),
                 ),
                 SizedBox(height: 16),
                 TextButton(
                   onPressed: () {
                     setState(() {
                       _isSignUp = !_isSignUp;
                     });
                   },
                   child: Text(_isSignUp
                       ? 'Already have an account? Sign In'
                       : 'Don\'t have an account? Sign Up'),
                 ),
                 SizedBox(height: 16),
                 Divider(),
                 SizedBox(height: 16),
                 ElevatedButton.icon(
                   onPressed: _isLoading ? null : _handleGoogleSignIn,
                   icon: Icon(Icons.g_mobiledata),
                   label: Text('Sign in with Google'),
                 ),
               ],
             ),
           ),
         ),
       );
     }
   }
   ```

## Advanced Features

1. **Password Reset**

   ```dart
   class PasswordResetService {
     final FirebaseAuth _auth = FirebaseAuth.instance;

     Future<void> sendPasswordResetEmail(String email) async {
       try {
         await _auth.sendPasswordResetEmail(email: email);
       } catch (e) {
         print('Error sending password reset email: $e');
         rethrow;
       }
     }
   }
   ```

2. **Email Verification**

   ```dart
   class EmailVerificationService {
     final FirebaseAuth _auth = FirebaseAuth.instance;

     Future<void> sendEmailVerification() async {
       try {
         await _auth.currentUser?.sendEmailVerification();
       } catch (e) {
         print('Error sending email verification: $e');
         rethrow;
       }
     }

     Future<void> reloadUser() async {
       try {
         await _auth.currentUser?.reload();
       } catch (e) {
         print('Error reloading user: $e');
         rethrow;
       }
     }
   }
   ```

3. **Phone Authentication**

   ```dart
   class PhoneAuthService {
     final FirebaseAuth _auth = FirebaseAuth.instance;

     Future<void> verifyPhoneNumber({
       required String phoneNumber,
       required Function(PhoneAuthCredential) onVerificationCompleted,
       required Function(FirebaseAuthException) onVerificationFailed,
       required Function(String, int?) onCodeSent,
       required Function(String) onCodeAutoRetrievalTimeout,
     }) async {
       await _auth.verifyPhoneNumber(
         phoneNumber: phoneNumber,
         verificationCompleted: onVerificationCompleted,
         verificationFailed: onVerificationFailed,
         codeSent: onCodeSent,
         codeAutoRetrievalTimeout: onCodeAutoRetrievalTimeout,
       );
     }

     Future<UserCredential> signInWithCredential(
       PhoneAuthCredential credential,
     ) async {
       return await _auth.signInWithCredential(credential);
     }
   }
   ```

## Best Practices

1. **Security**

   - Implement proper validation
   - Handle sensitive data
   - Use secure storage
   - Implement proper error handling

2. **User Experience**

   - Provide clear feedback
   - Handle edge cases
   - Implement proper loading states
   - Maintain session state

3. **Error Handling**
   - Handle network errors
   - Validate user input
   - Provide meaningful error messages
   - Implement retry mechanisms

## Common Use Cases

1. **User Management**

   - User registration
   - User login
   - Password reset
   - Email verification

2. **Social Authentication**

   - Google Sign-In
   - Facebook Login
   - Apple Sign-In
   - Twitter Authentication

3. **Security Features**
   - Session management
   - Token refresh
   - Account linking
   - Multi-factor authentication

## Conclusion

Implementing Firebase Authentication in your Flutter application provides a secure and reliable way to handle user authentication. By following these guidelines and implementing the provided examples, you can create a robust authentication system that supports multiple sign-in methods and ensures the security of your users' data.
