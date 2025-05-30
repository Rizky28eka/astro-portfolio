---
title: "Build a Quiz App"
summary: "Interactive quiz with Flutter"
date: "2025, 03, 25"
tags: ["flutter", "quiz", "state-management", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Quiz App

Creating a quiz app is a great way to learn about state management, UI design, and user interaction in Flutter. This tutorial will guide you through building a feature-rich quiz application.

## Features

- Multiple choice questions
- True/false questions
- Score tracking
- Timer
- Categories
- Difficulty levels
- Progress tracking
- Results summary
- Dark/light theme
- Share results

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     provider: ^6.1.1
     shared_preferences: ^2.2.2
     http: ^1.1.0
     intl: ^0.19.0
     share_plus: ^7.2.1
     flutter_animate: ^4.5.0
   ```

2. **Create Models**

   ```dart
   class Question {
     final String id;
     final String question;
     final List<String> options;
     final int correctAnswer;
     final String category;
     final String difficulty;
     final String? explanation;

     Question({
       required this.id,
       required this.question,
       required this.options,
       required this.correctAnswer,
       required this.category,
       required this.difficulty,
       this.explanation,
     });

     factory Question.fromJson(Map<String, dynamic> json) {
       return Question(
         id: json['id'],
         question: json['question'],
         options: List<String>.from(json['options']),
         correctAnswer: json['correctAnswer'],
         category: json['category'],
         difficulty: json['difficulty'],
         explanation: json['explanation'],
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'id': id,
         'question': question,
         'options': options,
         'correctAnswer': correctAnswer,
         'category': category,
         'difficulty': difficulty,
         'explanation': explanation,
       };
     }
   }

   class Quiz {
     final String id;
     final String title;
     final String category;
     final String difficulty;
     final List<Question> questions;
     final int timeLimit;

     Quiz({
       required this.id,
       required this.title,
       required this.category,
       required this.difficulty,
       required this.questions,
       required this.timeLimit,
     });

     factory Quiz.fromJson(Map<String, dynamic> json) {
       return Quiz(
         id: json['id'],
         title: json['title'],
         category: json['category'],
         difficulty: json['difficulty'],
         questions: (json['questions'] as List)
             .map((q) => Question.fromJson(q))
             .toList(),
         timeLimit: json['timeLimit'],
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'id': id,
         'title': title,
         'category': category,
         'difficulty': difficulty,
         'questions': questions.map((q) => q.toJson()).toList(),
         'timeLimit': timeLimit,
       };
     }
   }

   class QuizResult {
     final String quizId;
     final int score;
     final int totalQuestions;
     final int correctAnswers;
     final int wrongAnswers;
     final int skippedQuestions;
     final Duration timeTaken;
     final DateTime date;

     QuizResult({
       required this.quizId,
       required this.score,
       required this.totalQuestions,
       required this.correctAnswers,
       required this.wrongAnswers,
       required this.skippedQuestions,
       required this.timeTaken,
       required this.date,
     });

     factory QuizResult.fromJson(Map<String, dynamic> json) {
       return QuizResult(
         quizId: json['quizId'],
         score: json['score'],
         totalQuestions: json['totalQuestions'],
         correctAnswers: json['correctAnswers'],
         wrongAnswers: json['wrongAnswers'],
         skippedQuestions: json['skippedQuestions'],
         timeTaken: Duration(milliseconds: json['timeTaken']),
         date: DateTime.parse(json['date']),
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'quizId': quizId,
         'score': score,
         'totalQuestions': totalQuestions,
         'correctAnswers': correctAnswers,
         'wrongAnswers': wrongAnswers,
         'skippedQuestions': skippedQuestions,
         'timeTaken': timeTaken.inMilliseconds,
         'date': date.toIso8601String(),
       };
     }
   }
   ```

3. **Create Quiz Service**

   ```dart
   class QuizService {
     final String baseUrl = 'https://api.example.com';

     Future<List<Quiz>> getQuizzes() async {
       final response = await http.get(Uri.parse('$baseUrl/quizzes'));
       if (response.statusCode == 200) {
         final List<dynamic> data = json.decode(response.body);
         return data.map((json) => Quiz.fromJson(json)).toList();
       }
       throw Exception('Failed to load quizzes');
     }

     Future<Quiz> getQuiz(String id) async {
       final response = await http.get(Uri.parse('$baseUrl/quizzes/$id'));
       if (response.statusCode == 200) {
         return Quiz.fromJson(json.decode(response.body));
       }
       throw Exception('Failed to load quiz');
     }

     Future<List<Quiz>> getQuizzesByCategory(String category) async {
       final response =
           await http.get(Uri.parse('$baseUrl/quizzes?category=$category'));
       if (response.statusCode == 200) {
         final List<dynamic> data = json.decode(response.body);
         return data.map((json) => Quiz.fromJson(json)).toList();
       }
       throw Exception('Failed to load quizzes');
     }

     Future<List<Quiz>> getQuizzesByDifficulty(String difficulty) async {
       final response =
           await http.get(Uri.parse('$baseUrl/quizzes?difficulty=$difficulty'));
       if (response.statusCode == 200) {
         final List<dynamic> data = json.decode(response.body);
         return data.map((json) => Quiz.fromJson(json)).toList();
       }
       throw Exception('Failed to load quizzes');
     }
   }
   ```

4. **Create Quiz Provider**

   ```dart
   class QuizProvider extends ChangeNotifier {
     final QuizService _quizService;
     List<Quiz> _quizzes = [];
     Quiz? _currentQuiz;
     int _currentQuestionIndex = 0;
     int _score = 0;
     int _correctAnswers = 0;
     int _wrongAnswers = 0;
     int _skippedQuestions = 0;
     Duration _timeTaken = Duration.zero;
     DateTime? _startTime;
     List<QuizResult> _results = [];

     QuizProvider({required QuizService quizService})
         : _quizService = quizService {
       loadQuizzes();
       loadResults();
     }

     List<Quiz> get quizzes => _quizzes;
     Quiz? get currentQuiz => _currentQuiz;
     int get currentQuestionIndex => _currentQuestionIndex;
     int get score => _score;
     int get correctAnswers => _correctAnswers;
     int get wrongAnswers => _wrongAnswers;
     int get skippedQuestions => _skippedQuestions;
     Duration get timeTaken => _timeTaken;
     List<QuizResult> get results => _results;

     Future<void> loadQuizzes() async {
       _quizzes = await _quizService.getQuizzes();
       notifyListeners();
     }

     Future<void> loadQuiz(String id) async {
       _currentQuiz = await _quizService.getQuiz(id);
       _currentQuestionIndex = 0;
       _score = 0;
       _correctAnswers = 0;
       _wrongAnswers = 0;
       _skippedQuestions = 0;
       _timeTaken = Duration.zero;
       _startTime = DateTime.now();
       notifyListeners();
     }

     void answerQuestion(int selectedOption) {
       if (_currentQuiz == null) return;

       final question = _currentQuiz!.questions[_currentQuestionIndex];
       if (selectedOption == question.correctAnswer) {
         _score += 10;
         _correctAnswers++;
       } else {
         _wrongAnswers++;
       }

       if (_currentQuestionIndex < _currentQuiz!.questions.length - 1) {
         _currentQuestionIndex++;
       } else {
         _endQuiz();
       }

       notifyListeners();
     }

     void skipQuestion() {
       if (_currentQuiz == null) return;

       _skippedQuestions++;

       if (_currentQuestionIndex < _currentQuiz!.questions.length - 1) {
         _currentQuestionIndex++;
       } else {
         _endQuiz();
       }

       notifyListeners();
     }

     void _endQuiz() {
       if (_startTime != null) {
         _timeTaken = DateTime.now().difference(_startTime!);
       }

       final result = QuizResult(
         quizId: _currentQuiz!.id,
         score: _score,
         totalQuestions: _currentQuiz!.questions.length,
         correctAnswers: _correctAnswers,
         wrongAnswers: _wrongAnswers,
         skippedQuestions: _skippedQuestions,
         timeTaken: _timeTaken,
         date: DateTime.now(),
       );

       _results.add(result);
       saveResults();
     }

     Future<void> loadResults() async {
       final prefs = await SharedPreferences.getInstance();
       final resultsJson = prefs.getStringList('quiz_results') ?? [];
       _results = resultsJson
           .map((json) => QuizResult.fromJson(jsonDecode(json)))
           .toList();
       notifyListeners();
     }

     Future<void> saveResults() async {
       final prefs = await SharedPreferences.getInstance();
       final resultsJson = _results
           .map((result) => jsonEncode(result.toJson()))
           .toList();
       await prefs.setStringList('quiz_results', resultsJson);
     }

     List<Quiz> getQuizzesByCategory(String category) {
       return _quizzes.where((q) => q.category == category).toList();
     }

     List<Quiz> getQuizzesByDifficulty(String difficulty) {
       return _quizzes.where((q) => q.difficulty == difficulty).toList();
     }

     List<String> getCategories() {
       return _quizzes.map((q) => q.category).toSet().toList();
     }

     List<String> getDifficulties() {
       return _quizzes.map((q) => q.difficulty).toSet().toList();
     }
   }
   ```

5. **Create Quiz Widgets**

   ```dart
   class QuestionCard extends StatelessWidget {
     final Question question;
     final Function(int) onAnswer;
     final VoidCallback onSkip;

     const QuestionCard({
       required this.question,
       required this.onAnswer,
       required this.onSkip,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: Padding(
           padding: EdgeInsets.all(16),
           child: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text(
                 question.question,
                 style: Theme.of(context).textTheme.headlineSmall,
               ),
               SizedBox(height: 16),
               ...question.options.asMap().entries.map((entry) {
                 final index = entry.key;
                 final option = entry.value;
                 return Padding(
                   padding: EdgeInsets.only(bottom: 8),
                   child: ElevatedButton(
                     onPressed: () => onAnswer(index),
                     child: Text(option),
                     style: ElevatedButton.styleFrom(
                       minimumSize: Size(double.infinity, 48),
                     ),
                   ),
                 );
               }),
               SizedBox(height: 16),
               TextButton(
                 onPressed: onSkip,
                 child: Text('Skip Question'),
               ),
             ],
           ),
         ),
       );
     }
   }

   class ResultCard extends StatelessWidget {
     final QuizResult result;
     final VoidCallback onShare;

     const ResultCard({
       required this.result,
       required this.onShare,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: Padding(
           padding: EdgeInsets.all(16),
           child: Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                   Text(
                     'Quiz Results',
                     style: Theme.of(context).textTheme.headlineSmall,
                   ),
                   IconButton(
                     icon: Icon(Icons.share),
                     onPressed: onShare,
                   ),
                 ],
               ),
               SizedBox(height: 16),
               _buildResultRow('Score', '${result.score}'),
               _buildResultRow(
                   'Correct Answers', '${result.correctAnswers}'),
               _buildResultRow('Wrong Answers', '${result.wrongAnswers}'),
               _buildResultRow(
                   'Skipped Questions', '${result.skippedQuestions}'),
               _buildResultRow(
                   'Time Taken',
                   '${result.timeTaken.inMinutes}:${(result.timeTaken.inSeconds % 60).toString().padLeft(2, '0')}'),
               _buildResultRow(
                   'Date',
                   DateFormat.yMMMd().add_jm().format(result.date)),
             ],
           ),
         ),
       );
     }

     Widget _buildResultRow(String label, String value) {
       return Padding(
         padding: EdgeInsets.symmetric(vertical: 4),
         child: Row(
           mainAxisAlignment: MainAxisAlignment.spaceBetween,
           children: [
             Text(
               label,
               style: TextStyle(
                 fontSize: 16,
                 fontWeight: FontWeight.bold,
               ),
             ),
             Text(
               value,
               style: TextStyle(fontSize: 16),
             ),
           ],
         ),
       );
     }
   }
   ```

6. **Create Quiz Screen**

   ```dart
   class QuizScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Quiz'),
         ),
         body: Consumer<QuizProvider>(
           builder: (context, provider, child) {
             if (provider.currentQuiz == null) {
               return Center(
                 child: Text('Select a quiz to start'),
               );
             }

             final question =
                 provider.currentQuiz!.questions[provider.currentQuestionIndex];

             return Column(
               children: [
                 LinearProgressIndicator(
                   value: (provider.currentQuestionIndex + 1) /
                       provider.currentQuiz!.questions.length,
                 ),
                 Padding(
                   padding: EdgeInsets.all(16),
                   child: Row(
                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
                     children: [
                       Text(
                         'Question ${provider.currentQuestionIndex + 1}/${provider.currentQuiz!.questions.length}',
                       ),
                       Text(
                         'Score: ${provider.score}',
                         style: TextStyle(
                           fontWeight: FontWeight.bold,
                         ),
                       ),
                     ],
                   ),
                 ),
                 Expanded(
                   child: QuestionCard(
                     question: question,
                     onAnswer: (index) {
                       provider.answerQuestion(index);
                     },
                     onSkip: () {
                       provider.skipQuestion();
                     },
                   ),
                 ),
               ],
             );
           },
         ),
       );
     }
   }

   class ResultsScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Results'),
         ),
         body: Consumer<QuizProvider>(
           builder: (context, provider, child) {
             if (provider.results.isEmpty) {
               return Center(
                 child: Text('No results yet'),
               );
             }

             return ListView.builder(
               itemCount: provider.results.length,
               itemBuilder: (context, index) {
                 final result = provider.results[index];
                 return ResultCard(
                   result: result,
                   onShare: () {
                     Share.share(
                       'I scored ${result.score} points in the quiz!\n'
                       'Correct Answers: ${result.correctAnswers}\n'
                       'Time Taken: ${result.timeTaken.inMinutes}:${(result.timeTaken.inSeconds % 60).toString().padLeft(2, '0')}',
                     );
                   },
                 );
               },
             );
           },
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

   - Optimize list rendering
   - Handle large datasets
   - Cache data
   - Clean up resources

4. **Error Handling**
   - Validate input
   - Handle edge cases
   - Show error messages
   - Prevent crashes

## Conclusion

This tutorial has shown you how to create a quiz app with features like:

- Multiple choice questions
- Score tracking
- Timer
- Categories
- Difficulty levels
- Results tracking
- Sharing results

You can extend this app by adding:

- User authentication
- Leaderboards
- Custom quizzes
- Quiz creation
- Quiz sharing
- Offline mode

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's state management and UI design.
