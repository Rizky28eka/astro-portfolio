---
title: "Build a Calculator App"
summary: "Basic calculator with Flutter"
date: "2025, 03, 20"
tags: ["flutter", "calculator", "state-management", "ui"]
difficulty: "beginner"
draft: false
---

## Build a Calculator App

Creating a calculator app is a great way to learn about state management, UI design, and basic arithmetic operations in Flutter. This tutorial will guide you through building a feature-rich calculator application.

## Features

- Basic arithmetic operations
- Scientific functions
- Memory operations
- History tracking
- Dark/light theme
- Keyboard support
- Copy result
- Clear history

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     provider: ^6.1.1
     shared_preferences: ^2.2.2
     math_expressions: ^2.4.0
   ```

2. **Create Calculator Model**

   ```dart
   class CalculatorModel {
     String _currentInput = '0';
     String _previousInput = '';
     String _operation = '';
     List<String> _history = [];
     double _memory = 0;

     String get currentInput => _currentInput;
     String get previousInput => _previousInput;
     String get operation => _operation;
     List<String> get history => _history;
     double get memory => _memory;

     void appendDigit(String digit) {
       if (_currentInput == '0') {
         _currentInput = digit;
       } else {
         _currentInput += digit;
       }
     }

     void appendDecimal() {
       if (!_currentInput.contains('.')) {
         _currentInput += '.';
       }
     }

     void setOperation(String op) {
       if (_currentInput.isNotEmpty) {
         if (_previousInput.isNotEmpty) {
           calculate();
         }
         _previousInput = _currentInput;
         _currentInput = '0';
         _operation = op;
       }
     }

     void calculate() {
       if (_previousInput.isEmpty || _currentInput.isEmpty) return;

       double prev = double.parse(_previousInput);
       double current = double.parse(_currentInput);
       double result = 0;

       switch (_operation) {
         case '+':
           result = prev + current;
           break;
         case '-':
           result = prev - current;
           break;
         case '×':
           result = prev * current;
           break;
         case '÷':
           if (current != 0) {
             result = prev / current;
           } else {
             _currentInput = 'Error';
             return;
           }
           break;
         case '%':
           result = prev % current;
           break;
         case '^':
           result = pow(prev, current).toDouble();
           break;
       }

       _history.add('$_previousInput $_operation $_currentInput = $result');
       _currentInput = result.toString();
       _previousInput = '';
       _operation = '';
     }

     void clear() {
       _currentInput = '0';
       _previousInput = '';
       _operation = '';
     }

     void clearHistory() {
       _history.clear();
     }

     void memoryAdd() {
       _memory += double.parse(_currentInput);
     }

     void memorySubtract() {
       _memory -= double.parse(_currentInput);
     }

     void memoryRecall() {
       _currentInput = _memory.toString();
     }

     void memoryClear() {
       _memory = 0;
     }

     void delete() {
       if (_currentInput.length > 1) {
         _currentInput = _currentInput.substring(0, _currentInput.length - 1);
       } else {
         _currentInput = '0';
       }
     }

     void calculateScientific(String function) {
       double current = double.parse(_currentInput);
       double result = 0;

       switch (function) {
         case 'sin':
           result = sin(current * pi / 180);
           break;
         case 'cos':
           result = cos(current * pi / 180);
           break;
         case 'tan':
           result = tan(current * pi / 180);
           break;
         case 'log':
           if (current > 0) {
             result = log(current) / ln10;
           } else {
             _currentInput = 'Error';
             return;
           }
           break;
         case 'ln':
           if (current > 0) {
             result = log(current);
           } else {
             _currentInput = 'Error';
             return;
           }
           break;
         case 'sqrt':
           if (current >= 0) {
             result = sqrt(current);
           } else {
             _currentInput = 'Error';
             return;
           }
           break;
         case 'square':
           result = current * current;
           break;
         case 'inverse':
           if (current != 0) {
             result = 1 / current;
           } else {
             _currentInput = 'Error';
             return;
           }
           break;
         case 'factorial':
           if (current >= 0 && current == current.round()) {
             result = factorial(current.toInt()).toDouble();
           } else {
             _currentInput = 'Error';
             return;
           }
           break;
       }

       _history.add('$function($_currentInput) = $result');
       _currentInput = result.toString();
     }

     double factorial(int n) {
       if (n == 0) return 1;
       return n * factorial(n - 1);
     }
   }
   ```

3. **Create Calculator Provider**

   ```dart
   class CalculatorProvider extends ChangeNotifier {
     final CalculatorModel _model = CalculatorModel();

     String get currentInput => _model.currentInput;
     String get previousInput => _model.previousInput;
     String get operation => _model.operation;
     List<String> get history => _model.history;
     double get memory => _model.memory;

     void appendDigit(String digit) {
       _model.appendDigit(digit);
       notifyListeners();
     }

     void appendDecimal() {
       _model.appendDecimal();
       notifyListeners();
     }

     void setOperation(String op) {
       _model.setOperation(op);
       notifyListeners();
     }

     void calculate() {
       _model.calculate();
       notifyListeners();
     }

     void clear() {
       _model.clear();
       notifyListeners();
     }

     void clearHistory() {
       _model.clearHistory();
       notifyListeners();
     }

     void memoryAdd() {
       _model.memoryAdd();
       notifyListeners();
     }

     void memorySubtract() {
       _model.memorySubtract();
       notifyListeners();
     }

     void memoryRecall() {
       _model.memoryRecall();
       notifyListeners();
     }

     void memoryClear() {
       _model.memoryClear();
       notifyListeners();
     }

     void delete() {
       _model.delete();
       notifyListeners();
     }

     void calculateScientific(String function) {
       _model.calculateScientific(function);
       notifyListeners();
     }
   }
   ```

4. **Create Calculator Widgets**

   ```dart
   class CalculatorButton extends StatelessWidget {
     final String text;
     final VoidCallback onPressed;
     final Color? color;
     final Color? textColor;

     const CalculatorButton({
       required this.text,
       required this.onPressed,
       this.color,
       this.textColor,
     });

     @override
     Widget build(BuildContext context) {
       return ElevatedButton(
         onPressed: onPressed,
         style: ElevatedButton.styleFrom(
           backgroundColor: color,
           foregroundColor: textColor,
           shape: RoundedRectangleBorder(
             borderRadius: BorderRadius.circular(8),
           ),
         ),
         child: Text(
           text,
           style: TextStyle(fontSize: 24),
         ),
       );
     }
   }

   class HistoryItem extends StatelessWidget {
     final String expression;
     final VoidCallback onTap;

     const HistoryItem({
       required this.expression,
       required this.onTap,
     });

     @override
     Widget build(BuildContext context) {
       return ListTile(
         title: Text(expression),
         onTap: onTap,
       );
     }
   }
   ```

5. **Create Calculator Screen**

   ```dart
   class CalculatorScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Calculator'),
           actions: [
             IconButton(
               icon: Icon(Icons.history),
               onPressed: () {
                 showModalBottomSheet(
                   context: context,
                   builder: (context) => HistorySheet(),
                 );
               },
             ),
           ],
         ),
         body: Column(
           children: [
             Expanded(
               flex: 2,
               child: Container(
                 padding: EdgeInsets.all(16),
                 alignment: Alignment.bottomRight,
                 child: Column(
                   mainAxisAlignment: MainAxisAlignment.end,
                   crossAxisAlignment: CrossAxisAlignment.end,
                   children: [
                     Consumer<CalculatorProvider>(
                       builder: (context, provider, child) {
                         if (provider.previousInput.isNotEmpty) {
                           return Text(
                             '${provider.previousInput} ${provider.operation}',
                             style: TextStyle(
                               fontSize: 24,
                               color: Colors.grey,
                             ),
                           );
                         }
                         return SizedBox.shrink();
                       },
                     ),
                     Consumer<CalculatorProvider>(
                       builder: (context, provider, child) {
                         return Text(
                           provider.currentInput,
                           style: TextStyle(
                             fontSize: 48,
                             fontWeight: FontWeight.bold,
                           ),
                         );
                       },
                     ),
                   ],
                 ),
               ),
             ),
             Expanded(
               flex: 5,
               child: Container(
                 padding: EdgeInsets.all(16),
                 child: Column(
                   children: [
                     Expanded(
                       child: Row(
                         children: [
                           _buildMemoryButton('MC', () {
                             context.read<CalculatorProvider>().memoryClear();
                           }),
                           _buildMemoryButton('MR', () {
                             context.read<CalculatorProvider>().memoryRecall();
                           }),
                           _buildMemoryButton('M+', () {
                             context.read<CalculatorProvider>().memoryAdd();
                           }),
                           _buildMemoryButton('M-', () {
                             context.read<CalculatorProvider>().memorySubtract();
                           }),
                         ],
                       ),
                     ),
                     Expanded(
                       child: Row(
                         children: [
                           _buildScientificButton('sin'),
                           _buildScientificButton('cos'),
                           _buildScientificButton('tan'),
                           _buildScientificButton('log'),
                         ],
                       ),
                     ),
                     Expanded(
                       child: Row(
                         children: [
                           _buildScientificButton('ln'),
                           _buildScientificButton('sqrt'),
                           _buildScientificButton('square'),
                           _buildScientificButton('inverse'),
                         ],
                       ),
                     ),
                     Expanded(
                       child: Row(
                         children: [
                           _buildButton('7'),
                           _buildButton('8'),
                           _buildButton('9'),
                           _buildOperationButton('÷'),
                         ],
                       ),
                     ),
                     Expanded(
                       child: Row(
                         children: [
                           _buildButton('4'),
                           _buildButton('5'),
                           _buildButton('6'),
                           _buildOperationButton('×'),
                         ],
                       ),
                     ),
                     Expanded(
                       child: Row(
                         children: [
                           _buildButton('1'),
                           _buildButton('2'),
                           _buildButton('3'),
                           _buildOperationButton('-'),
                         ],
                       ),
                     ),
                     Expanded(
                       child: Row(
                         children: [
                           _buildButton('0'),
                           _buildButton('.'),
                           _buildButton('='),
                           _buildOperationButton('+'),
                         ],
                       ),
                     ),
                   ],
                 ),
               ),
             ),
           ],
         ),
       );
     }

     Widget _buildButton(String text) {
       return Expanded(
         child: Padding(
           padding: EdgeInsets.all(4),
           child: CalculatorButton(
             text: text,
             onPressed: () {
               if (text == '=') {
                 context.read<CalculatorProvider>().calculate();
               } else if (text == '.') {
                 context.read<CalculatorProvider>().appendDecimal();
               } else {
                 context.read<CalculatorProvider>().appendDigit(text);
               }
             },
           ),
         ),
       );
     }

     Widget _buildOperationButton(String text) {
       return Expanded(
         child: Padding(
           padding: EdgeInsets.all(4),
           child: CalculatorButton(
             text: text,
             color: Colors.orange,
             textColor: Colors.white,
             onPressed: () {
               context.read<CalculatorProvider>().setOperation(text);
             },
           ),
         ),
       );
     }

     Widget _buildScientificButton(String text) {
       return Expanded(
         child: Padding(
           padding: EdgeInsets.all(4),
           child: CalculatorButton(
             text: text,
             color: Colors.grey[300],
             onPressed: () {
               context.read<CalculatorProvider>().calculateScientific(text);
             },
           ),
         ),
       );
     }

     Widget _buildMemoryButton(String text, VoidCallback onPressed) {
       return Expanded(
         child: Padding(
           padding: EdgeInsets.all(4),
           child: CalculatorButton(
             text: text,
             color: Colors.grey[300],
             onPressed: onPressed,
           ),
         ),
       );
     }
   }

   class HistorySheet extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Container(
         padding: EdgeInsets.all(16),
         child: Column(
           children: [
             Row(
               mainAxisAlignment: MainAxisAlignment.spaceBetween,
               children: [
                 Text(
                   'History',
                   style: TextStyle(
                     fontSize: 24,
                     fontWeight: FontWeight.bold,
                   ),
                 ),
                 IconButton(
                   icon: Icon(Icons.delete),
                   onPressed: () {
                     context.read<CalculatorProvider>().clearHistory();
                   },
                 ),
               ],
             ),
             Expanded(
               child: Consumer<CalculatorProvider>(
                 builder: (context, provider, child) {
                   if (provider.history.isEmpty) {
                     return Center(
                       child: Text('No history'),
                     );
                   }

                   return ListView.builder(
                     itemCount: provider.history.length,
                     itemBuilder: (context, index) {
                       final expression = provider.history[index];
                       return HistoryItem(
                         expression: expression,
                         onTap: () {
                           final result = expression.split('=').last.trim();
                           context.read<CalculatorProvider>().appendDigit(result);
                           Navigator.pop(context);
                         },
                       );
                     },
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

1. **State Management**

   - Use provider pattern
   - Handle state updates
   - Manage side effects
   - Optimize rebuilds

2. **User Experience**

   - Show loading states
   - Provide error feedback
   - Add animations
   - Handle gestures

3. **Performance**

   - Optimize calculations
   - Handle large numbers
   - Cache results
   - Clean up resources

4. **Error Handling**
   - Validate input
   - Handle edge cases
   - Show error messages
   - Prevent crashes

## Conclusion

This tutorial has shown you how to create a calculator app with features like:

- Basic arithmetic
- Scientific functions
- Memory operations
- History tracking
- Dark/light theme

You can extend this app by adding:

- Unit conversion
- Currency conversion
- Graphing
- Programmer mode
- Custom themes
- Widget support

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's state management and UI design.
