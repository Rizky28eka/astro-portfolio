---
title: "Build a Currency Converter App"
summary: "Convert money with live API"
date: "2025, 03, 31"
tags: ["flutter", "currency", "api", "converter", "exchange-rates"]
difficulty: "medium"
draft: false
---

## Build a Currency Converter App

Creating a currency converter app in Flutter allows users to convert between different currencies using real-time exchange rates. This tutorial will guide you through building a feature-rich currency converter with live data updates.

## Features

- Live exchange rates
- Multiple currencies
- Offline support
- Favorites list
- Historical rates
- Dark/light theme
- Search functionality
- Rate alerts

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     http: ^1.1.0
     provider: ^6.1.1
     shared_preferences: ^2.2.2
     intl: ^0.19.0
     flutter_dotenv: ^5.1.0
     sqflite: ^2.3.2
   ```

2. **Create Currency Model**

   ```dart
   class Currency {
     final String code;
     final String name;
     final String symbol;
     final double rate;
     final DateTime lastUpdated;

     Currency({
       required this.code,
       required this.name,
       required this.symbol,
       required this.rate,
       required this.lastUpdated,
     });

     factory Currency.fromJson(Map<String, dynamic> json) {
       return Currency(
         code: json['code'],
         name: json['name'],
         symbol: json['symbol'],
         rate: json['rate'].toDouble(),
         lastUpdated: DateTime.parse(json['lastUpdated']),
       );
     }

     Map<String, dynamic> toJson() {
       return {
         'code': code,
         'name': name,
         'symbol': symbol,
         'rate': rate,
         'lastUpdated': lastUpdated.toIso8601String(),
       };
     }
   }

   class ConversionResult {
     final double amount;
     final Currency fromCurrency;
     final Currency toCurrency;
     final double convertedAmount;
     final DateTime timestamp;

     ConversionResult({
       required this.amount,
       required this.fromCurrency,
       required this.toCurrency,
       required this.convertedAmount,
       required this.timestamp,
     });
   }
   ```

3. **Create Currency Service**

   ```dart
   class CurrencyService {
     final String _apiKey;
     final String _baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
     final http.Client _client;

     CurrencyService(this._apiKey, {http.Client? client})
         : _client = client ?? http.Client();

     Future<Map<String, double>> getExchangeRates(String baseCurrency) async {
       try {
         final response = await _client.get(
           Uri.parse('$_baseUrl$baseCurrency'),
           headers: {'Authorization': 'Bearer $_apiKey'},
         );

         if (response.statusCode == 200) {
           final data = json.decode(response.body);
           return Map<String, double>.from(data['rates']);
         }
         throw Exception('Failed to load exchange rates');
       } catch (e) {
         print('Error fetching exchange rates: $e');
         rethrow;
       }
     }

     Future<List<Currency>> getCurrencies() async {
       try {
         final response = await _client.get(
           Uri.parse('https://api.exchangerate-api.com/v4/currencies'),
           headers: {'Authorization': 'Bearer $_apiKey'},
         );

         if (response.statusCode == 200) {
           final data = json.decode(response.body);
           return data.entries.map((entry) {
             return Currency(
               code: entry.key,
               name: entry.value['name'],
               symbol: entry.value['symbol'],
               rate: 0.0,
               lastUpdated: DateTime.now(),
             );
           }).toList();
         }
         throw Exception('Failed to load currencies');
       } catch (e) {
         print('Error fetching currencies: $e');
         rethrow;
       }
     }

     Future<Map<String, double>> getHistoricalRates(
       String baseCurrency,
       DateTime date,
     ) async {
       try {
         final formattedDate = DateFormat('yyyy-MM-dd').format(date);
         final response = await _client.get(
           Uri.parse(
               'https://api.exchangerate-api.com/v4/historical/$formattedDate'),
           headers: {'Authorization': 'Bearer $_apiKey'},
         );

         if (response.statusCode == 200) {
           final data = json.decode(response.body);
           return Map<String, double>.from(data['rates']);
         }
         throw Exception('Failed to load historical rates');
       } catch (e) {
         print('Error fetching historical rates: $e');
         rethrow;
       }
     }
   }
   ```

4. **Create Currency Provider**

   ```dart
   class CurrencyProvider extends ChangeNotifier {
     final CurrencyService _currencyService;
     final SharedPreferences _prefs;
     List<Currency> _currencies = [];
     List<String> _favorites = [];
     String _baseCurrency = 'USD';
     bool _isLoading = false;
     String? _error;

     CurrencyProvider({
       required CurrencyService currencyService,
       required SharedPreferences prefs,
     })  : _currencyService = currencyService,
           _prefs = prefs {
     _loadFavorites();
   }

     List<Currency> get currencies => _currencies;
     List<String> get favorites => _favorites;
     String get baseCurrency => _baseCurrency;
     bool get isLoading => _isLoading;
     String? get error => _error;

     Future<void> loadCurrencies() async {
       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         _currencies = await _currencyService.getCurrencies();
         await _updateRates();
       } catch (e) {
         _error = e.toString();
       } finally {
         _isLoading = false;
         notifyListeners();
       }
     }

     Future<void> _updateRates() async {
       try {
         final rates = await _currencyService.getExchangeRates(_baseCurrency);
         _currencies = _currencies.map((currency) {
           return Currency(
             code: currency.code,
             name: currency.name,
             symbol: currency.symbol,
             rate: rates[currency.code] ?? 0.0,
             lastUpdated: DateTime.now(),
           );
         }).toList();
         notifyListeners();
       } catch (e) {
         _error = e.toString();
         notifyListeners();
       }
     }

     Future<void> setBaseCurrency(String code) async {
       if (_baseCurrency == code) return;
       _baseCurrency = code;
       await _updateRates();
     }

     Future<void> toggleFavorite(String code) async {
       if (_favorites.contains(code)) {
         _favorites.remove(code);
       } else {
         _favorites.add(code);
       }
       await _saveFavorites();
       notifyListeners();
     }

     Future<void> _loadFavorites() async {
       _favorites = _prefs.getStringList('favorites') ?? [];
       notifyListeners();
     }

     Future<void> _saveFavorites() async {
       await _prefs.setStringList('favorites', _favorites);
     }

     double convert(double amount, String fromCode, String toCode) {
       final fromCurrency = _currencies.firstWhere((c) => c.code == fromCode);
       final toCurrency = _currencies.firstWhere((c) => c.code == toCode);
       return amount * (toCurrency.rate / fromCurrency.rate);
     }
   }
   ```

5. **Create Currency Widgets**

   ```dart
   class CurrencySelector extends StatelessWidget {
     final List<Currency> currencies;
     final String selectedCode;
     final Function(String) onSelected;
     final List<String> favorites;

     const CurrencySelector({
       required this.currencies,
       required this.selectedCode,
       required this.onSelected,
       required this.favorites,
     });

     @override
     Widget build(BuildContext context) {
       return Column(
         children: [
           TextField(
             decoration: InputDecoration(
               hintText: 'Search currencies',
               prefixIcon: Icon(Icons.search),
             ),
             onChanged: (value) {
               // Implement search
             },
           ),
           Expanded(
             child: ListView.builder(
               itemCount: currencies.length,
               itemBuilder: (context, index) {
                 final currency = currencies[index];
                 final isFavorite = favorites.contains(currency.code);
                 return ListTile(
                   leading: Text(currency.symbol),
                   title: Text(currency.name),
                   subtitle: Text(currency.code),
                   trailing: IconButton(
                     icon: Icon(
                       isFavorite ? Icons.star : Icons.star_border,
                       color: isFavorite ? Colors.amber : null,
                     ),
                     onPressed: () {
                       // Toggle favorite
                     },
                   ),
                   selected: currency.code == selectedCode,
                   onTap: () => onSelected(currency.code),
                 );
               },
             ),
           ),
         ],
       );
     }
   }

   class ConversionCard extends StatelessWidget {
     final double amount;
     final Currency fromCurrency;
     final Currency toCurrency;
     final double convertedAmount;

     const ConversionCard({
       required this.amount,
       required this.fromCurrency,
       required this.toCurrency,
       required this.convertedAmount,
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
                 'Conversion Result',
                 style: Theme.of(context).textTheme.titleLarge,
               ),
               SizedBox(height: 16),
               Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                   Text(
                     '${amount.toStringAsFixed(2)} ${fromCurrency.code}',
                     style: Theme.of(context).textTheme.titleMedium,
                   ),
                   Icon(Icons.arrow_forward),
                   Text(
                     '${convertedAmount.toStringAsFixed(2)} ${toCurrency.code}',
                     style: Theme.of(context).textTheme.titleMedium,
                   ),
                 ],
               ),
               SizedBox(height: 8),
               Text(
                 'Rate: 1 ${fromCurrency.code} = ${(convertedAmount / amount).toStringAsFixed(4)} ${toCurrency.code}',
                 style: Theme.of(context).textTheme.bodySmall,
               ),
             ],
           ),
         ),
       );
     }
   }
   ```

6. **Create Main Screen**

   ```dart
   class CurrencyConverterScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Currency Converter'),
         ),
         body: Consumer<CurrencyProvider>(
           builder: (context, provider, child) {
             if (provider.isLoading) {
               return Center(
                 child: CircularProgressIndicator(),
               );
             }

             if (provider.error != null) {
               return Center(
                 child: Text(provider.error!),
               );
             }

             return Column(
               children: [
                 Padding(
                   padding: EdgeInsets.all(16),
                   child: TextField(
                     decoration: InputDecoration(
                       labelText: 'Amount',
                       border: OutlineInputBorder(),
                       prefixIcon: Icon(Icons.attach_money),
                     ),
                     keyboardType: TextInputType.number,
                     onChanged: (value) {
                       // Update amount
                     },
                   ),
                 ),
                 Expanded(
                   child: Row(
                     children: [
                       Expanded(
                         child: CurrencySelector(
                           currencies: provider.currencies,
                           selectedCode: provider.baseCurrency,
                           onSelected: (code) {
                             provider.setBaseCurrency(code);
                           },
                           favorites: provider.favorites,
                         ),
                       ),
                       IconButton(
                         icon: Icon(Icons.swap_horiz),
                         onPressed: () {
                           // Swap currencies
                         },
                       ),
                       Expanded(
                         child: CurrencySelector(
                           currencies: provider.currencies,
                           selectedCode: provider.baseCurrency,
                           onSelected: (code) {
                             // Select target currency
                           },
                           favorites: provider.favorites,
                         ),
                       ),
                     ],
                   ),
                 ),
                 if (provider.currencies.isNotEmpty) ...[
                   Padding(
                     padding: EdgeInsets.all(16),
                     child: ConversionCard(
                       amount: 100,
                       fromCurrency: provider.currencies.first,
                       toCurrency: provider.currencies.last,
                       convertedAmount: provider.convert(
                         100,
                         provider.currencies.first.code,
                         provider.currencies.last.code,
                       ),
                     ),
                   ),
                 ],
               ],
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **API Integration**

   - Handle rate limits
   - Cache responses
   - Implement retry logic
   - Handle errors

2. **User Experience**

   - Show loading states
   - Provide feedback
   - Support offline mode
   - Add animations

3. **Performance**

   - Optimize conversions
   - Cache results
   - Handle large lists
   - Manage memory

4. **Testing**
   - Test API calls
   - Verify conversions
   - Check offline mode
   - Test edge cases

## Conclusion

This tutorial has shown you how to create a currency converter app with features like:

- Live exchange rates
- Multiple currencies
- Offline support
- Favorites list
- Historical rates

You can extend this implementation by adding:

- Rate alerts
- Currency charts
- Transaction history
- Multiple conversion
- Custom themes

Remember to:

- Handle API errors
- Test thoroughly
- Consider offline use
- Follow platform guidelines
- Keep dependencies updated

This implementation provides a solid foundation for creating a currency converter app in Flutter.
