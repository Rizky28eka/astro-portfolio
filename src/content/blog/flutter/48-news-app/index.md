---
title: "Build a News App"
summary: "News aggregation with Flutter"
date: "2025, 02, 20"
tags: ["flutter", "news", "api", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a News App

Creating a news app is a great way to learn about API integration, data caching, and state management in Flutter. This tutorial will guide you through building a feature-rich news application.

## Features

- News categories
- Search functionality
- Bookmark articles
- Offline reading
- Share articles
- Dark/Light theme
- Push notifications
- Article details

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     http: ^1.1.0
     cached_network_image: ^3.3.0
     shared_preferences: ^2.2.2
     intl: ^0.19.0
     url_launcher: ^6.2.2
     flutter_html: ^3.0.0-beta.2
     share_plus: ^7.2.1
     flutter_dotenv: ^5.1.0
   ```

2. **Create News Model**

   ```dart
   class Article {
     final String id;
     final String title;
     final String description;
     final String content;
     final String url;
     final String imageUrl;
     final String source;
     final String author;
     final DateTime publishedAt;
     final List<String> categories;

     Article({
       required this.id,
       required this.title,
       required this.description,
       required this.content,
       required this.url,
       required this.imageUrl,
       required this.source,
       required this.author,
       required this.publishedAt,
       required this.categories,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'description': description,
         'content': content,
         'url': url,
         'imageUrl': imageUrl,
         'source': source,
         'author': author,
         'publishedAt': publishedAt.millisecondsSinceEpoch,
         'categories': categories,
       };
     }

     factory Article.fromMap(Map<String, dynamic> map) {
       return Article(
         id: map['id'],
         title: map['title'],
         description: map['description'],
         content: map['content'],
         url: map['url'],
         imageUrl: map['imageUrl'],
         source: map['source'],
         author: map['author'],
         publishedAt: DateTime.fromMillisecondsSinceEpoch(map['publishedAt']),
         categories: List<String>.from(map['categories']),
       );
     }
   }
   ```

3. **Create News Service**

   ```dart
   class NewsService {
     final String apiKey;
     final http.Client _client;

     NewsService({required this.apiKey}) : _client = http.Client();

     Future<List<Article>> getTopHeadlines({
       String? category,
       String? query,
       int page = 1,
     }) async {
       final queryParams = {
         'apiKey': apiKey,
         'page': page.toString(),
         if (category != null) 'category': category,
         if (query != null) 'q': query,
       };

       final response = await _client.get(
         Uri.https('newsapi.org', '/v2/top-headlines', queryParams),
       );

       if (response.statusCode == 200) {
         final data = jsonDecode(response.body);
         return (data['articles'] as List).map((article) {
           return Article(
             id: article['url'] ?? '',
             title: article['title'] ?? '',
             description: article['description'] ?? '',
             content: article['content'] ?? '',
             url: article['url'] ?? '',
             imageUrl: article['urlToImage'] ?? '',
             source: article['source']['name'] ?? '',
             author: article['author'] ?? '',
             publishedAt: DateTime.parse(article['publishedAt']),
             categories: [category ?? 'general'],
           );
         }).toList();
       } else {
         throw Exception('Failed to load news');
       }
     }

     Future<List<String>> getCategories() async {
       return [
         'general',
         'business',
         'technology',
         'sports',
         'entertainment',
         'health',
         'science',
       ];
     }
   }
   ```

4. **Create News Provider**

   ```dart
   class NewsProvider extends ChangeNotifier {
     final NewsService _newsService;
     final SharedPreferences _prefs;
     List<Article> _articles = [];
     List<Article> _bookmarkedArticles = [];
     String _selectedCategory = 'general';
     String _searchQuery = '';
     bool _isLoading = false;
     String? _error;

     NewsProvider({
       required NewsService newsService,
       required SharedPreferences prefs,
     })  : _newsService = newsService,
           _prefs = prefs {
     _loadBookmarks();
   }

     List<Article> get articles => _articles;
     List<Article> get bookmarkedArticles => _bookmarkedArticles;
     String get selectedCategory => _selectedCategory;
     String get searchQuery => _searchQuery;
     bool get isLoading => _isLoading;
     String? get error => _error;

     Future<void> loadNews() async {
       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         _articles = await _newsService.getTopHeadlines(
           category: _selectedCategory,
           query: _searchQuery,
         );
       } catch (e) {
         _error = e.toString();
       }

       _isLoading = false;
       notifyListeners();
     }

     void setCategory(String category) {
       _selectedCategory = category;
       loadNews();
     }

     void setSearchQuery(String query) {
       _searchQuery = query;
       loadNews();
     }

     Future<void> _loadBookmarks() async {
       final bookmarksJson = _prefs.getStringList('bookmarks') ?? [];
       _bookmarkedArticles = bookmarksJson
           .map((json) => Article.fromMap(jsonDecode(json)))
           .toList();
       notifyListeners();
     }

     Future<void> toggleBookmark(Article article) async {
       final isBookmarked = _bookmarkedArticles.any((a) => a.id == article.id);
       if (isBookmarked) {
         _bookmarkedArticles.removeWhere((a) => a.id == article.id);
       } else {
         _bookmarkedArticles.add(article);
       }

       final bookmarksJson = _bookmarkedArticles
           .map((article) => jsonEncode(article.toMap()))
           .toList();
       await _prefs.setStringList('bookmarks', bookmarksJson);
       notifyListeners();
     }

     bool isBookmarked(Article article) {
       return _bookmarkedArticles.any((a) => a.id == article.id);
     }
   }
   ```

5. **Create News Widgets**

   ```dart
   class ArticleCard extends StatelessWidget {
     final Article article;
     final VoidCallback onTap;
     final VoidCallback onBookmark;
     final bool isBookmarked;

     const ArticleCard({
       required this.article,
       required this.onTap,
       required this.onBookmark,
       required this.isBookmarked,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         clipBehavior: Clip.antiAlias,
         child: InkWell(
           onTap: onTap,
           child: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               if (article.imageUrl.isNotEmpty)
                 CachedNetworkImage(
                   imageUrl: article.imageUrl,
                   height: 200,
                   width: double.infinity,
                   fit: BoxFit.cover,
                   placeholder: (context, url) => Center(
                     child: CircularProgressIndicator(),
                   ),
                   errorWidget: (context, url, error) => Container(
                     height: 200,
                     color: Colors.grey[300],
                     child: Icon(Icons.error),
                   ),
                 ),
               Padding(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Row(
                       children: [
                         Expanded(
                           child: Text(
                             article.source,
                             style: TextStyle(
                               color: Colors.grey[600],
                               fontSize: 12,
                             ),
                           ),
                         ),
                         IconButton(
                           icon: Icon(
                             isBookmarked
                                 ? Icons.bookmark
                                 : Icons.bookmark_border,
                           ),
                           onPressed: onBookmark,
                         ),
                       ],
                     ),
                     SizedBox(height: 8),
                     Text(
                       article.title,
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 8),
                     Text(
                       article.description,
                       style: Theme.of(context).textTheme.bodyMedium,
                       maxLines: 3,
                       overflow: TextOverflow.ellipsis,
                     ),
                     SizedBox(height: 8),
                     Row(
                       children: [
                         Icon(Icons.person, size: 16),
                         SizedBox(width: 4),
                         Text(
                           article.author,
                           style: TextStyle(fontSize: 12),
                         ),
                         SizedBox(width: 16),
                         Icon(Icons.access_time, size: 16),
                         SizedBox(width: 4),
                         Text(
                           DateFormat('MMM d, y').format(article.publishedAt),
                           style: TextStyle(fontSize: 12),
                         ),
                       ],
                     ),
                   ],
                 ),
               ),
             ],
           ),
         ),
       );
     }
   }

   class CategoryChip extends StatelessWidget {
     final String category;
     final bool isSelected;
     final VoidCallback onTap;

     const CategoryChip({
       required this.category,
       required this.isSelected,
       required this.onTap,
     });

     @override
     Widget build(BuildContext context) {
       return FilterChip(
         label: Text(
           category.toUpperCase(),
           style: TextStyle(
             color: isSelected ? Colors.white : null,
           ),
         ),
         selected: isSelected,
         onSelected: (_) => onTap(),
         backgroundColor: isSelected
             ? Theme.of(context).primaryColor
             : Theme.of(context).cardColor,
       );
     }
   }
   ```

6. **Create Article Detail Screen**

   ```dart
   class ArticleDetailScreen extends StatelessWidget {
     final Article article;

     const ArticleDetailScreen({required this.article});

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: CustomScrollView(
           slivers: [
             SliverAppBar(
               expandedHeight: 300,
               pinned: true,
               flexibleSpace: FlexibleSpaceBar(
                 background: CachedNetworkImage(
                   imageUrl: article.imageUrl,
                   fit: BoxFit.cover,
                 ),
               ),
             ),
             SliverToBoxAdapter(
               child: Padding(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text(
                       article.title,
                       style: Theme.of(context).textTheme.headlineMedium,
                     ),
                     SizedBox(height: 8),
                     Row(
                       children: [
                         Icon(Icons.person, size: 16),
                         SizedBox(width: 4),
                         Text(article.author),
                         SizedBox(width: 16),
                         Icon(Icons.access_time, size: 16),
                         SizedBox(width: 4),
                         Text(
                           DateFormat('MMM d, y').format(article.publishedAt),
                         ),
                       ],
                     ),
                     SizedBox(height: 16),
                     Html(
                       data: article.content,
                       style: {
                         'body': Style(
                           fontSize: FontSize(16),
                           lineHeight: LineHeight(1.5),
                         ),
                       },
                     ),
                   ],
                 ),
               ),
             ),
           ],
         ),
         floatingActionButton: FloatingActionButton(
           onPressed: () {
             Share.share(
               'Check out this article: ${article.title}\n${article.url}',
             );
           },
           child: Icon(Icons.share),
         ),
       );
     }
   }
   ```

7. **Create Main News Screen**

   ```dart
   class NewsScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('News'),
           actions: [
             IconButton(
               icon: Icon(Icons.bookmark),
               onPressed: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => BookmarkedArticlesScreen(),
                   ),
                 );
               },
             ),
           ],
         ),
         body: Column(
           children: [
             Padding(
               padding: EdgeInsets.all(16),
               child: TextField(
                 decoration: InputDecoration(
                   labelText: 'Search',
                   prefixIcon: Icon(Icons.search),
                   border: OutlineInputBorder(),
                 ),
                 onChanged: (value) {
                   context.read<NewsProvider>().setSearchQuery(value);
                 },
               ),
             ),
             Container(
               height: 50,
               child: Consumer<NewsProvider>(
                 builder: (context, newsProvider, child) {
                   return ListView.builder(
                     scrollDirection: Axis.horizontal,
                     padding: EdgeInsets.symmetric(horizontal: 16),
                     itemCount: newsProvider.categories.length,
                     itemBuilder: (context, index) {
                       final category = newsProvider.categories[index];
                       return Padding(
                         padding: EdgeInsets.only(right: 8),
                         child: CategoryChip(
                           category: category,
                           isSelected: category == newsProvider.selectedCategory,
                           onTap: () {
                             newsProvider.setCategory(category);
                           },
                         ),
                       );
                     },
                   );
                 },
               ),
             ),
             Expanded(
               child: Consumer<NewsProvider>(
                 builder: (context, newsProvider, child) {
                   if (newsProvider.isLoading) {
                     return Center(child: CircularProgressIndicator());
                   }

                   if (newsProvider.error != null) {
                     return Center(
                       child: Text(newsProvider.error!),
                     );
                   }

                   if (newsProvider.articles.isEmpty) {
                     return Center(
                       child: Text('No articles found'),
                     );
                   }

                   return RefreshIndicator(
                     onRefresh: () => newsProvider.loadNews(),
                     child: ListView.builder(
                       itemCount: newsProvider.articles.length,
                       itemBuilder: (context, index) {
                         final article = newsProvider.articles[index];
                         return ArticleCard(
                           article: article,
                           onTap: () {
                             Navigator.push(
                               context,
                               MaterialPageRoute(
                                 builder: (context) =>
                                     ArticleDetailScreen(article: article),
                               ),
                             );
                           },
                           onBookmark: () {
                             newsProvider.toggleBookmark(article);
                           },
                           isBookmarked: newsProvider.isBookmarked(article),
                         );
                       },
                     ),
                   );
                 },
               ),
             ),
           ],
         ),
       );
     }
   }
   ```

## Best Practices

1. **API Integration**

   - Handle API errors
   - Implement rate limiting
   - Cache responses
   - Handle offline mode

2. **Data Management**

   - Implement proper caching
   - Handle data persistence
   - Optimize memory usage
   - Clean up resources

3. **User Experience**

   - Show loading states
   - Provide error feedback
   - Implement pull-to-refresh
   - Add animations

4. **Performance**
   - Optimize image loading
   - Implement pagination
   - Handle large lists
   - Cache frequently used data

## Conclusion

This tutorial has shown you how to create a news app with features like:

- News categories
- Article search
- Bookmarking
- Offline reading
- Article sharing
- Article details

You can extend this app by adding:

- Push notifications
- User preferences
- Article comments
- Social sharing
- Reading history
- Custom themes

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's API integration, data caching, and state management.
