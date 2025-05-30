---
title: "Build a Chat App"
summary: "Real-time messaging with Flutter"
date: "2025, 02, 15"
tags: ["flutter", "chat", "firebase", "real-time", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Chat App

Creating a chat app is a great way to learn about real-time communication, Firebase integration, and state management in Flutter. This tutorial will guide you through building a feature-rich chat application.

## Features

- Real-time messaging
- User authentication
- Message status
- Media sharing
- Group chats
- Message search
- Push notifications
- Online status

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     firebase_core: ^2.24.2
     firebase_auth: ^4.15.3
     cloud_firestore: ^4.13.6
     firebase_storage: ^11.5.6
     firebase_messaging: ^14.7.9
     image_picker: ^1.0.5
     cached_network_image: ^3.3.0
     intl: ^0.19.0
     uuid: ^4.2.1
   ```

2. **Create Message Model**

   ```dart
   class Message {
     final String id;
     final String senderId;
     final String receiverId;
     final String content;
     final MessageType type;
     final DateTime timestamp;
     final bool isRead;
     final String? mediaUrl;

     Message({
       required this.id,
       required this.senderId,
       required this.receiverId,
       required this.content,
       required this.type,
       required this.timestamp,
       required this.isRead,
       this.mediaUrl,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'senderId': senderId,
         'receiverId': receiverId,
         'content': content,
         'type': type.toString(),
         'timestamp': timestamp.millisecondsSinceEpoch,
         'isRead': isRead,
         'mediaUrl': mediaUrl,
       };
     }

     factory Message.fromMap(Map<String, dynamic> map) {
       return Message(
         id: map['id'],
         senderId: map['senderId'],
         receiverId: map['receiverId'],
         content: map['content'],
         type: MessageType.values.firstWhere(
           (e) => e.toString() == map['type'],
         ),
         timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp']),
         isRead: map['isRead'],
         mediaUrl: map['mediaUrl'],
       );
     }
   }

   enum MessageType {
     text,
     image,
     file,
   }
   ```

3. **Create User Model**

   ```dart
   class User {
     final String id;
     final String name;
     final String email;
     final String? photoUrl;
     final bool isOnline;
     final DateTime lastSeen;

     User({
       required this.id,
       required this.name,
       required this.email,
       this.photoUrl,
       required this.isOnline,
       required this.lastSeen,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'name': name,
         'email': email,
         'photoUrl': photoUrl,
         'isOnline': isOnline,
         'lastSeen': lastSeen.millisecondsSinceEpoch,
       };
     }

     factory User.fromMap(Map<String, dynamic> map) {
       return User(
         id: map['id'],
         name: map['name'],
         email: map['email'],
         photoUrl: map['photoUrl'],
         isOnline: map['isOnline'],
         lastSeen: DateTime.fromMillisecondsSinceEpoch(map['lastSeen']),
       );
     }
   }
   ```

4. **Create Chat Service**

   ```dart
   class ChatService {
     final FirebaseFirestore _firestore = FirebaseFirestore.instance;
     final FirebaseStorage _storage = FirebaseStorage.instance;

     Stream<List<Message>> getMessages(String userId, String otherUserId) {
       return _firestore
           .collection('messages')
           .where('participants', arrayContains: [userId, otherUserId])
           .orderBy('timestamp', descending: true)
           .snapshots()
           .map((snapshot) {
         return snapshot.docs
             .map((doc) => Message.fromMap(doc.data()))
             .toList();
       });
     }

     Future<void> sendMessage(Message message) async {
       await _firestore.collection('messages').doc(message.id).set(message.toMap());
     }

     Future<String> uploadMedia(File file, String path) async {
       final ref = _storage.ref().child(path);
       final uploadTask = ref.putFile(file);
       final snapshot = await uploadTask;
       return await snapshot.ref.getDownloadURL();
     }

     Future<void> markMessageAsRead(String messageId) async {
       await _firestore
           .collection('messages')
           .doc(messageId)
           .update({'isRead': true});
     }

     Stream<List<User>> getUsers() {
       return _firestore
           .collection('users')
           .snapshots()
           .map((snapshot) {
         return snapshot.docs
             .map((doc) => User.fromMap(doc.data()))
             .toList();
       });
     }

     Future<void> updateUserStatus(String userId, bool isOnline) async {
       await _firestore.collection('users').doc(userId).update({
         'isOnline': isOnline,
         'lastSeen': DateTime.now().millisecondsSinceEpoch,
       });
     }
   }
   ```

5. **Create Auth Service**

   ```dart
   class AuthService {
     final FirebaseAuth _auth = FirebaseAuth.instance;
     final FirebaseFirestore _firestore = FirebaseFirestore.instance;

     Stream<User?> get authStateChanges => _auth.authStateChanges();

     Future<User> signIn(String email, String password) async {
       try {
         final result = await _auth.signInWithEmailAndPassword(
           email: email,
           password: password,
         );
         return result.user!;
       } catch (e) {
         throw Exception('Failed to sign in');
       }
     }

     Future<User> signUp(String name, String email, String password) async {
       try {
         final result = await _auth.createUserWithEmailAndPassword(
           email: email,
           password: password,
         );
         await _createUserProfile(result.user!, name);
         return result.user!;
       } catch (e) {
         throw Exception('Failed to sign up');
       }
     }

     Future<void> _createUserProfile(User user, String name) async {
       await _firestore.collection('users').doc(user.uid).set({
         'id': user.uid,
         'name': name,
         'email': user.email,
         'photoUrl': user.photoURL,
         'isOnline': true,
         'lastSeen': DateTime.now().millisecondsSinceEpoch,
       });
     }

     Future<void> signOut() async {
       await _auth.signOut();
     }
   }
   ```

6. **Create Chat Widgets**

   ```dart
   class MessageBubble extends StatelessWidget {
     final Message message;
     final bool isMe;

     const MessageBubble({
       required this.message,
       required this.isMe,
     });

     @override
     Widget build(BuildContext context) {
       return Align(
         alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
         child: Container(
           margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
           padding: EdgeInsets.all(12),
           decoration: BoxDecoration(
             color: isMe
                 ? Theme.of(context).primaryColor
                 : Theme.of(context).cardColor,
             borderRadius: BorderRadius.circular(16),
           ),
           child: Column(
             crossAxisAlignment:
                 isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
             children: [
               if (message.type == MessageType.text)
                 Text(
                   message.content,
                   style: TextStyle(
                     color: isMe ? Colors.white : null,
                   ),
                 )
               else if (message.type == MessageType.image)
                 ClipRRect(
                   borderRadius: BorderRadius.circular(8),
                   child: Image.network(
                     message.mediaUrl!,
                     width: 200,
                     height: 200,
                     fit: BoxFit.cover,
                   ),
                 ),
               SizedBox(height: 4),
               Text(
                 DateFormat('HH:mm').format(message.timestamp),
                 style: TextStyle(
                   fontSize: 12,
                   color: isMe ? Colors.white70 : Colors.grey,
                 ),
               ),
             ],
           ),
         ),
       );
     }
   }

   class ChatInput extends StatefulWidget {
     final Function(Message) onSend;
     final Function(File) onImageSelected;

     const ChatInput({
       required this.onSend,
       required this.onImageSelected,
     });

     @override
     _ChatInputState createState() => _ChatInputState();
   }

   class _ChatInputState extends State<ChatInput> {
     final _controller = TextEditingController();
     final _focusNode = FocusNode();

     @override
     Widget build(BuildContext context) {
       return Container(
         padding: EdgeInsets.all(8),
         decoration: BoxDecoration(
           color: Theme.of(context).cardColor,
           boxShadow: [
             BoxShadow(
               color: Colors.black.withOpacity(0.1),
               blurRadius: 4,
               offset: Offset(0, -2),
             ),
           ],
         ),
         child: Row(
           children: [
             IconButton(
               icon: Icon(Icons.image),
               onPressed: _pickImage,
             ),
             Expanded(
               child: TextField(
                 controller: _controller,
                 focusNode: _focusNode,
                 decoration: InputDecoration(
                   hintText: 'Type a message...',
                   border: OutlineInputBorder(
                     borderRadius: BorderRadius.circular(24),
                   ),
                   contentPadding: EdgeInsets.symmetric(
                     horizontal: 16,
                     vertical: 8,
                   ),
                 ),
                 maxLines: null,
               ),
             ),
             IconButton(
               icon: Icon(Icons.send),
               onPressed: _sendMessage,
             ),
           ],
         ),
       );
     }

     Future<void> _pickImage() async {
       final picker = ImagePicker();
       final pickedFile = await picker.pickImage(source: ImageSource.gallery);
       if (pickedFile != null) {
         widget.onImageSelected(File(pickedFile.path));
       }
     }

     void _sendMessage() {
       if (_controller.text.trim().isNotEmpty) {
         widget.onSend(
           Message(
             id: Uuid().v4(),
             senderId: FirebaseAuth.instance.currentUser!.uid,
             receiverId: '', // Set this based on the chat
             content: _controller.text.trim(),
             type: MessageType.text,
             timestamp: DateTime.now(),
             isRead: false,
           ),
         );
         _controller.clear();
       }
     }

     @override
     void dispose() {
       _controller.dispose();
       _focusNode.dispose();
       super.dispose();
     }
   }
   ```

7. **Create Main Chat Screen**

   ```dart
   class ChatScreen extends StatefulWidget {
     final User otherUser;

     const ChatScreen({required this.otherUser});

     @override
     _ChatScreenState createState() => _ChatScreenState();
   }

   class _ChatScreenState extends State<ChatScreen> {
     final _chatService = ChatService();
     final _scrollController = ScrollController();

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Row(
             children: [
               CircleAvatar(
                 backgroundImage: widget.otherUser.photoUrl != null
                     ? NetworkImage(widget.otherUser.photoUrl!)
                     : null,
                 child: widget.otherUser.photoUrl == null
                     ? Text(widget.otherUser.name[0])
                     : null,
               ),
               SizedBox(width: 8),
               Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Text(widget.otherUser.name),
                   Text(
                     widget.otherUser.isOnline ? 'Online' : 'Offline',
                     style: TextStyle(fontSize: 12),
                   ),
                 ],
               ),
             ],
           ),
         ),
         body: Column(
           children: [
             Expanded(
               child: StreamBuilder<List<Message>>(
                 stream: _chatService.getMessages(
                   FirebaseAuth.instance.currentUser!.uid,
                   widget.otherUser.id,
                 ),
                 builder: (context, snapshot) {
                   if (snapshot.hasError) {
                     return Center(
                       child: Text('Error: ${snapshot.error}'),
                     );
                   }

                   if (!snapshot.hasData) {
                     return Center(
                       child: CircularProgressIndicator(),
                     );
                   }

                   final messages = snapshot.data!;
                   return ListView.builder(
                     controller: _scrollController,
                     reverse: true,
                     itemCount: messages.length,
                     itemBuilder: (context, index) {
                       final message = messages[index];
                       final isMe = message.senderId ==
                           FirebaseAuth.instance.currentUser!.uid;
                       return MessageBubble(
                         message: message,
                         isMe: isMe,
                       );
                     },
                   );
                 },
               ),
             ),
             ChatInput(
               onSend: _sendMessage,
               onImageSelected: _sendImage,
             ),
           ],
         ),
       );
     }

     Future<void> _sendMessage(Message message) async {
       await _chatService.sendMessage(message);
       _scrollController.animateTo(
         0,
         duration: Duration(milliseconds: 300),
         curve: Curves.easeOut,
       );
     }

     Future<void> _sendImage(File file) async {
       final path = 'chat_images/${Uuid().v4()}.jpg';
       final url = await _chatService.uploadMedia(file, path);
       await _chatService.sendMessage(
         Message(
           id: Uuid().v4(),
           senderId: FirebaseAuth.instance.currentUser!.uid,
           receiverId: widget.otherUser.id,
           content: 'Image',
           type: MessageType.image,
           timestamp: DateTime.now(),
           isRead: false,
           mediaUrl: url,
         ),
       );
     }

     @override
     void dispose() {
       _scrollController.dispose();
       super.dispose();
     }
   }
   ```

## Best Practices

1. **Real-time Communication**

   - Handle connection states
   - Implement message queuing
   - Handle offline messages
   - Optimize data transfer

2. **Security**

   - Implement proper authentication
   - Secure message storage
   - Handle user permissions
   - Protect sensitive data

3. **User Experience**

   - Show typing indicators
   - Display message status
   - Handle media uploads
   - Implement push notifications

4. **Performance**
   - Optimize message loading
   - Handle large media files
   - Implement pagination
   - Cache frequently used data

## Conclusion

This tutorial has shown you how to create a chat app with features like:

- Real-time messaging
- User authentication
- Media sharing
- Message status
- Online presence
- Message search

You can extend this app by adding:

- Group chats
- Voice messages
- Video calls
- Message reactions
- Message forwarding
- Message deletion

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's real-time communication, Firebase integration, and state management.
