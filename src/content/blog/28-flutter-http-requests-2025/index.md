---
title: "Flutter HTTP Requests: A Complete Guide to API Integration"
summary: "Comprehensive tutorial on making HTTP requests in Flutter, including error handling, authentication, and best practices for API integration."
date: "2025, 05, 25"
draft: false
tags:
  - flutter
  - http-requests
  - api-integration
  - networking
  - rest-api
---

## Flutter HTTP Requests: A Complete Guide to API Integration

This guide covers everything you need to know about making HTTP requests in Flutter applications, from basic requests to advanced features.

## Basic HTTP Requests

### Using http Package

```dart
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'https://api.example.com';

  Future<dynamic> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$endpoint'),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load data');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$endpoint'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create data');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
```

### Using Dio Package

```dart
import 'package:dio/dio.dart';

class DioService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.example.com',
    connectTimeout: 5000,
    receiveTimeout: 3000,
  ));

  Future<dynamic> get(String endpoint) async {
    try {
      final response = await _dio.get(endpoint);
      return response.data;
    } on DioError catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(endpoint, data: data);
      return response.data;
    } on DioError catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioError error) {
    switch (error.type) {
      case DioErrorType.connectTimeout:
        return Exception('Connection timeout');
      case DioErrorType.receiveTimeout:
        return Exception('Receive timeout');
      case DioErrorType.sendTimeout:
        return Exception('Send timeout');
      default:
        return Exception('Network error');
    }
  }
}
```

## Advanced Features

### Authentication

```dart
class AuthenticatedApiService {
  final Dio _dio = Dio();
  String? _token;

  Future<void> login(String username, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'username': username,
          'password': password,
        },
      );

      _token = response.data['token'];
      _dio.options.headers['Authorization'] = 'Bearer $_token';
    } catch (e) {
      throw Exception('Login failed');
    }
  }

  Future<dynamic> authenticatedRequest(String endpoint) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }

    try {
      final response = await _dio.get(endpoint);
      return response.data;
    } catch (e) {
      throw Exception('Request failed');
    }
  }
}
```

### Error Handling

```dart
class ApiError {
  final int statusCode;
  final String message;

  ApiError(this.statusCode, this.message);

  factory ApiError.fromResponse(Response response) {
    return ApiError(
      response.statusCode ?? 500,
      response.data['message'] ?? 'Unknown error',
    );
  }
}

class ErrorHandlingService {
  final Dio _dio = Dio();

  Future<dynamic> request(String endpoint) async {
    try {
      final response = await _dio.get(endpoint);
      return response.data;
    } on DioError catch (e) {
      if (e.response != null) {
        throw ApiError.fromResponse(e.response!);
      }
      throw ApiError(500, 'Network error');
    }
  }
}
```

### Request Interceptors

```dart
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('REQUEST[${options.method}] => PATH: ${options.path}');
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}');
    super.onResponse(response, handler);
  }

  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    print('ERROR[${err.response?.statusCode}] => PATH: ${err.requestOptions.path}');
    super.onError(err, handler);
  }
}
```

## Best Practices

1. Use appropriate HTTP client
2. Implement proper error handling
3. Handle authentication properly
4. Use interceptors for logging
5. Implement retry mechanism
6. Cache responses when appropriate
7. Monitor network performance

## Common Pitfalls

1. Not handling errors properly
2. Missing authentication
3. No timeout handling
4. Poor error messages
5. No retry mechanism

## Conclusion

Implementing HTTP requests requires:

- Understanding HTTP protocols
- Following best practices
- Proper error handling
- Authentication management
- Performance optimization

Remember:

- Handle errors
- Manage authentication
- Monitor performance
- Cache when needed
- Use appropriate client

Happy Fluttering!
