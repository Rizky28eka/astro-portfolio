---
title: "GraphQL in Flutter: Querying APIs with Flutter GraphQL"
summary: "Tutorial on implementing GraphQL in Flutter applications, including query optimization and state management integration."
date: "2025, 06, 05"
draft: false
tags:
  - flutter
  - graphql
  - api-queries
  - data-fetching
  - backend-integration
---

## GraphQL in Flutter: Querying APIs with Flutter GraphQL

This guide covers how to implement GraphQL in Flutter applications, from basic queries to advanced features.

## Basic Setup

### Dependencies

```yaml
# pubspec.yaml
dependencies:
  graphql_flutter: ^5.0.0
  graphql: ^5.0.0
```

### Client Configuration

```dart
class GraphQLConfig {
  static HttpLink httpLink = HttpLink(
    'https://api.example.com/graphql',
  );

  static AuthLink authLink = AuthLink(
    getToken: () async => 'Bearer ${await getToken()}',
  );

  static Link link = authLink.concat(httpLink);

  static GraphQLClient client = GraphQLClient(
    cache: GraphQLCache(),
    link: link,
  );
}

void main() {
  runApp(
    GraphQLProvider(
      client: GraphQLConfig.client,
      child: MyApp(),
    ),
  );
}
```

## Basic Queries

### Simple Query

```dart
class UserQuery {
  static const String document = '''
    query GetUser(\$id: ID!) {
      user(id: \$id) {
        id
        name
        email
      }
    }
  ''';

  static Future<QueryResult> getUser(String id) async {
    final result = await GraphQLConfig.client.query(
      QueryOptions(
        document: gql(document),
        variables: {'id': id},
      ),
    );

    if (result.hasException) {
      throw result.exception!;
    }

    return result;
  }
}
```

### Mutation

```dart
class UserMutation {
  static const String document = '''
    mutation CreateUser(\$input: CreateUserInput!) {
      createUser(input: \$input) {
        id
        name
        email
      }
    }
  ''';

  static Future<QueryResult> createUser(Map<String, dynamic> input) async {
    final result = await GraphQLConfig.client.mutate(
      MutationOptions(
        document: gql(document),
        variables: {'input': input},
      ),
    );

    if (result.hasException) {
      throw result.exception!;
    }

    return result;
  }
}
```

## Advanced Features

### Subscription

```dart
class MessageSubscription {
  static const String document = '''
    subscription OnMessageReceived {
      messageReceived {
        id
        content
        sender {
          id
          name
        }
      }
    }
  ''';

  static Stream<QueryResult> subscribeToMessages() {
    return GraphQLConfig.client.subscribe(
      SubscriptionOptions(
        document: gql(document),
      ),
    );
  }
}
```

### Query Optimization

```dart
class OptimizedQuery {
  static const String document = '''
    query GetUserWithPosts(\$id: ID!) {
      user(id: \$id) {
        id
        name
        posts(first: 10) {
          edges {
            node {
              id
              title
              content
            }
          }
        }
      }
    }
  ''';

  static Future<QueryResult> getUserWithPosts(String id) async {
    final result = await GraphQLConfig.client.query(
      QueryOptions(
        document: gql(document),
        variables: {'id': id},
        fetchPolicy: FetchPolicy.cacheAndNetwork,
      ),
    );

    return result;
  }
}
```

## State Management Integration

### Provider Integration

```dart
class GraphQLProvider extends ChangeNotifier {
  final GraphQLClient client;

  GraphQLProvider(this.client);

  Future<QueryResult> query(
    String document,
    Map<String, dynamic> variables,
  ) async {
    final result = await client.query(
      QueryOptions(
        document: gql(document),
        variables: variables,
      ),
    );

    if (result.hasException) {
      throw result.exception!;
    }

    return result;
  }

  Future<QueryResult> mutate(
    String document,
    Map<String, dynamic> variables,
  ) async {
    final result = await client.mutate(
      MutationOptions(
        document: gql(document),
        variables: variables,
      ),
    );

    if (result.hasException) {
      throw result.exception!;
    }

    return result;
  }
}
```

### BLoC Integration

```dart
class GraphQLBloc extends Bloc<GraphQLEvent, GraphQLState> {
  final GraphQLClient client;

  GraphQLBloc(this.client) : super(GraphQLInitial()) {
    on<ExecuteQuery>(_onExecuteQuery);
    on<ExecuteMutation>(_onExecuteMutation);
  }

  Future<void> _onExecuteQuery(
    ExecuteQuery event,
    Emitter<GraphQLState> emit,
  ) async {
    emit(GraphQLLoading());

    try {
      final result = await client.query(
        QueryOptions(
          document: gql(event.document),
          variables: event.variables,
        ),
      );

      emit(GraphQLSuccess(result.data));
    } catch (e) {
      emit(GraphQLError(e.toString()));
    }
  }

  Future<void> _onExecuteMutation(
    ExecuteMutation event,
    Emitter<GraphQLState> emit,
  ) async {
    emit(GraphQLLoading());

    try {
      final result = await client.mutate(
        MutationOptions(
          document: gql(event.document),
          variables: event.variables,
        ),
      );

      emit(GraphQLSuccess(result.data));
    } catch (e) {
      emit(GraphQLError(e.toString()));
    }
  }
}
```

## Error Handling

```dart
class GraphQLErrorHandler {
  static String handleError(GraphQLError error) {
    switch (error.extensions?['code']) {
      case 'UNAUTHENTICATED':
        return 'Please log in to continue';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action';
      case 'NOT_FOUND':
        return 'The requested resource was not found';
      default:
        return error.message;
    }
  }

  static bool isNetworkError(GraphQLError error) {
    return error.linkException is NetworkException;
  }
}
```

## Best Practices

1. Use proper query structure
2. Implement error handling
3. Optimize queries
4. Handle caching
5. Use subscriptions appropriately
6. Monitor performance
7. Document queries

## Common Pitfalls

1. Over-fetching data
2. Poor error handling
3. Inefficient queries
4. Missing cache policies
5. No offline support

## Conclusion

Implementing GraphQL requires:

- Understanding GraphQL concepts
- Following best practices
- Proper error handling
- Query optimization
- Performance monitoring

Remember:

- Structure queries well
- Handle errors
- Optimize performance
- Use caching
- Monitor usage

Happy Fluttering!
