---
title: "Build a Chat UI with Flutter"
summary: "Modern chat design for mobile"
date: "2024, 03, 26"
tags: ["flutter", "ui", "chat", "messaging"]
difficulty: "medium"
draft: false
---

## Build a Chat UI with Flutter

Creating a modern and functional chat interface is essential for messaging applications. This guide will show you how to build a beautiful and responsive chat UI in Flutter with features like message bubbles, typing indicators, and more.

## Why Focus on Chat UI?

A well-designed chat interface:

- Enhances user engagement
- Improves communication experience
- Provides clear message hierarchy
- Supports various message types

## Implementation

1. **Basic Chat Screen Structure**

   ```dart
   class ChatScreen extends StatefulWidget {
     @override
     _ChatScreenState createState() => _ChatScreenState();
   }

   class _ChatScreenState extends State<ChatScreen> {
     final TextEditingController _messageController = TextEditingController();
     final List<ChatMessage> _messages = [];

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Chat'),
           actions: [
             IconButton(
               icon: Icon(Icons.more_vert),
               onPressed: () {},
             ),
           ],
         ),
         body: Column(
           children: [
             Expanded(
               child: ListView.builder(
                 reverse: true,
                 itemCount: _messages.length,
                 itemBuilder: (context, index) {
                   return _buildMessageBubble(_messages[index]);
                 },
               ),
             ),
             _buildMessageComposer(),
           ],
         ),
       );
     }
   }
   ```

2. **Message Bubble Widget**

   ```dart
   Widget _buildMessageBubble(ChatMessage message) {
     return Container(
       margin: EdgeInsets.symmetric(vertical: 10.0, horizontal: 16.0),
       child: Row(
         mainAxisAlignment: message.isMe
             ? MainAxisAlignment.end
             : MainAxisAlignment.start,
         children: [
           if (!message.isMe) _buildAvatar(message),
           Container(
             padding: EdgeInsets.all(12.0),
             decoration: BoxDecoration(
               color: message.isMe
                   ? Theme.of(context).primaryColor
                   : Colors.grey[300],
               borderRadius: BorderRadius.circular(20.0),
             ),
             child: Text(
               message.text,
               style: TextStyle(
                 color: message.isMe ? Colors.white : Colors.black,
               ),
             ),
           ),
           if (message.isMe) _buildAvatar(message),
         ],
       ),
     );
   }
   ```

3. **Message Composer**
   ```dart
   Widget _buildMessageComposer() {
     return Container(
       padding: EdgeInsets.symmetric(horizontal: 8.0),
       height: 70.0,
       color: Colors.white,
       child: Row(
         children: [
           IconButton(
             icon: Icon(Icons.attach_file),
             onPressed: () {},
           ),
           Expanded(
             child: TextField(
               controller: _messageController,
               decoration: InputDecoration(
                 hintText: 'Send a message',
                 border: InputBorder.none,
               ),
             ),
           ),
           IconButton(
             icon: Icon(Icons.send),
             onPressed: _handleSubmitted,
           ),
         ],
       ),
     );
   }
   ```

## Advanced Features

1. **Typing Indicator**

   ```dart
   class TypingIndicator extends StatefulWidget {
     @override
     _TypingIndicatorState createState() => _TypingIndicatorState();
   }

   class _TypingIndicatorState extends State<TypingIndicator>
       with SingleTickerProviderStateMixin {
     late AnimationController _controller;
     late List<Animation<double>> _animations;

     @override
     void initState() {
       super.initState();
       _controller = AnimationController(
         duration: Duration(milliseconds: 1000),
         vsync: this,
       )..repeat();

       _animations = List.generate(
         3,
         (index) => Tween(begin: 0.0, end: 1.0).animate(
           CurvedAnimation(
             parent: _controller,
             curve: Interval(index * 0.2, (index + 1) * 0.2),
           ),
         ),
       );
     }

     @override
     Widget build(BuildContext context) {
       return Row(
         mainAxisSize: MainAxisSize.min,
         children: List.generate(3, (index) {
           return AnimatedBuilder(
             animation: _animations[index],
             builder: (context, child) {
               return Container(
                 width: 8.0,
                 height: 8.0,
                 margin: EdgeInsets.symmetric(horizontal: 2.0),
                 decoration: BoxDecoration(
                   color: Colors.grey.withOpacity(_animations[index].value),
                   shape: BoxShape.circle,
                 ),
               );
             },
           );
         }),
       );
     }
   }
   ```

2. **Message Status Indicators**
   ```dart
   Widget _buildMessageStatus(MessageStatus status) {
     switch (status) {
       case MessageStatus.sending:
         return Icon(Icons.access_time, size: 16.0, color: Colors.grey);
       case MessageStatus.sent:
         return Icon(Icons.check, size: 16.0, color: Colors.grey);
       case MessageStatus.delivered:
         return Icon(Icons.done_all, size: 16.0, color: Colors.grey);
       case MessageStatus.read:
         return Icon(Icons.done_all, size: 16.0, color: Colors.blue);
     }
   }
   ```

## Best Practices

1. **Performance Optimization**

   - Use ListView.builder for message list
   - Implement message pagination
   - Cache message data
   - Optimize image loading

2. **User Experience**

   - Add pull-to-refresh
   - Implement message search
   - Support message reactions
   - Handle offline mode

3. **Message Types**
   - Text messages
   - Image messages
   - File attachments
   - Voice messages
   - Location sharing

## Common Features

1. **Message Actions**

   - Copy message
   - Forward message
   - Delete message
   - Reply to message

2. **Group Chat Features**

   - Member list
   - Group settings
   - Admin controls
   - Group notifications

3. **Media Handling**
   - Image preview
   - Video playback
   - File download
   - Media compression

## Conclusion

Building a chat UI in Flutter requires attention to detail and consideration of various user interactions. By following these guidelines and implementing the provided examples, you can create a modern and functional chat interface that enhances your app's messaging capabilities.
