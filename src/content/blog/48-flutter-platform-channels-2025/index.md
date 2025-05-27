---
title: "Platform Channels in Flutter: Communicating with Native Code"
summary: "Guide to implementing platform channels for communication between Flutter and native Android/iOS code for platform-specific functionality."
date: "2025, 09, 05"
draft: false
tags:
  - flutter
  - platform-channels
  - native-integration
  - android
  - ios
---

## Platform Channels in Flutter: Communicating with Native Code

This guide covers how to implement platform channels for communication between Flutter and native code.

## Basic Platform Channels

### Method Channel

```dart
// Flutter side
class NativeService {
  static const platform = MethodChannel('com.example.app/native');

  Future<String> getNativeData() async {
    try {
      final result = await platform.invokeMethod('getData');
      return result;
    } on PlatformException catch (e) {
      print('Error: ${e.message}');
      return 'Error';
    }
  }

  Future<void> sendDataToNative(String data) async {
    try {
      await platform.invokeMethod('sendData', {'data': data});
    } on PlatformException catch (e) {
      print('Error: ${e.message}');
    }
  }
}

// Android side (Kotlin)
class MainActivity: FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example.app/native")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getData" -> {
                        result.success("Data from Android")
                    }
                    "sendData" -> {
                        val data = call.argument<String>("data")
                        // Handle data
                        result.success(null)
                    }
                    else -> {
                        result.notImplemented()
                    }
                }
            }
    }
}

// iOS side (Swift)
@UIApplicationMain
class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let channel = FlutterMethodChannel(
            name: "com.example.app/native",
            binaryMessenger: controller.binaryMessenger
        )

        channel.setMethodCallHandler { call, result in
            switch call.method {
            case "getData":
                result("Data from iOS")
            case "sendData":
                if let data = call.arguments as? [String: Any],
                   let value = data["data"] as? String {
                    // Handle data
                    result(nil)
                } else {
                    result(FlutterError(
                        code: "INVALID_ARGUMENTS",
                        message: "Invalid arguments",
                        details: nil
                    ))
                }
            default:
                result(FlutterMethodNotImplemented)
            }
        }

        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
```

### Event Channel

```dart
// Flutter side
class NativeEventService {
  static const platform = EventChannel('com.example.app/events');
  StreamSubscription? _subscription;

  void startListening(Function(dynamic) onEvent) {
    _subscription = platform
        .receiveBroadcastStream()
        .listen(onEvent, onError: (error) {
      print('Error: $error');
    });
  }

  void stopListening() {
    _subscription?.cancel();
    _subscription = null;
  }
}

// Android side (Kotlin)
class MainActivity: FlutterActivity() {
    private var eventSink: EventChannel.EventSink? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, "com.example.app/events")
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    eventSink = events
                    // Start sending events
                }

                override fun onCancel(arguments: Any?) {
                    eventSink = null
                    // Stop sending events
                }
            })
    }
}

// iOS side (Swift)
@UIApplicationMain
class AppDelegate: FlutterAppDelegate {
    private var eventSink: FlutterEventSink?

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let channel = FlutterEventChannel(
            name: "com.example.app/events",
            binaryMessenger: controller.binaryMessenger
        )

        channel.setStreamHandler(self)

        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}

extension AppDelegate: FlutterStreamHandler {
    func onListen(withArguments arguments: Any?, eventSink events: @escaping FlutterEventSink) -> FlutterError? {
        eventSink = events
        // Start sending events
        return nil
    }

    func onCancel(withArguments arguments: Any?) -> FlutterError? {
        eventSink = nil
        // Stop sending events
        return nil
    }
}
```

## Advanced Platform Integration

### Binary Messages

```dart
// Flutter side
class BinaryService {
  static const platform = BasicMessageChannel<ByteData>(
    'com.example.app/binary',
    StandardMessageCodec(),
  );

  Future<ByteData> sendBinaryData(ByteData data) async {
    try {
      return await platform.send(data);
    } on PlatformException catch (e) {
      print('Error: ${e.message}');
      rethrow;
    }
  }
}

// Android side (Kotlin)
class MainActivity: FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        BasicMessageChannel<ByteBuffer>(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.example.app/binary",
            StandardMessageCodec.INSTANCE
        ).setMessageHandler { message, reply ->
            // Handle binary data
            reply.reply(message)
        }
    }
}

// iOS side (Swift)
@UIApplicationMain
class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        let channel = FlutterBasicMessageChannel(
            name: "com.example.app/binary",
            binaryMessenger: controller.binaryMessenger,
            codec: FlutterStandardMessageCodec.sharedInstance()
        )

        channel.setMessageHandler { message, reply in
            // Handle binary data
            reply(message)
        }

        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
```

## Best Practices

1. Use meaningful channel names
2. Handle errors properly
3. Implement proper cleanup
4. Document channel interfaces
5. Test thoroughly
6. Consider performance
7. Follow platform guidelines

## Common Pitfalls

1. Memory leaks
2. No error handling
3. Poor documentation
4. Platform differences
5. No cleanup

## Conclusion

Implementing platform channels requires:

- Understanding native code
- Following best practices
- Proper error handling
- Platform-specific knowledge
- Regular testing

Remember:

- Handle errors
- Clean up resources
- Document well
- Test thoroughly
- Follow guidelines

Happy Coding!
