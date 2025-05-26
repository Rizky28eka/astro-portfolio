---
title: "Building Cross-Platform Apps with Flutter"
summary: "Learn how to build beautiful and performant cross-platform applications using Flutter, including state management, navigation, and platform integration"
date: "2025, 05, 20"
draft: false
tags:
  - Flutter
  - Dart
  - Mobile Development
  - Tutorial
---

# Building Cross-Platform Apps with Flutter

Flutter is a powerful framework for building natively compiled applications for mobile, web, and desktop from a single codebase. This guide covers essential concepts, patterns, and best practices for building cross-platform applications.

## Project Setup

### 1. Creating a New Project

```bash
# Create new Flutter project
flutter create my_app

# Navigate to project directory
cd my_app

# Add dependencies to pubspec.yaml
flutter pub add provider
flutter pub add get_it
flutter pub add dio
flutter pub add shared_preferences
flutter pub add flutter_bloc
```

### 2. Project Structure

```
my_app/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── network/
│   │   └── utils/
│   ├── data/
│   │   ├── datasources/
│   │   ├── models/
│   │   └── repositories/
│   ├── domain/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── usecases/
│   ├── presentation/
│   │   ├── bloc/
│   │   ├── pages/
│   │   └── widgets/
│   └── main.dart
└── pubspec.yaml
```

## Core Features

### 1. State Management

```dart
// lib/presentation/bloc/auth/auth_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoggedIn extends AuthEvent {
  final String token;

  AuthLoggedIn(this.token);

  @override
  List<Object> get props => [token];
}

class AuthLoggedOut extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final String token;

  AuthAuthenticated(this.token);

  @override
  List<Object> get props => [token];
}

class AuthUnauthenticated extends AuthState {}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoggedIn>(_onAuthLoggedIn);
    on<AuthLoggedOut>(_onAuthLoggedOut);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final token = await authRepository.getToken();
    if (token != null) {
      emit(AuthAuthenticated(token));
    } else {
      emit(AuthUnauthenticated());
    }
  }

  void _onAuthLoggedIn(
    AuthLoggedIn event,
    Emitter<AuthState> emit,
  ) {
    emit(AuthAuthenticated(event.token));
  }

  void _onAuthLoggedOut(
    AuthLoggedOut event,
    Emitter<AuthState> emit,
  ) {
    emit(AuthUnauthenticated());
  }
}
```

### 2. Navigation

```dart
// lib/core/routes/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfilePage(),
    ),
    GoRoute(
      path: '/posts/:id',
      builder: (context, state) => PostDetailPage(
        postId: state.params['id']!,
      ),
    ),
  ],
  redirect: (context, state) {
    final isLoggedIn = context.read<AuthBloc>().state is AuthAuthenticated;
    final isLoginRoute = state.matchedLocation == '/login';

    if (!isLoggedIn && !isLoginRoute) {
      return '/login';
    }

    if (isLoggedIn && isLoginRoute) {
      return '/';
    }

    return null;
  },
);

// lib/presentation/pages/home_page.dart
class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: BlocBuilder<PostsBloc, PostsState>(
        builder: (context, state) {
          if (state is PostsLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is PostsLoaded) {
            return ListView.builder(
              itemCount: state.posts.length,
              itemBuilder: (context, index) {
                final post = state.posts[index];
                return PostCard(
                  post: post,
                  onTap: () => context.push('/posts/${post.id}'),
                );
              },
            );
          }

          return const Center(child: Text('No posts found'));
        },
      ),
    );
  }
}
```

## Data Layer

### 1. Repository Pattern

```dart
// lib/domain/repositories/post_repository.dart
abstract class PostRepository {
  Future<List<Post>> getPosts();
  Future<Post> getPostById(String id);
  Future<void> createPost(Post post);
  Future<void> updatePost(Post post);
  Future<void> deletePost(String id);
}

// lib/data/repositories/post_repository_impl.dart
class PostRepositoryImpl implements PostRepository {
  final PostRemoteDataSource remoteDataSource;
  final PostLocalDataSource localDataSource;

  PostRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<List<Post>> getPosts() async {
    try {
      final posts = await remoteDataSource.getPosts();
      await localDataSource.cachePosts(posts);
      return posts;
    } catch (e) {
      return localDataSource.getLastPosts();
    }
  }

  @override
  Future<Post> getPostById(String id) async {
    try {
      return await remoteDataSource.getPostById(id);
    } catch (e) {
      return localDataSource.getPostById(id);
    }
  }

  @override
  Future<void> createPost(Post post) async {
    await remoteDataSource.createPost(post);
  }

  @override
  Future<void> updatePost(Post post) async {
    await remoteDataSource.updatePost(post);
  }

  @override
  Future<void> deletePost(String id) async {
    await remoteDataSource.deletePost(id);
  }
}
```

### 2. API Integration

```dart
// lib/core/network/api_client.dart
class ApiClient {
  final Dio _dio;

  ApiClient() : _dio = Dio() {
    _dio.options.baseUrl = 'https://api.example.com';
    _dio.options.connectTimeout = const Duration(seconds: 5);
    _dio.options.receiveTimeout = const Duration(seconds: 3);
    _dio.interceptors.add(LogInterceptor());
  }

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return TimeoutException();
      case DioExceptionType.badResponse:
        return ServerException(
          error.response?.statusCode,
          error.response?.data['message'],
        );
      case DioExceptionType.cancel:
        return RequestCancelledException();
      default:
        return NetworkException();
    }
  }
}
```

## UI Components

### 1. Custom Widgets

```dart
// lib/presentation/widgets/post_card.dart
class PostCard extends StatelessWidget {
  final Post post;
  final VoidCallback? onTap;

  const PostCard({
    Key? key,
    required this.post,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                post.title,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                post.excerpt,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  CircleAvatar(
                    backgroundImage: NetworkImage(post.author.avatarUrl),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    post.author.name,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const Spacer(),
                  Text(
                    post.formattedDate,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// lib/presentation/widgets/loading_indicator.dart
class LoadingIndicator extends StatelessWidget {
  final double size;
  final Color? color;

  const LoadingIndicator({
    Key? key,
    this.size = 24,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: size,
        height: size,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            color ?? Theme.of(context).primaryColor,
          ),
        ),
      ),
    );
  }
}
```

### 2. Form Handling

```dart
// lib/presentation/widgets/login_form.dart
class LoginForm extends StatefulWidget {
  final Function(String email, String password) onLogin;

  const LoginForm({
    Key? key,
    required this.onLogin,
  }) : super(key: key);

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (_formKey.currentState!.validate()) {
      widget.onLogin(
        _emailController.text,
        _passwordController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'Enter your email',
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!value.contains('@')) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordController,
            decoration: const InputDecoration(
              labelText: 'Password',
              hintText: 'Enter your password',
            ),
            obscureText: true,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your password';
              }
              if (value.length < 6) {
                return 'Password must be at least 6 characters';
              }
              return null;
            },
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _handleSubmit,
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }
}
```

## Platform Integration

### 1. Native Features

```dart
// lib/core/platform/device_info.dart
import 'package:device_info_plus/device_info_plus.dart';

class DeviceInfo {
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  Future<Map<String, dynamic>> getDeviceInfo() async {
    if (Platform.isAndroid) {
      final androidInfo = await _deviceInfo.androidInfo;
      return {
        'platform': 'Android',
        'version': androidInfo.version.release,
        'device': androidInfo.model,
      };
    } else if (Platform.isIOS) {
      final iosInfo = await _deviceInfo.iosInfo;
      return {
        'platform': 'iOS',
        'version': iosInfo.systemVersion,
        'device': iosInfo.model,
      };
    }
    return {
      'platform': 'Unknown',
      'version': 'Unknown',
      'device': 'Unknown',
    };
  }
}

// lib/core/platform/permissions.dart
import 'package:permission_handler/permission_handler.dart';

class PermissionHandler {
  static Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  static Future<bool> requestLocationPermission() async {
    final status = await Permission.location.request();
    return status.isGranted;
  }

  static Future<bool> requestStoragePermission() async {
    final status = await Permission.storage.request();
    return status.isGranted;
  }
}
```

### 2. Platform-Specific Code

```dart
// lib/core/platform/platform_widgets.dart
class PlatformWidget extends StatelessWidget {
  final Widget Function(BuildContext) materialBuilder;
  final Widget Function(BuildContext) cupertinoBuilder;

  const PlatformWidget({
    Key? key,
    required this.materialBuilder,
    required this.cupertinoBuilder,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return cupertinoBuilder(context);
    }
    return materialBuilder(context);
  }
}

// lib/presentation/widgets/platform_button.dart
class PlatformButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;

  const PlatformButton({
    Key? key,
    required this.onPressed,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PlatformWidget(
      materialBuilder: (context) => ElevatedButton(
        onPressed: onPressed,
        child: child,
      ),
      cupertinoBuilder: (context) => CupertinoButton(
        onPressed: onPressed,
        child: child,
      ),
    );
  }
}
```

## Testing

### 1. Unit Tests

```dart
// test/domain/usecases/get_posts_test.dart
void main() {
  late GetPosts usecase;
  late MockPostRepository mockPostRepository;

  setUp(() {
    mockPostRepository = MockPostRepository();
    usecase = GetPosts(mockPostRepository);
  });

  final tPosts = [
    Post(
      id: '1',
      title: 'Test Post 1',
      content: 'Test Content 1',
      author: Author(id: '1', name: 'Test Author'),
    ),
    Post(
      id: '2',
      title: 'Test Post 2',
      content: 'Test Content 2',
      author: Author(id: '1', name: 'Test Author'),
    ),
  ];

  test(
    'should get posts from repository',
    () async {
      // arrange
      when(mockPostRepository.getPosts())
          .thenAnswer((_) async => tPosts);

      // act
      final result = await usecase();

      // assert
      expect(result, equals(tPosts));
      verify(mockPostRepository.getPosts());
      verifyNoMoreInteractions(mockPostRepository);
    },
  );
}
```

### 2. Widget Tests

```dart
// test/presentation/widgets/post_card_test.dart
void main() {
  testWidgets('should display post information correctly',
      (WidgetTester tester) async {
    // arrange
    final post = Post(
      id: '1',
      title: 'Test Post',
      content: 'Test Content',
      author: Author(id: '1', name: 'Test Author'),
    );

    // act
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PostCard(post: post),
        ),
      ),
    );

    // assert
    expect(find.text('Test Post'), findsOneWidget);
    expect(find.text('Test Content'), findsOneWidget);
    expect(find.text('Test Author'), findsOneWidget);
  });

  testWidgets('should call onTap when tapped', (WidgetTester tester) async {
    // arrange
    final post = Post(
      id: '1',
      title: 'Test Post',
      content: 'Test Content',
      author: Author(id: '1', name: 'Test Author'),
    );
    var tapped = false;

    // act
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PostCard(
            post: post,
            onTap: () => tapped = true,
          ),
        ),
      ),
    );
    await tester.tap(find.byType(PostCard));
    await tester.pump();

    // assert
    expect(tapped, true);
  });
}
```

## Best Practices

### 1. Code Organization

- Follow clean architecture principles
- Use dependency injection
- Implement proper error handling
- Write clean and maintainable code
- Follow consistent naming conventions

### 2. Performance

- Optimize widget rebuilds
- Use const constructors
- Implement proper caching
- Monitor memory usage
- Profile your app regularly

## Conclusion

Flutter offers:

- Cross-platform development
- Rich widget library
- Hot reload
- Great performance
- Strong community support

Remember to:

- Follow best practices
- Write tests
- Optimize performance
- Handle platform differences
- Keep learning and improving

Happy Flutter development!
