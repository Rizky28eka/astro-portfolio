---
title: "Draggable Widgets in Flutter"
summary: "Create interactive drag-and-drop UI"
date: "2025, 03, 28"
tags: ["flutter", "draggable", "drag-and-drop", "interactive-ui", "gestures"]
difficulty: "medium"
draft: false
---

## Draggable Widgets in Flutter

Creating interactive drag-and-drop interfaces in Flutter allows you to build engaging user experiences. This tutorial will guide you through implementing various draggable widgets and handling drag-and-drop interactions.

## Features

- Basic draggable widgets
- Drag targets
- Reorderable lists
- Drag feedback
- Drag handles
- Multi-drag support
- Drag constraints
- Custom drag animations

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     provider: ^6.1.1
   ```

2. **Create Draggable Item Model**

   ```dart
   class DraggableItem {
     final String id;
     final String title;
     final Color color;
     bool isDragging;

     DraggableItem({
       required this.id,
       required this.title,
       required this.color,
       this.isDragging = false,
     });

     DraggableItem copyWith({
       String? id,
       String? title,
       Color? color,
       bool? isDragging,
     }) {
       return DraggableItem(
         id: id ?? this.id,
         title: title ?? this.title,
         color: color ?? this.color,
         isDragging: isDragging ?? this.isDragging,
       );
     }
   }
   ```

3. **Create Drag Provider**

   ```dart
   class DragProvider extends ChangeNotifier {
     List<DraggableItem> _items = [];
     List<DraggableItem> _droppedItems = [];

     List<DraggableItem> get items => _items;
     List<DraggableItem> get droppedItems => _droppedItems;

     DragProvider() {
       _initializeItems();
     }

     void _initializeItems() {
       _items = List.generate(
         10,
         (index) => DraggableItem(
           id: 'item_$index',
           title: 'Item ${index + 1}',
           color: Colors.primaries[index % Colors.primaries.length],
         ),
       );
     }

     void updateItemDragging(String id, bool isDragging) {
       final index = _items.indexWhere((item) => item.id == id);
       if (index != -1) {
         _items[index] = _items[index].copyWith(isDragging: isDragging);
         notifyListeners();
       }
     }

     void addDroppedItem(DraggableItem item) {
       _droppedItems.add(item);
       notifyListeners();
     }

     void removeDroppedItem(String id) {
       _droppedItems.removeWhere((item) => item.id == id);
       notifyListeners();
     }

     void reorderItems(int oldIndex, int newIndex) {
       if (oldIndex < newIndex) {
         newIndex -= 1;
       }
       final item = _items.removeAt(oldIndex);
       _items.insert(newIndex, item);
       notifyListeners();
     }
   }
   ```

4. **Create Draggable Widgets**

   ```dart
   class DraggableCard extends StatelessWidget {
     final DraggableItem item;
     final VoidCallback onDragStarted;
     final VoidCallback onDragEnded;

     const DraggableCard({
       required this.item,
       required this.onDragStarted,
       required this.onDragEnded,
     });

     @override
     Widget build(BuildContext context) {
       return Draggable<DraggableItem>(
         data: item,
         feedback: Material(
           elevation: 4,
           child: Container(
             width: 150,
             height: 100,
             color: item.color.withOpacity(0.8),
             child: Center(
               child: Text(
                 item.title,
                 style: TextStyle(
                   color: Colors.white,
                   fontSize: 16,
                 ),
               ),
             ),
           ),
         ),
         childWhenDragging: Container(
           width: 150,
           height: 100,
           color: Colors.grey[300],
           child: Center(
             child: Icon(Icons.drag_indicator),
           ),
         ),
         child: Card(
           elevation: item.isDragging ? 8 : 2,
           child: Container(
             width: 150,
             height: 100,
             color: item.color,
             child: Center(
               child: Text(
                 item.title,
                 style: TextStyle(
                   color: Colors.white,
                   fontSize: 16,
                 ),
               ),
             ),
           ),
         ),
         onDragStarted: onDragStarted,
         onDragEnd: (_) => onDragEnded(),
       );
     }
   }

   class DragTargetArea extends StatelessWidget {
     final List<DraggableItem> items;
     final Function(DraggableItem) onAccept;

     const DragTargetArea({
       required this.items,
       required this.onAccept,
     });

     @override
     Widget build(BuildContext context) {
       return DragTarget<DraggableItem>(
         onWillAccept: (item) => true,
         onAccept: onAccept,
         builder: (context, candidateItems, rejectedItems) {
           return Container(
             padding: EdgeInsets.all(16),
             decoration: BoxDecoration(
               border: Border.all(
                 color: candidateItems.isNotEmpty
                     ? Colors.green
                     : Colors.grey[300]!,
                 width: 2,
               ),
               borderRadius: BorderRadius.circular(8),
             ),
             child: Column(
               crossAxisAlignment: CrossAxisAlignment.start,
               children: [
                 Text(
                   'Drop Zone',
                   style: Theme.of(context).textTheme.titleMedium,
                 ),
                 SizedBox(height: 16),
                 Wrap(
                   spacing: 8,
                   runSpacing: 8,
                   children: items.map((item) {
                     return Container(
                       width: 100,
                       height: 60,
                       color: item.color,
                       child: Center(
                         child: Text(
                           item.title,
                           style: TextStyle(color: Colors.white),
                         ),
                       ),
                     );
                   }).toList(),
                 ),
               ],
             ),
           );
         },
       );
     }
   }
   ```

5. **Create Reorderable List**

   ```dart
   class ReorderableItemList extends StatelessWidget {
     final List<DraggableItem> items;
     final Function(int, int) onReorder;

     const ReorderableItemList({
       required this.items,
       required this.onReorder,
     });

     @override
     Widget build(BuildContext context) {
       return ReorderableListView.builder(
         itemCount: items.length,
         onReorder: onReorder,
         itemBuilder: (context, index) {
           final item = items[index];
           return ListTile(
             key: ValueKey(item.id),
             leading: Icon(Icons.drag_indicator),
             title: Text(item.title),
             tileColor: item.color.withOpacity(0.2),
           );
         },
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class DragAndDropScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Drag and Drop Demo'),
         ),
         body: Consumer<DragProvider>(
           builder: (context, provider, child) {
             return Column(
               children: [
                 Expanded(
                   child: SingleChildScrollView(
                     child: Padding(
                       padding: EdgeInsets.all(16),
                       child: Column(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         children: [
                           Text(
                             'Draggable Items',
                             style: Theme.of(context).textTheme.titleLarge,
                           ),
                           SizedBox(height: 16),
                           Wrap(
                             spacing: 8,
                             runSpacing: 8,
                             children: provider.items.map((item) {
                               return DraggableCard(
                                 item: item,
                                 onDragStarted: () =>
                                     provider.updateItemDragging(
                                         item.id, true),
                                 onDragEnded: () =>
                                     provider.updateItemDragging(
                                         item.id, false),
                               );
                             }).toList(),
                           ),
                           SizedBox(height: 32),
                           Text(
                             'Drop Zone',
                             style: Theme.of(context).textTheme.titleLarge,
                           ),
                           SizedBox(height: 16),
                           DragTargetArea(
                             items: provider.droppedItems,
                             onAccept: provider.addDroppedItem,
                           ),
                           SizedBox(height: 32),
                           Text(
                             'Reorderable List',
                             style: Theme.of(context).textTheme.titleLarge,
                           ),
                           SizedBox(height: 16),
                           Container(
                             height: 300,
                             child: ReorderableItemList(
                               items: provider.items,
                               onReorder: provider.reorderItems,
                             ),
                           ),
                         ],
                       ),
                     ),
                   ),
                 ),
               ],
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **Performance**

   - Use const constructors
   - Implement proper keys
   - Optimize rebuilds
   - Handle large lists

2. **User Experience**

   - Provide visual feedback
   - Add animations
   - Handle edge cases
   - Support gestures

3. **Accessibility**

   - Add semantic labels
   - Support screen readers
   - Handle keyboard navigation
   - Consider color contrast

4. **Testing**
   - Test drag interactions
   - Verify drop behavior
   - Check reordering
   - Test edge cases

## Conclusion

This tutorial has shown you how to implement draggable widgets in Flutter with features like:

- Basic drag and drop
- Reorderable lists
- Drag feedback
- Drop targets
- Multi-drag support

You can extend this implementation by adding:

- Custom drag handles
- Drag constraints
- Drag animations
- Gesture recognition
- Multi-touch support

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Optimize performance
- Follow platform guidelines

This implementation provides a solid foundation for creating interactive drag-and-drop interfaces in your Flutter app.
