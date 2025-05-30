---
title: "Infinite Scroll with ListView"
summary: "Load data as you scroll"
date: "2025, 01, 20"
tags: ["flutter", "listview", "infinite-scroll", "pagination", "ui"]
difficulty: "medium"
draft: false
---

## Infinite Scroll with ListView

Implementing infinite scroll in Flutter is a common requirement for apps that display large lists of data. This tutorial will show you how to create an efficient infinite scroll implementation using ListView and pagination.

## Features

- Smooth infinite scrolling
- Efficient data loading
- Loading indicators
- Error handling
- Pull-to-refresh
- Cached data

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     http: ^1.1.0
     cached_network_image: ^3.3.0
     pull_to_refresh: ^2.0.0
   ```

2. **Create Data Model**

   ```dart
   class Post {
     final int id;
     final String title;
     final String body;
     final String? imageUrl;

     Post({
       required this.id,
       required this.title,
       required this.body,
       this.imageUrl,
     });

     factory Post.fromJson(Map<String, dynamic> json) {
       return Post(
         id: json['id'],
         title: json['title'],
         body: json['body'],
         imageUrl: json['imageUrl'],
       );
     }
   }
   ```

3. **Create API Service**

   ```dart
   class ApiService {
     static const String baseUrl = 'https://api.example.com';
     static const int pageSize = 20;

     Future<List<Post>> getPosts(int page) async {
       try {
         final response = await http.get(
           Uri.parse('$baseUrl/posts?_page=$page&_limit=$pageSize'),
         );

         if (response.statusCode == 200) {
           final List<dynamic> data = json.decode(response.body);
           return data.map((json) => Post.fromJson(json)).toList();
         } else {
           throw Exception('Failed to load posts');
         }
       } catch (e) {
         throw Exception('Error: $e');
       }
     }
   }
   ```

4. **Create Post Provider**

   ```dart
   class PostProvider extends ChangeNotifier {
     final ApiService _apiService = ApiService();
     List<Post> _posts = [];
     bool _isLoading = false;
     bool _hasMore = true;
     int _currentPage = 1;
     String? _error;

     List<Post> get posts => _posts;
     bool get isLoading => _isLoading;
     bool get hasMore => _hasMore;
     String? get error => _error;

     Future<void> loadPosts({bool refresh = false}) async {
       if (refresh) {
         _currentPage = 1;
         _posts = [];
         _hasMore = true;
         _error = null;
       }

       if (_isLoading || !_hasMore) return;

       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         final newPosts = await _apiService.getPosts(_currentPage);

         if (newPosts.isEmpty) {
           _hasMore = false;
         } else {
           _posts.addAll(newPosts);
           _currentPage++;
         }
       } catch (e) {
         _error = e.toString();
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }

     Future<void> refresh() async {
       await loadPosts(refresh: true);
     }
   }
   ```

5. **Create Infinite Scroll List**

   ```dart
   class InfiniteScrollList extends StatefulWidget {
     @override
     _InfiniteScrollListState createState() => _InfiniteScrollListState();
   }

   class _InfiniteScrollListState extends State<InfiniteScrollList> {
     final ScrollController _scrollController = ScrollController();
     final RefreshController _refreshController = RefreshController();

     @override
     void initState() {
       super.initState();
       _scrollController.addListener(_onScroll);
       WidgetsBinding.instance.addPostFrameCallback((_) {
         context.read<PostProvider>().loadPosts();
       });
     }

     void _onScroll() {
       if (_scrollController.position.pixels >=
           _scrollController.position.maxScrollExtent - 200) {
         context.read<PostProvider>().loadPosts();
       }
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Infinite Scroll Demo'),
         ),
         body: Consumer<PostProvider>(
           builder: (context, postProvider, child) {
             if (postProvider.error != null && postProvider.posts.isEmpty) {
               return Center(
                 child: Column(
                   mainAxisAlignment: MainAxisAlignment.center,
                   children: [
                     Text('Error: ${postProvider.error}'),
                     ElevatedButton(
                       onPressed: () => postProvider.refresh(),
                       child: Text('Retry'),
                     ),
                   ],
                 ),
               );
             }

             return SmartRefresher(
               controller: _refreshController,
               enablePullDown: true,
               enablePullUp: false,
               onRefresh: () async {
                 await postProvider.refresh();
                 _refreshController.refreshCompleted();
               },
               child: ListView.builder(
                 controller: _scrollController,
                 itemCount: postProvider.posts.length + 1,
                 itemBuilder: (context, index) {
                   if (index == postProvider.posts.length) {
                     if (postProvider.isLoading) {
                       return Center(
                         child: Padding(
                           padding: EdgeInsets.all(16.0),
                           child: CircularProgressIndicator(),
                         ),
                       );
                     } else if (!postProvider.hasMore) {
                       return Center(
                         child: Padding(
                           padding: EdgeInsets.all(16.0),
                           child: Text('No more posts'),
                         ),
                       );
                     }
                     return SizedBox.shrink();
                   }

                   final post = postProvider.posts[index];
                   return PostCard(post: post);
                 },
               ),
             );
           },
         ),
       );
     }

     @override
     void dispose() {
       _scrollController.dispose();
       _refreshController.dispose();
       super.dispose();
     }
   }
   ```

6. **Create Post Card Widget**

   ```dart
   class PostCard extends StatelessWidget {
     final Post post;

     const PostCard({required this.post});

     @override
     Widget build(BuildContext context) {
       return Card(
         margin: EdgeInsets.all(8.0),
         child: Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           children: [
             if (post.imageUrl != null)
               CachedNetworkImage(
                 imageUrl: post.imageUrl!,
                 height: 200,
                 width: double.infinity,
                 fit: BoxFit.cover,
                 placeholder: (context, url) => Center(
                   child: CircularProgressIndicator(),
                 ),
                 errorWidget: (context, url, error) => Icon(Icons.error),
               ),
             Padding(
               padding: EdgeInsets.all(16.0),
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Text(
                     post.title,
                     style: Theme.of(context).textTheme.titleLarge,
                   ),
                   SizedBox(height: 8),
                   Text(
                     post.body,
                     style: Theme.of(context).textTheme.bodyMedium,
                   ),
                 ],
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance Optimization**

   - Use `ListView.builder` for efficient rendering
   - Implement proper caching for images
   - Avoid unnecessary rebuilds
   - Use pagination to limit data load

2. **Error Handling**

   - Handle network errors gracefully
   - Show appropriate error messages
   - Provide retry functionality
   - Implement offline support

3. **User Experience**

   - Show loading indicators
   - Implement pull-to-refresh
   - Add smooth animations
   - Handle edge cases

4. **Memory Management**
   - Dispose controllers properly
   - Clear cached data when needed
   - Implement proper state management
   - Handle widget lifecycle

## Conclusion

This tutorial has shown you how to implement infinite scroll in Flutter with features like:

- Efficient data loading
- Pull-to-refresh
- Error handling
- Loading states
- Image caching
- Clean architecture

You can extend this implementation by adding:

- Search functionality
- Filtering options
- Sorting capabilities
- Offline support
- Data persistence
- Custom animations
- Advanced caching

Remember to test your implementation with different data sizes and network conditions to ensure a smooth user experience.
