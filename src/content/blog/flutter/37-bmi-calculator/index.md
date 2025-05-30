---
title: "Create a BMI Calculator App"
summary: "Simple health-based utility app"
date: "2024, 04, 17"
tags: ["flutter", "health", "calculator", "ui-design"]
difficulty: "beginner"
draft: false
---

## Create a BMI Calculator App

Building a BMI (Body Mass Index) calculator is a great way to learn Flutter basics while creating a useful health application. This guide will show you how to create a simple yet effective BMI calculator app.

## What is BMI?

BMI is a measure of body fat based on height and weight. It's calculated using the formula:

```
BMI = weight (kg) / (height (m) × height (m))
```

## Implementation Steps

1. **Project Setup**

   ```yaml
   # pubspec.yaml
   dependencies:
     flutter:
       sdk: flutter
     google_fonts: ^6.1.0
   ```

2. **Create BMI Calculator Class**

   ```dart
   class BMICalculator {
     double calculateBMI(double weight, double height) {
       return weight / (height * height);
     }

     String getBMICategory(double bmi) {
       if (bmi < 18.5) {
         return 'Underweight';
       } else if (bmi < 25) {
         return 'Normal weight';
       } else if (bmi < 30) {
         return 'Overweight';
       } else {
         return 'Obese';
       }
     }

     String getBMIDescription(String category) {
       switch (category) {
         case 'Underweight':
           return 'You may need to gain some weight.';
         case 'Normal weight':
           return 'You have a healthy weight.';
         case 'Overweight':
           return 'You may need to lose some weight.';
         case 'Obese':
           return 'You should consult a healthcare provider.';
         default:
           return '';
       }
     }
   }
   ```

3. **Create Input Fields**

   ```dart
   class BMICalculatorScreen extends StatefulWidget {
     @override
     _BMICalculatorScreenState createState() => _BMICalculatorScreenState();
   }

   class _BMICalculatorScreenState extends State<BMICalculatorScreen> {
     final _formKey = GlobalKey<FormState>();
     final _weightController = TextEditingController();
     final _heightController = TextEditingController();
     final _calculator = BMICalculator();
     double? _bmi;
     String? _category;
     String? _description;

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('BMI Calculator'),
         ),
         body: Padding(
           padding: EdgeInsets.all(16.0),
           child: Form(
             key: _formKey,
             child: Column(
               children: [
                 TextFormField(
                   controller: _weightController,
                   decoration: InputDecoration(
                     labelText: 'Weight (kg)',
                     border: OutlineInputBorder(),
                   ),
                   keyboardType: TextInputType.number,
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Please enter your weight';
                     }
                     return null;
                   },
                 ),
                 SizedBox(height: 16),
                 TextFormField(
                   controller: _heightController,
                   decoration: InputDecoration(
                     labelText: 'Height (m)',
                     border: OutlineInputBorder(),
                   ),
                   keyboardType: TextInputType.number,
                   validator: (value) {
                     if (value == null || value.isEmpty) {
                       return 'Please enter your height';
                     }
                     return null;
                   },
                 ),
                 SizedBox(height: 24),
                 ElevatedButton(
                   onPressed: _calculateBMI,
                   child: Text('Calculate BMI'),
                 ),
                 if (_bmi != null) ...[
                   SizedBox(height: 24),
                   Text(
                     'Your BMI: ${_bmi!.toStringAsFixed(1)}',
                     style: Theme.of(context).textTheme.headlineSmall,
                   ),
                   Text(
                     'Category: $_category',
                     style: Theme.of(context).textTheme.titleMedium,
                   ),
                   Text(
                     _description ?? '',
                     style: Theme.of(context).textTheme.bodyLarge,
                   ),
                 ],
               ],
             ),
           ),
         ),
       );
     }

     void _calculateBMI() {
       if (_formKey.currentState!.validate()) {
         final weight = double.parse(_weightController.text);
         final height = double.parse(_heightController.text);

         setState(() {
           _bmi = _calculator.calculateBMI(weight, height);
           _category = _calculator.getBMICategory(_bmi!);
           _description = _calculator.getBMIDescription(_category!);
         });
       }
     }

     @override
     void dispose() {
       _weightController.dispose();
       _heightController.dispose();
       super.dispose();
     }
   }
   ```

4. **Add Unit Conversion**

   ```dart
   class UnitConverter {
     static double kgToLbs(double kg) => kg * 2.20462;
     static double lbsToKg(double lbs) => lbs / 2.20462;
     static double cmToMeters(double cm) => cm / 100;
     static double metersToCm(double meters) => meters * 100;
   }
   ```

5. **Create Unit Selection**

   ```dart
   enum UnitSystem { metric, imperial }

   class UnitSelector extends StatelessWidget {
     final UnitSystem selectedUnit;
     final ValueChanged<UnitSystem> onChanged;

     const UnitSelector({
       required this.selectedUnit,
       required this.onChanged,
     });

     @override
     Widget build(BuildContext context) {
       return SegmentedButton<UnitSystem>(
         segments: const [
           ButtonSegment(
             value: UnitSystem.metric,
             label: Text('Metric'),
           ),
           ButtonSegment(
             value: UnitSystem.imperial,
             label: Text('Imperial'),
           ),
         ],
         selected: {selectedUnit},
         onSelectionChanged: (Set<UnitSystem> selected) {
           onChanged(selected.first);
         },
       );
     }
   }
   ```

## Advanced Features

1. **BMI History**

   ```dart
   class BMIHistory {
     final List<BMIRecord> records = [];

     void addRecord(BMIRecord record) {
       records.add(record);
     }

     List<BMIRecord> getRecentRecords(int count) {
       return records.reversed.take(count).toList();
     }
   }

   class BMIRecord {
     final double bmi;
     final DateTime date;
     final String category;

     BMIRecord({
       required this.bmi,
       required this.date,
       required this.category,
     });
   }
   ```

2. **BMI Chart**

   ```dart
   class BMIChart extends StatelessWidget {
     final List<BMIRecord> records;

     const BMIChart({required this.records});

     @override
     Widget build(BuildContext context) {
       return LineChart(
         LineChartData(
           lineBarsData: [
             LineChartBarData(
               spots: records.asMap().entries.map((entry) {
                 return FlSpot(
                   entry.key.toDouble(),
                   entry.value.bmi,
                 );
               }).toList(),
               isCurved: true,
               color: Colors.blue,
               dotData: FlDotData(show: true),
             ),
           ],
         ),
       );
     }
   }
   ```

3. **BMI Recommendations**

   ```dart
   class BMIRecommendations {
     static String getRecommendations(String category) {
       switch (category) {
         case 'Underweight':
           return '''
             - Increase caloric intake
             - Eat nutrient-dense foods
             - Consider strength training
             - Consult a nutritionist
           ''';
         case 'Normal weight':
           return '''
             - Maintain current diet
             - Regular exercise
             - Balanced nutrition
             - Regular health check-ups
           ''';
         case 'Overweight':
           return '''
             - Reduce caloric intake
             - Increase physical activity
             - Focus on whole foods
             - Consider professional guidance
           ''';
         case 'Obese':
           return '''
             - Medical consultation
             - Structured weight loss plan
             - Regular exercise program
             - Dietary modifications
           ''';
         default:
           return '';
       }
     }
   }
   ```

## Best Practices

1. **Input Validation**

   - Validate numeric inputs
   - Check for reasonable ranges
   - Provide clear error messages
   - Handle edge cases
   - Support different units
   - Consider user preferences

2. **User Interface**

   - Clear input fields
   - Intuitive layout
   - Responsive design
   - Accessible controls
   - Visual feedback
   - Error handling

3. **Data Management**
   - Save calculation history
   - Track progress
   - Export data
   - Privacy considerations
   - Data backup
   - User preferences

## Common Use Cases

1. **Personal Health Tracking**

   - Regular BMI checks
   - Progress monitoring
   - Goal setting
   - Health insights
   - Trend analysis
   - Health recommendations

2. **Fitness Applications**

   - Workout planning
   - Diet tracking
   - Progress tracking
   - Goal setting
   - Performance monitoring
   - Health metrics

3. **Medical Applications**
   - Patient monitoring
   - Health assessments
   - Treatment planning
   - Progress tracking
   - Medical records
   - Health reports

## Conclusion

Creating a BMI calculator app in Flutter is a great way to learn the framework while building something useful. By following these guidelines and implementing the provided examples, you can create a functional and user-friendly BMI calculator that helps users track their health metrics.
