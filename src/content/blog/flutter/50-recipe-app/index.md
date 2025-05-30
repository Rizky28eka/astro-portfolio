---
title: "Build a Recipe App"
summary: "Recipe management with Flutter"
date: "2025, 03, 01"
tags: ["flutter", "recipe", "local-storage", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Recipe App

Creating a recipe app is a great way to learn about data management, image handling, and state management in Flutter. This tutorial will guide you through building a feature-rich recipe application.

## Features

- Browse recipes
- Add new recipes
- Edit recipes
- Delete recipes
- Search recipes
- Filter by category
- Save favorites
- Share recipes
- Shopping list
- Meal planning

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     sqflite: ^2.3.2
     path: ^1.8.3
     provider: ^6.1.1
     image_picker: ^1.0.7
     path_provider: ^2.1.2
     intl: ^0.19.0
     uuid: ^4.2.2
     share_plus: ^7.2.1
     flutter_markdown: ^0.6.18
   ```

2. **Create Recipe Models**

   ```dart
   class Recipe {
     final String id;
     final String title;
     final String description;
     final String instructions;
     final List<String> ingredients;
     final List<String> categories;
     final String? imagePath;
     final int prepTime;
     final int cookTime;
     final int servings;
     final bool isFavorite;
     final DateTime createdAt;
     final DateTime updatedAt;

     Recipe({
       required this.id,
       required this.title,
       required this.description,
       required this.instructions,
       required this.ingredients,
       required this.categories,
       this.imagePath,
       required this.prepTime,
       required this.cookTime,
       required this.servings,
       this.isFavorite = false,
       required this.createdAt,
       required this.updatedAt,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'title': title,
         'description': description,
         'instructions': instructions,
         'ingredients': ingredients.join(','),
         'categories': categories.join(','),
         'imagePath': imagePath,
         'prepTime': prepTime,
         'cookTime': cookTime,
         'servings': servings,
         'isFavorite': isFavorite ? 1 : 0,
         'createdAt': createdAt.millisecondsSinceEpoch,
         'updatedAt': updatedAt.millisecondsSinceEpoch,
       };
     }

     factory Recipe.fromMap(Map<String, dynamic> map) {
       return Recipe(
         id: map['id'],
         title: map['title'],
         description: map['description'],
         instructions: map['instructions'],
         ingredients: map['ingredients'].split(','),
         categories: map['categories'].split(','),
         imagePath: map['imagePath'],
         prepTime: map['prepTime'],
         cookTime: map['cookTime'],
         servings: map['servings'],
         isFavorite: map['isFavorite'] == 1,
         createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
         updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt']),
       );
     }

     Recipe copyWith({
       String? id,
       String? title,
       String? description,
       String? instructions,
       List<String>? ingredients,
       List<String>? categories,
       String? imagePath,
       int? prepTime,
       int? cookTime,
       int? servings,
       bool? isFavorite,
       DateTime? createdAt,
       DateTime? updatedAt,
     }) {
       return Recipe(
         id: id ?? this.id,
         title: title ?? this.title,
         description: description ?? this.description,
         instructions: instructions ?? this.instructions,
         ingredients: ingredients ?? this.ingredients,
         categories: categories ?? this.categories,
         imagePath: imagePath ?? this.imagePath,
         prepTime: prepTime ?? this.prepTime,
         cookTime: cookTime ?? this.cookTime,
         servings: servings ?? this.servings,
         isFavorite: isFavorite ?? this.isFavorite,
         createdAt: createdAt ?? this.createdAt,
         updatedAt: updatedAt ?? this.updatedAt,
       );
     }
   }

   class ShoppingItem {
     final String id;
     final String name;
     final String recipeId;
     final bool isChecked;

     ShoppingItem({
       required this.id,
       required this.name,
       required this.recipeId,
       this.isChecked = false,
     });

     Map<String, dynamic> toMap() {
       return {
         'id': id,
         'name': name,
         'recipeId': recipeId,
         'isChecked': isChecked ? 1 : 0,
       };
     }

     factory ShoppingItem.fromMap(Map<String, dynamic> map) {
       return ShoppingItem(
         id: map['id'],
         name: map['name'],
         recipeId: map['recipeId'],
         isChecked: map['isChecked'] == 1,
       );
     }

     ShoppingItem copyWith({
       String? id,
       String? name,
       String? recipeId,
       bool? isChecked,
     }) {
       return ShoppingItem(
         id: id ?? this.id,
         name: name ?? this.name,
         recipeId: recipeId ?? this.recipeId,
         isChecked: isChecked ?? this.isChecked,
       );
     }
   }
   ```

3. **Create Database Helper**

   ```dart
   class DatabaseHelper {
     static final DatabaseHelper _instance = DatabaseHelper._internal();
     static Database? _database;

     factory DatabaseHelper() => _instance;

     DatabaseHelper._internal();

     Future<Database> get database async {
       if (_database != null) return _database!;
       _database = await _initDatabase();
       return _database!;
     }

     Future<Database> _initDatabase() async {
       final dbPath = await getDatabasesPath();
       final path = join(dbPath, 'recipe_app.db');

       return await openDatabase(
         path,
         version: 1,
         onCreate: (db, version) async {
           await db.execute('''
             CREATE TABLE recipes(
               id TEXT PRIMARY KEY,
               title TEXT NOT NULL,
               description TEXT NOT NULL,
               instructions TEXT NOT NULL,
               ingredients TEXT NOT NULL,
               categories TEXT NOT NULL,
               imagePath TEXT,
               prepTime INTEGER NOT NULL,
               cookTime INTEGER NOT NULL,
               servings INTEGER NOT NULL,
               isFavorite INTEGER NOT NULL,
               createdAt INTEGER NOT NULL,
               updatedAt INTEGER NOT NULL
             )
           ''');

           await db.execute('''
             CREATE TABLE shopping_items(
               id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               recipeId TEXT NOT NULL,
               isChecked INTEGER NOT NULL,
               FOREIGN KEY (recipeId) REFERENCES recipes (id)
                 ON DELETE CASCADE
             )
           ''');
         },
       );
     }

     Future<void> insertRecipe(Recipe recipe) async {
       final db = await database;
       await db.insert(
         'recipes',
         recipe.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateRecipe(Recipe recipe) async {
       final db = await database;
       await db.update(
         'recipes',
         recipe.toMap(),
         where: 'id = ?',
         whereArgs: [recipe.id],
       );
     }

     Future<void> deleteRecipe(String id) async {
       final db = await database;
       await db.delete(
         'recipes',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<Recipe>> getAllRecipes() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('recipes');
       return List.generate(maps.length, (i) => Recipe.fromMap(maps[i]));
     }

     Future<List<Recipe>> getFavoriteRecipes() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'recipes',
         where: 'isFavorite = ?',
         whereArgs: [1],
       );
       return List.generate(maps.length, (i) => Recipe.fromMap(maps[i]));
     }

     Future<List<Recipe>> searchRecipes(String query) async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query(
         'recipes',
         where: 'title LIKE ? OR description LIKE ?',
         whereArgs: ['%$query%', '%$query%'],
       );
       return List.generate(maps.length, (i) => Recipe.fromMap(maps[i]));
     }

     Future<void> insertShoppingItem(ShoppingItem item) async {
       final db = await database;
       await db.insert(
         'shopping_items',
         item.toMap(),
         conflictAlgorithm: ConflictAlgorithm.replace,
       );
     }

     Future<void> updateShoppingItem(ShoppingItem item) async {
       final db = await database;
       await db.update(
         'shopping_items',
         item.toMap(),
         where: 'id = ?',
         whereArgs: [item.id],
       );
     }

     Future<void> deleteShoppingItem(String id) async {
       final db = await database;
       await db.delete(
         'shopping_items',
         where: 'id = ?',
         whereArgs: [id],
       );
     }

     Future<List<ShoppingItem>> getAllShoppingItems() async {
       final db = await database;
       final List<Map<String, dynamic>> maps = await db.query('shopping_items');
       return List.generate(maps.length, (i) => ShoppingItem.fromMap(maps[i]));
     }
   }
   ```

4. **Create Recipe Provider**

   ```dart
   class RecipeProvider extends ChangeNotifier {
     final DatabaseHelper _dbHelper;
     List<Recipe> _recipes = [];
     List<Recipe> _favoriteRecipes = [];
     List<ShoppingItem> _shoppingItems = [];
     String _searchQuery = '';
     String _selectedCategory = 'All';

     RecipeProvider({required DatabaseHelper dbHelper})
         : _dbHelper = dbHelper {
       loadRecipes();
       loadShoppingItems();
     }

     List<Recipe> get recipes => _recipes;
     List<Recipe> get favoriteRecipes => _favoriteRecipes;
     List<ShoppingItem> get shoppingItems => _shoppingItems;
     String get searchQuery => _searchQuery;
     String get selectedCategory => _selectedCategory;

     Future<void> loadRecipes() async {
       _recipes = await _dbHelper.getAllRecipes();
       _favoriteRecipes = await _dbHelper.getFavoriteRecipes();
       notifyListeners();
     }

     Future<void> loadShoppingItems() async {
       _shoppingItems = await _dbHelper.getAllShoppingItems();
       notifyListeners();
     }

     Future<void> addRecipe(Recipe recipe) async {
       await _dbHelper.insertRecipe(recipe);
       _recipes.add(recipe);
       notifyListeners();
     }

     Future<void> updateRecipe(Recipe recipe) async {
       await _dbHelper.updateRecipe(recipe);
       final index = _recipes.indexWhere((r) => r.id == recipe.id);
       if (index != -1) {
         _recipes[index] = recipe;
       }
       if (recipe.isFavorite) {
         _favoriteRecipes.add(recipe);
       } else {
         _favoriteRecipes.removeWhere((r) => r.id == recipe.id);
       }
       notifyListeners();
     }

     Future<void> deleteRecipe(String id) async {
       await _dbHelper.deleteRecipe(id);
       _recipes.removeWhere((r) => r.id == id);
       _favoriteRecipes.removeWhere((r) => r.id == id);
       notifyListeners();
     }

     Future<void> toggleFavorite(Recipe recipe) async {
       final updatedRecipe = recipe.copyWith(
         isFavorite: !recipe.isFavorite,
         updatedAt: DateTime.now(),
       );
       await updateRecipe(updatedRecipe);
     }

     Future<void> setSearchQuery(String query) async {
       _searchQuery = query;
       if (query.isEmpty) {
         await loadRecipes();
       } else {
         _recipes = await _dbHelper.searchRecipes(query);
         notifyListeners();
       }
     }

     Future<void> setCategory(String category) async {
       _selectedCategory = category;
       if (category == 'All') {
         await loadRecipes();
       } else {
         _recipes = _recipes.where((r) => r.categories.contains(category)).toList();
         notifyListeners();
       }
     }

     Future<void> addToShoppingList(String recipeId) async {
       final recipe = _recipes.firstWhere((r) => r.id == recipeId);
       for (final ingredient in recipe.ingredients) {
         final item = ShoppingItem(
           id: const Uuid().v4(),
           name: ingredient,
           recipeId: recipeId,
         );
         await _dbHelper.insertShoppingItem(item);
         _shoppingItems.add(item);
       }
       notifyListeners();
     }

     Future<void> toggleShoppingItem(ShoppingItem item) async {
       final updatedItem = item.copyWith(isChecked: !item.isChecked);
       await _dbHelper.updateShoppingItem(updatedItem);
       final index = _shoppingItems.indexWhere((i) => i.id == item.id);
       if (index != -1) {
         _shoppingItems[index] = updatedItem;
       }
       notifyListeners();
     }

     Future<void> removeFromShoppingList(String id) async {
       await _dbHelper.deleteShoppingItem(id);
       _shoppingItems.removeWhere((i) => i.id == id);
       notifyListeners();
     }
   }
   ```

5. **Create Recipe Widgets**

   ```dart
   class RecipeCard extends StatelessWidget {
     final Recipe recipe;
     final VoidCallback onTap;
     final VoidCallback onFavorite;
     final VoidCallback onAddToShoppingList;

     const RecipeCard({
       required this.recipe,
       required this.onTap,
       required this.onFavorite,
       required this.onAddToShoppingList,
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
               if (recipe.imagePath != null)
                 Image.file(
                   File(recipe.imagePath!),
                   height: 200,
                   width: double.infinity,
                   fit: BoxFit.cover,
                 )
               else
                 Container(
                   height: 200,
                   color: Colors.grey[300],
                   child: Icon(
                     Icons.restaurant,
                     size: 64,
                     color: Colors.grey[400],
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
                             recipe.title,
                             style: Theme.of(context).textTheme.titleLarge,
                           ),
                         ),
                         IconButton(
                           icon: Icon(
                             recipe.isFavorite
                                 ? Icons.favorite
                                 : Icons.favorite_border,
                             color: recipe.isFavorite ? Colors.red : null,
                           ),
                           onPressed: onFavorite,
                         ),
                       ],
                     ),
                     SizedBox(height: 8),
                     Text(
                       recipe.description,
                       style: Theme.of(context).textTheme.bodyMedium,
                       maxLines: 2,
                       overflow: TextOverflow.ellipsis,
                     ),
                     SizedBox(height: 16),
                     Row(
                       children: [
                         Icon(Icons.timer, size: 16),
                         SizedBox(width: 4),
                         Text(
                           '${recipe.prepTime + recipe.cookTime} min',
                           style: TextStyle(fontSize: 12),
                         ),
                         SizedBox(width: 16),
                         Icon(Icons.people, size: 16),
                         SizedBox(width: 4),
                         Text(
                           '${recipe.servings} servings',
                           style: TextStyle(fontSize: 12),
                         ),
                       ],
                     ),
                     SizedBox(height: 8),
                     Wrap(
                       spacing: 8,
                       children: recipe.categories.map((category) {
                         return Chip(
                           label: Text(category),
                           backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                         );
                       }).toList(),
                     ),
                     SizedBox(height: 8),
                     ElevatedButton.icon(
                       onPressed: onAddToShoppingList,
                       icon: Icon(Icons.shopping_cart),
                       label: Text('Add to Shopping List'),
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

   class ShoppingListItem extends StatelessWidget {
     final ShoppingItem item;
     final VoidCallback onToggle;
     final VoidCallback onDelete;

     const ShoppingListItem({
       required this.item,
       required this.onToggle,
       required this.onDelete,
     });

     @override
     Widget build(BuildContext context) {
       return ListTile(
         leading: Checkbox(
           value: item.isChecked,
           onChanged: (_) => onToggle(),
         ),
         title: Text(
           item.name,
           style: TextStyle(
             decoration: item.isChecked ? TextDecoration.lineThrough : null,
           ),
         ),
         trailing: IconButton(
           icon: Icon(Icons.delete),
           onPressed: onDelete,
         ),
       );
     }
   }
   ```

6. **Create Recipe Detail Screen**

   ```dart
   class RecipeDetailScreen extends StatelessWidget {
     final Recipe recipe;

     const RecipeDetailScreen({required this.recipe});

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         body: CustomScrollView(
           slivers: [
             SliverAppBar(
               expandedHeight: 300,
               pinned: true,
               flexibleSpace: FlexibleSpaceBar(
                 background: recipe.imagePath != null
                     ? Image.file(
                         File(recipe.imagePath!),
                         fit: BoxFit.cover,
                       )
                     : Container(
                         color: Colors.grey[300],
                         child: Icon(
                           Icons.restaurant,
                           size: 100,
                           color: Colors.grey[400],
                         ),
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
                       recipe.title,
                       style: Theme.of(context).textTheme.headlineMedium,
                     ),
                     SizedBox(height: 8),
                     Row(
                       children: [
                         Icon(Icons.timer, size: 16),
                         SizedBox(width: 4),
                         Text('Prep: ${recipe.prepTime} min'),
                         SizedBox(width: 16),
                         Text('Cook: ${recipe.cookTime} min'),
                         SizedBox(width: 16),
                         Icon(Icons.people, size: 16),
                         SizedBox(width: 4),
                         Text('${recipe.servings} servings'),
                       ],
                     ),
                     SizedBox(height: 16),
                     Text(
                       'Description',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 8),
                     Text(recipe.description),
                     SizedBox(height: 16),
                     Text(
                       'Ingredients',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 8),
                     ListView.builder(
                       shrinkWrap: true,
                       physics: NeverScrollableScrollPhysics(),
                       itemCount: recipe.ingredients.length,
                       itemBuilder: (context, index) {
                         return ListTile(
                           leading: Icon(Icons.circle, size: 8),
                           title: Text(recipe.ingredients[index]),
                         );
                       },
                     ),
                     SizedBox(height: 16),
                     Text(
                       'Instructions',
                       style: Theme.of(context).textTheme.titleLarge,
                     ),
                     SizedBox(height: 8),
                     MarkdownBody(
                       data: recipe.instructions,
                     ),
                     SizedBox(height: 16),
                     Wrap(
                       spacing: 8,
                       children: recipe.categories.map((category) {
                         return Chip(
                           label: Text(category),
                           backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                         );
                       }).toList(),
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
               'Check out this recipe: ${recipe.title}\n\n'
               'Prep Time: ${recipe.prepTime} min\n'
               'Cook Time: ${recipe.cookTime} min\n'
               'Servings: ${recipe.servings}\n\n'
               'Ingredients:\n${recipe.ingredients.join('\n')}\n\n'
               'Instructions:\n${recipe.instructions}',
             );
           },
           child: Icon(Icons.share),
         ),
       );
     }
   }
   ```

7. **Create Main Recipe Screen**

   ```dart
   class RecipeScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Recipes'),
           actions: [
             IconButton(
               icon: Icon(Icons.favorite),
               onPressed: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => FavoriteRecipesScreen(),
                   ),
                 );
               },
             ),
             IconButton(
               icon: Icon(Icons.shopping_cart),
               onPressed: () {
                 Navigator.push(
                   context,
                   MaterialPageRoute(
                     builder: (context) => ShoppingListScreen(),
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
                   context.read<RecipeProvider>().setSearchQuery(value);
                 },
               ),
             ),
             Container(
               height: 50,
               child: Consumer<RecipeProvider>(
                 builder: (context, provider, child) {
                   return ListView.builder(
                     scrollDirection: Axis.horizontal,
                     padding: EdgeInsets.symmetric(horizontal: 16),
                     itemCount: provider.categories.length,
                     itemBuilder: (context, index) {
                       final category = provider.categories[index];
                       return Padding(
                         padding: EdgeInsets.only(right: 8),
                         child: FilterChip(
                           label: Text(category),
                           selected: category == provider.selectedCategory,
                           onSelected: (_) {
                             provider.setCategory(category);
                           },
                         ),
                       );
                     },
                   );
                 },
               ),
             ),
             Expanded(
               child: Consumer<RecipeProvider>(
                 builder: (context, provider, child) {
                   if (provider.recipes.isEmpty) {
                     return Center(
                       child: Text('No recipes found'),
                     );
                   }

                   return ListView.builder(
                     itemCount: provider.recipes.length,
                     itemBuilder: (context, index) {
                       final recipe = provider.recipes[index];
                       return RecipeCard(
                         recipe: recipe,
                         onTap: () {
                           Navigator.push(
                             context,
                             MaterialPageRoute(
                               builder: (context) =>
                                   RecipeDetailScreen(recipe: recipe),
                             ),
                           );
                         },
                         onFavorite: () {
                           provider.toggleFavorite(recipe);
                         },
                         onAddToShoppingList: () {
                           provider.addToShoppingList(recipe.id);
                         },
                       );
                     },
                   );
                 },
               ),
             ),
           ],
         ),
         floatingActionButton: FloatingActionButton(
           onPressed: () {
             Navigator.push(
               context,
               MaterialPageRoute(
                 builder: (context) => AddRecipeScreen(),
               ),
             );
           },
           child: Icon(Icons.add),
         ),
       );
     }
   }
   ```

## Best Practices

1. **Data Management**

   - Implement proper database structure
   - Handle data persistence
   - Optimize queries
   - Clean up resources

2. **Image Handling**

   - Optimize image loading
   - Handle image compression
   - Manage storage
   - Handle errors

3. **User Experience**

   - Show loading states
   - Provide error feedback
   - Add animations
   - Handle gestures

4. **Performance**
   - Optimize list rendering
   - Handle large datasets
   - Cache images
   - Clean up resources

## Conclusion

This tutorial has shown you how to create a recipe app with features like:

- Recipe management
- Shopping list
- Favorites
- Search and filter
- Image handling
- Sharing

You can extend this app by adding:

- Meal planning
- Nutritional information
- User ratings
- Comments
- Social features
- Custom themes

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's data management, image handling, and state management.
