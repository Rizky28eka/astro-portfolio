---
title: "Fetching Data with Dio Package"
summary: "Advanced API requests made easy"
date: "2024, 03, 27"
tags: ["flutter", "dio", "api", "networking"]
difficulty: "medium"
draft: false
---

## Fetching Data with Dio Package

Dio is a powerful HTTP client for Dart/Flutter that supports Interceptors, Global configuration, FormData, Request cancellation, File downloading, Timeout, etc. This guide will show you how to effectively use Dio for making API requests in your Flutter applications.

## Why Use Dio?

Dio offers several advantages over the default http package:

- Interceptors for request/response handling
- Global configuration
- FormData support
- Request cancellation
- File downloading
- Timeout handling
- Better error handling
- Type-safe responses

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     dio: ^5.4.0
     json_annotation: ^4.8.1
   dev_dependencies:
     build_runner: ^2.4.8
     json_serializable: ^6.7.1
   ```

2. **Create API Client**

   ```dart
   class ApiClient {
     late Dio _dio;

     ApiClient() {
       _dio = Dio(BaseOptions(
         baseUrl: 'https://api.example.com',
         connectTimeout: Duration(seconds: 5),
         receiveTimeout: Duration(seconds: 3),
         headers: {
           'Content-Type': 'application/json',
           'Accept': 'application/json',
         },
       ));

       _dio.interceptors.add(LogInterceptor(
         request: true,
         requestHeader: true,
         requestBody: true,
         responseHeader: true,
         responseBody: true,
         error: true,
       ));
     }

     Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
       try {
         final response = await _dio.get(path, queryParameters: queryParameters);
         return response;
       } on DioException catch (e) {
         throw _handleError(e);
       }
     }

     Future<Response> post(String path, {dynamic data}) async {
       try {
         final response = await _dio.post(path, data: data);
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
           return TimeoutException('Connection timeout');
         case DioExceptionType.badResponse:
           return ApiException(
             error.response?.statusCode,
             error.response?.data['message'] ?? 'Unknown error',
           );
         case DioExceptionType.cancel:
           return RequestCancelledException();
         default:
           return NetworkException();
       }
     }
   }
   ```

3. **Create Model Classes**

   ```dart
   @JsonSerializable()
   class User {
     final int id;
     final String name;
     final String email;

     User({
       required this.id,
       required this.name,
       required this.email,
     });

     factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
     Map<String, dynamic> toJson() => _$UserToJson(this);
   }
   ```

4. **Implement Repository Pattern**

   ```dart
   class UserRepository {
     final ApiClient _apiClient;

     UserRepository(this._apiClient);

     Future<List<User>> getUsers() async {
       final response = await _apiClient.get('/users');
       return (response.data as List)
           .map((json) => User.fromJson(json))
           .toList();
     }

     Future<User> getUser(int id) async {
       final response = await _apiClient.get('/users/$id');
       return User.fromJson(response.data);
     }

     Future<User> createUser(User user) async {
       final response = await _apiClient.post('/users', data: user.toJson());
       return User.fromJson(response.data);
     }
   }
   ```

5. **Create Service Layer**

   ```dart
   class UserService {
     final UserRepository _repository;

     UserService(this._repository);

     Future<List<User>> fetchUsers() async {
       try {
         return await _repository.getUsers();
       } catch (e) {
         // Handle error appropriately
         rethrow;
       }
     }

     Future<User> fetchUser(int id) async {
       try {
         return await _repository.getUser(id);
       } catch (e) {
         // Handle error appropriately
         rethrow;
       }
     }

     Future<User> createUser(User user) async {
       try {
         return await _repository.createUser(user);
       } catch (e) {
         // Handle error appropriately
         rethrow;
       }
     }
   }
   ```

## Advanced Features

1. **Request Interceptors**

   ```dart
   class AuthInterceptor extends Interceptor {
     @override
     void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
       // Add auth token
       options.headers['Authorization'] = 'Bearer $token';
       super.onRequest(options, handler);
     }

     @override
     void onError(DioException err, ErrorInterceptorHandler handler) {
       if (err.response?.statusCode == 401) {
         // Handle unauthorized error
       }
       super.onError(err, handler);
     }
   }
   ```

2. **File Upload**

   ```dart
   Future<void> uploadFile(String filePath) async {
     FormData formData = FormData.fromMap({
       'file': await MultipartFile.fromFile(filePath),
     });

     await _dio.post('/upload', data: formData);
   }
   ```

3. **Download Progress**

   ```dart
   Future<void> downloadFile(String url, String savePath) async {
     await _dio.download(
       url,
       savePath,
       onReceiveProgress: (received, total) {
         if (total != -1) {
           print((received / total * 100).toStringAsFixed(0) + '%');
         }
       },
     );
   }
   ```

## Best Practices

1. **Error Handling**

   - Implement proper error classes
   - Handle network errors gracefully
   - Provide user-friendly error messages
   - Implement retry mechanisms

2. **Caching**

   - Implement response caching
   - Handle cache invalidation
   - Use appropriate cache policies
   - Monitor cache size

3. **Security**
   - Secure API endpoints
   - Handle sensitive data
   - Implement proper authentication
   - Use HTTPS

## Common Use Cases

1. **REST API Integration**

   - CRUD operations
   - Authentication
   - File upload/download
   - Pagination

2. **Real-time Updates**

   - WebSocket integration
   - Polling
   - Push notifications
   - Data synchronization

3. **Data Management**
   - Caching strategies
   - Offline support
   - Data persistence
   - State management

## Conclusion

Dio is a powerful and flexible HTTP client that makes it easy to work with APIs in Flutter applications. By following these guidelines and implementing the provided examples, you can create robust and maintainable networking code that handles various API scenarios effectively.
