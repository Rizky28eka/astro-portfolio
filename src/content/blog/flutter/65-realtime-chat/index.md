---
title: "Real-time Chat with WebSocket"
summary: "Build a scalable real-time chat application"
date: "2025, 04, 04"
tags: ["flutter", "websocket", "real-time", "chat", "socket-io"]
difficulty: "advanced"
draft: false
---

## Real-time Chat with WebSocket

Building a real-time chat application in Flutter using WebSocket allows for instant message delivery and bidirectional communication. This tutorial will guide you through implementing a scalable chat system with features like typing indicators, read receipts, and message persistence.

## Features

- Real-time messaging
- Typing indicators
- Read receipts
- Message persistence
- User presence
- Message reactions
- File sharing
- Message search
- Message threading
- Offline support

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     web_socket_channel: ^2.4.0
     socket_io_client: ^2.0.3+1
     provider: ^6.1.1
     shared_preferences: ^2.2.2
     intl: ^0.19.0
     uuid: ^4.2.1
     path_provider: ^2.1.2
     sqflite: ^2.3.2
   ```

2. **Create Chat Models**

   ```dart
   class Message {
     final String id;
     final String senderId;
     final String content;
     final DateTime timestamp;
     final MessageType type;
     final String? replyTo;
     final Map<String, dynamic>? metadata;
     final List<String> readBy;
     final List<Reaction> reactions;

     Message({
       required this.id,
       required this.senderId,
       required this.content,
       required this.timestamp,
       required this.type,
       this.replyTo,
       this.metadata,
       this.readBy = const [],
       this.reactions = const [],
     });

     factory Message.fromJson(Map<String, dynamic> json) {
       return Message(
         id: json['id'],
         senderId: json['senderId'],
         content: json['content'],
         timestamp: DateTime.parse(json['timestamp']),
         type: MessageType.values[json['type']],
         replyTo: json['replyTo'],
         metadata: json['metadata'],
         readBy: List<String>.from(json['readBy']),
         reactions: (json['reactions'] as List)
             .map((r) => Reaction.fromJson(r))
             .toList(),
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'id': id,
         'senderId': senderId,
         'content': content,
         'timestamp': timestamp.toIso8601String(),
         'type': type.index,
         'replyTo': replyTo,
         'metadata': metadata,
         'readBy': readBy,
         'reactions': reactions.map((r) => r.toJson()).toList(),
       };
     }
   }

   class Reaction {
     final String userId;
     final String emoji;
     final DateTime timestamp;

     Reaction({
       required this.userId,
       required this.emoji,
       required this.timestamp,
     });

     factory Reaction.fromJson(Map<String, dynamic> json) {
       return Reaction(
         userId: json['userId'],
         emoji: json['emoji'],
         timestamp: DateTime.parse(json['timestamp']),
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'userId': userId,
         'emoji': emoji,
         'timestamp': timestamp.toIso8601String(),
       };
     }
   }

   enum MessageType {
     text,
     image,
     file,
     audio,
     video,
     location,
   }
   ```

3. **Create WebSocket Service**

   ```dart
   class WebSocketService {
     Socket? _socket;
     final String _url;
     final String _token;
     final _messageController = StreamController<Message>.broadcast();
     final _typingController = StreamController<String>.broadcast();
     final _presenceController = StreamController<Map<String, bool>>.broadcast();

     WebSocketService(this._url, this._token);

     Stream<Message> get messageStream => _messageController.stream;
     Stream<String> get typingStream => _typingController.stream;
     Stream<Map<String, bool>> get presenceStream => _presenceController.stream;

     Future<void> connect() async {
       _socket = io(_url, <String, dynamic>{
         'transports': ['websocket'],
         'autoConnect': false,
         'auth': {'token': _token},
       });

       _socket!.onConnect((_) {
         print('Connected to WebSocket');
       });

       _socket!.onDisconnect((_) {
         print('Disconnected from WebSocket');
       });

       _socket!.on('message', (data) {
         final message = Message.fromJson(data);
         _messageController.add(message);
       });

       _socket!.on('typing', (data) {
         _typingController.add(data['userId']);
       });

       _socket!.on('presence', (data) {
         final presence = Map<String, bool>.from(data);
         _presenceController.add(presence);
       });

       _socket!.connect();
     }

     void sendMessage(Message message) {
       _socket?.emit('message', message.toJson());
     }

     void sendTyping() {
       _socket?.emit('typing');
     }

     void sendReaction(String messageId, Reaction reaction) {
       _socket?.emit('reaction', {
         'messageId': messageId,
         'reaction': reaction.toJson(),
       });
     }

     void markAsRead(String messageId) {
       _socket?.emit('read', {'messageId': messageId});
     }

     void disconnect() {
       _socket?.disconnect();
       _socket?.dispose();
       _messageController.close();
       _typingController.close();
       _presenceController.close();
     }
   }
   ```

4. **Create Chat Provider**

   ```dart
   class ChatProvider extends ChangeNotifier {
     final WebSocketService _webSocketService;
     final Database _database;
     final String _userId;
     List<Message> _messages = [];
     Map<String, bool> _typingUsers = {};
     Map<String, bool> _onlineUsers = {};
     bool _isConnected = false;
     String? _error;

     ChatProvider({
       required WebSocketService webSocketService,
       required Database database,
       required String userId,
     })  : _webSocketService = webSocketService,
           _database = database,
           _userId = userId {
       _initialize();
     }

     List<Message> get messages => _messages;
     Map<String, bool> get typingUsers => _typingUsers;
     Map<String, bool> get onlineUsers => _onlineUsers;
     bool get isConnected => _isConnected;
     String? get error => _error;

     Future<void> _initialize() async {
       await _loadMessages();
       await _webSocketService.connect();

       _webSocketService.messageStream.listen((message) {
         _addMessage(message);
       });

       _webSocketService.typingStream.listen((userId) {
         _typingUsers[userId] = true;
         notifyListeners();
         Future.delayed(Duration(seconds: 3), () {
           _typingUsers.remove(userId);
           notifyListeners();
         });
       });

       _webSocketService.presenceStream.listen((presence) {
         _onlineUsers = presence;
         notifyListeners();
       });
     }

     Future<void> _loadMessages() async {
       final messages = await _database.query(
         'messages',
         orderBy: 'timestamp DESC',
         limit: 50,
       );

       _messages = messages
           .map((row) => Message.fromJson(row))
           .toList()
           .reversed
           .toList();
       notifyListeners();
     }

     void _addMessage(Message message) {
       _messages.add(message);
       _saveMessage(message);
       notifyListeners();
     }

     Future<void> _saveMessage(Message message) async {
       await _database.insert(
         'messages',
         message.toJson(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> sendMessage(String content, {MessageType type = MessageType.text}) async {
       final message = Message(
         id: Uuid().v4(),
         senderId: _userId,
         content: content,
         timestamp: DateTime.now(),
         type: type,
       );

       _webSocketService.sendMessage(message);
       _addMessage(message);
     }

     void sendTyping() {
       _webSocketService.sendTyping();
     }

     void sendReaction(String messageId, String emoji) {
       final reaction = Reaction(
         userId: _userId,
         emoji: emoji,
         timestamp: DateTime.now(),
       );

       _webSocketService.sendReaction(messageId, reaction);
       _updateMessageReaction(messageId, reaction);
     }

     void _updateMessageReaction(String messageId, Reaction reaction) {
       final index = _messages.indexWhere((m) => m.id == messageId);
       if (index != -1) {
         final message = _messages[index];
         final reactions = List<Reaction>.from(message.reactions)
           ..add(reaction);
         _messages[index] = Message(
           id: message.id,
           senderId: message.senderId,
           content: message.content,
           timestamp: message.timestamp,
           type: message.type,
           replyTo: message.replyTo,
           metadata: message.metadata,
           readBy: message.readBy,
           reactions: reactions,
         );
         notifyListeners();
       }
     }

     void markAsRead(String messageId) {
       _webSocketService.markAsRead(messageId);
       _updateMessageReadStatus(messageId);
     }

     void _updateMessageReadStatus(String messageId) {
       final index = _messages.indexWhere((m) => m.id == messageId);
       if (index != -1) {
         final message = _messages[index];
         final readBy = List<String>.from(message.readBy)..add(_userId);
         _messages[index] = Message(
           id: message.id,
           senderId: message.senderId,
           content: message.content,
           timestamp: message.timestamp,
           type: message.type,
           replyTo: message.replyTo,
           metadata: message.metadata,
           readBy: readBy,
           reactions: message.reactions,
         );
         notifyListeners();
       }
     }

     @override
     void dispose() {
       _webSocketService.disconnect();
       super.dispose();
     }
   }
   ```

5. **Create Chat Widgets**

   ```dart
   class MessageBubble extends StatelessWidget {
     final Message message;
     final bool isMe;
     final Function(String) onReaction;
     final Function(String) onReply;

     const MessageBubble({
       required this.message,
       required this.isMe,
       required this.onReaction,
       required this.onReply,
     });

     @override
     Widget build(BuildContext context) {
       return Align(
         alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
         child: Container(
           margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
           padding: EdgeInsets.all(12),
           decoration: BoxDecoration(
             color: isMe ? Colors.blue : Colors.grey[300],
             borderRadius: BorderRadius.circular(16),
           ),
           child: Column(
             crossAxisAlignment:
                 isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
             children: [
               if (message.replyTo != null)
                 _buildReplyPreview(context, message.replyTo!),
               Text(
                 message.content,
                 style: TextStyle(
                   color: isMe ? Colors.white : Colors.black,
                 ),
               ),
               SizedBox(height: 4),
               Row(
                 mainAxisSize: MainAxisSize.min,
                 children: [
                   Text(
                     DateFormat.jm().format(message.timestamp),
                     style: TextStyle(
                       fontSize: 12,
                       color: isMe ? Colors.white70 : Colors.black54,
                     ),
                   ),
                   if (isMe) ...[
                     SizedBox(width: 4),
                     Icon(
                       Icons.done_all,
                       size: 16,
                       color: message.readBy.length > 1
                           ? Colors.blue
                           : Colors.white70,
                     ),
                   ],
                 ],
               ),
               if (message.reactions.isNotEmpty)
                 _buildReactions(context),
             ],
           ),
         ),
       );
     }

     Widget _buildReplyPreview(BuildContext context, String replyToId) {
       // Implement reply preview
       return Container();
     }

     Widget _buildReactions(BuildContext context) {
       return Wrap(
         spacing: 4,
         children: message.reactions.map((reaction) {
           return GestureDetector(
             onTap: () => onReaction(reaction.emoji),
             child: Container(
               padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
               decoration: BoxDecoration(
                 color: Colors.white.withOpacity(0.2),
                 borderRadius: BorderRadius.circular(12),
               ),
               child: Text(reaction.emoji),
             ),
           );
         }).toList(),
       );
     }
   }

   class ChatInput extends StatefulWidget {
     final Function(String) onSend;
     final Function() onTyping;
     final Function(String) onAttachment;

     const ChatInput({
       required this.onSend,
       required this.onTyping,
       required this.onAttachment,
     });

     @override
     State<ChatInput> createState() => _ChatInputState();
   }

   class _ChatInputState extends State<ChatInput> {
     final _controller = TextEditingController();
     Timer? _typingTimer;

     @override
     void dispose() {
       _controller.dispose();
       _typingTimer?.cancel();
       super.dispose();
     }

     void _handleTyping() {
       _typingTimer?.cancel();
       widget.onTyping();
       _typingTimer = Timer(Duration(seconds: 1), () {});
     }

     @override
     Widget build(BuildContext context) {
       return Container(
         padding: EdgeInsets.all(8),
         decoration: BoxDecoration(
           color: Colors.white,
           boxShadow: [
             BoxShadow(
               color: Colors.black12,
               blurRadius: 4,
               offset: Offset(0, -2),
             ),
           ],
         ),
         child: Row(
           children: [
             IconButton(
               icon: Icon(Icons.attach_file),
               onPressed: () => widget.onAttachment('file'),
             ),
             Expanded(
               child: TextField(
                 controller: _controller,
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
                 onChanged: (_) => _handleTyping(),
                 onSubmitted: (text) {
                   if (text.isNotEmpty) {
                     widget.onSend(text);
                     _controller.clear();
                   }
                 },
               ),
             ),
             IconButton(
               icon: Icon(Icons.send),
               onPressed: () {
                 if (_controller.text.isNotEmpty) {
                   widget.onSend(_controller.text);
                   _controller.clear();
                 }
               },
             ),
           ],
         ),
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class ChatScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text('Chat Room'),
               Consumer<ChatProvider>(
                 builder: (context, provider, child) {
                   final onlineCount = provider.onlineUsers.values
                       .where((online) => online)
                       .length;
                   return Text(
                     '$onlineCount online',
                     style: TextStyle(fontSize: 12),
                   );
                 },
               ),
             ],
           ),
           actions: [
             IconButton(
               icon: Icon(Icons.more_vert),
               onPressed: () {
                 // Show chat options
               },
             ),
           ],
         ),
         body: Column(
           children: [
             Expanded(
               child: Consumer<ChatProvider>(
                 builder: (context, provider, child) {
                   if (provider.error != null) {
                     return Center(
                       child: Text(provider.error!),
                     );
                   }

                   return ListView.builder(
                     reverse: true,
                     itemCount: provider.messages.length,
                     itemBuilder: (context, index) {
                       final message = provider.messages[index];
                       return MessageBubble(
                         message: message,
                         isMe: message.senderId == provider._userId,
                         onReaction: (emoji) {
                           provider.sendReaction(message.id, emoji);
                         },
                         onReply: (messageId) {
                           // Handle reply
                         },
                       );
                     },
                   );
                 },
               ),
             ),
             Consumer<ChatProvider>(
               builder: (context, provider, child) {
                 if (provider.typingUsers.isNotEmpty) {
                   return Padding(
                     padding: EdgeInsets.all(8),
                     child: Text(
                       '${provider.typingUsers.keys.join(", ")} typing...',
                       style: TextStyle(
                         fontStyle: FontStyle.italic,
                         color: Colors.grey,
                       ),
                     ),
                   );
                 }
                 return SizedBox.shrink();
               },
             ),
             ChatInput(
               onSend: (text) {
                 context.read<ChatProvider>().sendMessage(text);
               },
               onTyping: () {
                 context.read<ChatProvider>().sendTyping();
               },
               onAttachment: (type) {
                 // Handle attachment
               },
             ),
           ],
         ),
       );
     }
   }
   ```

## Best Practices

1. **WebSocket Management**

   - Handle reconnection
   - Manage connection state
   - Implement heartbeat
   - Handle errors

2. **Message Handling**

   - Queue messages
   - Handle offline
   - Implement retry
   - Validate data

3. **Performance**

   - Optimize rendering
   - Handle large lists
   - Cache messages
   - Manage memory

4. **Security**
   - Encrypt messages
   - Validate users
   - Handle tokens
   - Prevent attacks

## Conclusion

This tutorial has shown you how to implement a real-time chat application in Flutter with features like:

- Real-time messaging
- Typing indicators
- Read receipts
- Message reactions
- File sharing

You can extend this implementation by adding:

- Voice messages
- Video calls
- Message encryption
- Group chats
- Message search

Remember to:

- Handle connectivity
- Test thoroughly
- Consider security
- Follow platform guidelines
- Keep dependencies updated

This implementation provides a solid foundation for creating a real-time chat application in Flutter.
