---
title: "Build a Weather App"
summary: "Real-time weather information with Flutter"
date: "2025, 02, 05"
tags: ["flutter", "weather", "api", "location", "ui"]
difficulty: "advanced"
draft: false
---

## Build a Weather App

Creating a weather app is a great way to learn about API integration, location services, and real-time data handling in Flutter. This tutorial will guide you through building a feature-rich weather application.

## Features

- Current weather display
- 5-day forecast
- Location-based weather
- Weather search by city
- Weather alerts
- Weather maps
- Unit conversion
- Dark/Light theme

## Implementation Steps

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     http: ^1.1.0
     geolocator: ^10.1.0
     geocoding: ^2.1.1
     shared_preferences: ^2.2.2
     intl: ^0.19.0
     flutter_dotenv: ^5.1.0
     cached_network_image: ^3.3.0
   ```

2. **Create Weather Model**

   ```dart
   class Weather {
     final double temperature;
     final double feelsLike;
     final double humidity;
     final double windSpeed;
     final String description;
     final String icon;
     final DateTime dateTime;
     final String cityName;
     final String country;

     Weather({
       required this.temperature,
       required this.feelsLike,
       required this.humidity,
       required this.windSpeed,
       required this.description,
       required this.icon,
       required this.dateTime,
       required this.cityName,
       required this.country,
     });

     factory Weather.fromJson(Map<String, dynamic> json) {
       return Weather(
         temperature: json['main']['temp'].toDouble(),
         feelsLike: json['main']['feels_like'].toDouble(),
         humidity: json['main']['humidity'].toDouble(),
         windSpeed: json['wind']['speed'].toDouble(),
         description: json['weather'][0]['description'],
         icon: json['weather'][0]['icon'],
         dateTime: DateTime.fromMillisecondsSinceEpoch(json['dt'] * 1000),
         cityName: json['name'],
         country: json['sys']['country'],
       );
     }
   }

   class Forecast {
     final List<Weather> daily;
     final List<Weather> hourly;

     Forecast({
       required this.daily,
       required this.hourly,
     });

     factory Forecast.fromJson(Map<String, dynamic> json) {
       return Forecast(
         daily: (json['daily'] as List)
             .map((day) => Weather.fromJson(day))
             .toList(),
         hourly: (json['hourly'] as List)
             .map((hour) => Weather.fromJson(hour))
             .toList(),
       );
     }
   }
   ```

3. **Create Weather Service**

   ```dart
   class WeatherService {
     final String apiKey;
     final http.Client _client;

     WeatherService({required this.apiKey}) : _client = http.Client();

     Future<Weather> getCurrentWeather(double lat, double lon) async {
       final response = await _client.get(Uri.parse(
         'https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&appid=$apiKey&units=metric',
       ));

       if (response.statusCode == 200) {
         return Weather.fromJson(jsonDecode(response.body));
       } else {
         throw Exception('Failed to load weather data');
       }
     }

     Future<Forecast> getForecast(double lat, double lon) async {
       final response = await _client.get(Uri.parse(
         'https://api.openweathermap.org/data/2.5/onecall?lat=$lat&lon=$lon&exclude=minutely&appid=$apiKey&units=metric',
       ));

       if (response.statusCode == 200) {
         return Forecast.fromJson(jsonDecode(response.body));
       } else {
         throw Exception('Failed to load forecast data');
       }
     }

     Future<Weather> getWeatherByCity(String city) async {
       final response = await _client.get(Uri.parse(
         'https://api.openweathermap.org/data/2.5/weather?q=$city&appid=$apiKey&units=metric',
       ));

       if (response.statusCode == 200) {
         return Weather.fromJson(jsonDecode(response.body));
       } else {
         throw Exception('City not found');
       }
     }
   }
   ```

4. **Create Location Service**

   ```dart
   class LocationService {
     Future<Position> getCurrentLocation() async {
       bool serviceEnabled;
       LocationPermission permission;

       serviceEnabled = await Geolocator.isLocationServiceEnabled();
       if (!serviceEnabled) {
         throw Exception('Location services are disabled');
       }

       permission = await Geolocator.checkPermission();
       if (permission == LocationPermission.denied) {
         permission = await Geolocator.requestPermission();
         if (permission == LocationPermission.denied) {
           throw Exception('Location permissions are denied');
         }
       }

       if (permission == LocationPermission.deniedForever) {
         throw Exception('Location permissions are permanently denied');
       }

       return await Geolocator.getCurrentPosition();
     }

     Future<String> getAddressFromCoordinates(
         double latitude, double longitude) async {
       List<Placemark> placemarks = await placemarkFromCoordinates(
         latitude,
         longitude,
       );

       if (placemarks.isNotEmpty) {
         Placemark place = placemarks[0];
         return '${place.locality}, ${place.country}';
       }
       return '';
     }
   }
   ```

5. **Create Weather Provider**

   ```dart
   class WeatherProvider extends ChangeNotifier {
     final WeatherService _weatherService;
     final LocationService _locationService;
     Weather? _currentWeather;
     Forecast? _forecast;
     bool _isLoading = false;
     String? _error;
     String _unit = 'metric';

     WeatherProvider({
       required WeatherService weatherService,
       required LocationService locationService,
     })  : _weatherService = weatherService,
           _locationService = locationService;

     Weather? get currentWeather => _currentWeather;
     Forecast? get forecast => _forecast;
     bool get isLoading => _isLoading;
     String? get error => _error;
     String get unit => _unit;

     Future<void> loadWeather() async {
       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         final position = await _locationService.getCurrentLocation();
         _currentWeather = await _weatherService.getCurrentWeather(
           position.latitude,
           position.longitude,
         );
         _forecast = await _weatherService.getForecast(
           position.latitude,
           position.longitude,
         );
       } catch (e) {
         _error = e.toString();
       }

       _isLoading = false;
       notifyListeners();
     }

     Future<void> searchCity(String city) async {
       _isLoading = true;
       _error = null;
       notifyListeners();

       try {
         _currentWeather = await _weatherService.getWeatherByCity(city);
         _forecast = await _weatherService.getForecast(
           _currentWeather!.latitude,
           _currentWeather!.longitude,
         );
       } catch (e) {
         _error = e.toString();
       }

       _isLoading = false;
       notifyListeners();
     }

     void toggleUnit() {
       _unit = _unit == 'metric' ? 'imperial' : 'metric';
       notifyListeners();
     }
   }
   ```

6. **Create Weather Widgets**

   ```dart
   class CurrentWeatherCard extends StatelessWidget {
     final Weather weather;
     final String unit;

     const CurrentWeatherCard({
       required this.weather,
       required this.unit,
     });

     @override
     Widget build(BuildContext context) {
       return Card(
         child: Padding(
           padding: EdgeInsets.all(16),
           child: Column(
             children: [
               Text(
                 weather.cityName,
                 style: Theme.of(context).textTheme.headlineMedium,
               ),
               Text(
                 weather.country,
                 style: Theme.of(context).textTheme.titleMedium,
               ),
               SizedBox(height: 16),
               Row(
                 mainAxisAlignment: MainAxisAlignment.center,
                 children: [
                   Image.network(
                     'https://openweathermap.org/img/wn/${weather.icon}@2x.png',
                     width: 100,
                     height: 100,
                   ),
                   Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(
                         '${weather.temperature.toStringAsFixed(1)}°${unit == 'metric' ? 'C' : 'F'}',
                         style: Theme.of(context).textTheme.displayLarge,
                       ),
                       Text(
                         weather.description,
                         style: Theme.of(context).textTheme.titleMedium,
                       ),
                     ],
                   ),
                 ],
               ),
               SizedBox(height: 16),
               Row(
                 mainAxisAlignment: MainAxisAlignment.spaceAround,
                 children: [
                   _buildWeatherInfo(
                     context,
                     Icons.thermostat,
                     'Feels like',
                     '${weather.feelsLike.toStringAsFixed(1)}°${unit == 'metric' ? 'C' : 'F'}',
                   ),
                   _buildWeatherInfo(
                     context,
                     Icons.water_drop,
                     'Humidity',
                     '${weather.humidity}%',
                   ),
                   _buildWeatherInfo(
                     context,
                     Icons.air,
                     'Wind',
                     '${weather.windSpeed} ${unit == 'metric' ? 'm/s' : 'mph'}',
                   ),
                 ],
               ),
             ],
           ),
         ),
       );
     }

     Widget _buildWeatherInfo(
       BuildContext context,
       IconData icon,
       String label,
       String value,
     ) {
       return Column(
         children: [
           Icon(icon),
           SizedBox(height: 8),
           Text(
             label,
             style: Theme.of(context).textTheme.bodySmall,
           ),
           Text(
             value,
             style: Theme.of(context).textTheme.titleMedium,
           ),
         ],
       );
     }
   }

   class ForecastList extends StatelessWidget {
     final List<Weather> forecast;
     final String unit;

     const ForecastList({
       required this.forecast,
       required this.unit,
     });

     @override
     Widget build(BuildContext context) {
       return ListView.builder(
         scrollDirection: Axis.horizontal,
         itemCount: forecast.length,
         itemBuilder: (context, index) {
           final weather = forecast[index];
           return Card(
             child: Padding(
               padding: EdgeInsets.all(16),
               child: Column(
                 children: [
                   Text(
                     DateFormat('E').format(weather.dateTime),
                     style: Theme.of(context).textTheme.titleMedium,
                   ),
                   Image.network(
                     'https://openweathermap.org/img/wn/${weather.icon}.png',
                     width: 50,
                     height: 50,
                   ),
                   Text(
                     '${weather.temperature.toStringAsFixed(1)}°${unit == 'metric' ? 'C' : 'F'}',
                     style: Theme.of(context).textTheme.titleMedium,
                   ),
                 ],
               ),
             ),
           );
         },
       );
     }
   }
   ```

7. **Create Main Weather Screen**

   ```dart
   class WeatherScreen extends StatelessWidget {
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text('Weather'),
           actions: [
             IconButton(
               icon: Icon(Icons.search),
               onPressed: () {
                 showSearch(
                   context: context,
                   delegate: CitySearchDelegate(),
                 );
               },
             ),
             IconButton(
               icon: Icon(Icons.refresh),
               onPressed: () {
                 context.read<WeatherProvider>().loadWeather();
               },
             ),
             IconButton(
               icon: Icon(Icons.settings),
               onPressed: () {
                 context.read<WeatherProvider>().toggleUnit();
               },
             ),
           ],
         ),
         body: Consumer<WeatherProvider>(
           builder: (context, weatherProvider, child) {
             if (weatherProvider.isLoading) {
               return Center(child: CircularProgressIndicator());
             }

             if (weatherProvider.error != null) {
               return Center(
                 child: Text(weatherProvider.error!),
               );
             }

             if (weatherProvider.currentWeather == null) {
               return Center(
                 child: Text('No weather data available'),
               );
             }

             return RefreshIndicator(
               onRefresh: () => weatherProvider.loadWeather(),
               child: ListView(
                 padding: EdgeInsets.all(16),
                 children: [
                   CurrentWeatherCard(
                     weather: weatherProvider.currentWeather!,
                     unit: weatherProvider.unit,
                   ),
                   SizedBox(height: 16),
                   Text(
                     '5-Day Forecast',
                     style: Theme.of(context).textTheme.titleLarge,
                   ),
                   SizedBox(height: 8),
                   ForecastList(
                     forecast: weatherProvider.forecast!.daily,
                     unit: weatherProvider.unit,
                   ),
                 ],
               ),
             );
           },
         ),
       );
     }
   }
   ```

## Best Practices

1. **API Integration**

   - Use environment variables for API keys
   - Implement proper error handling
   - Cache responses when appropriate
   - Handle rate limiting

2. **Location Services**

   - Request permissions properly
   - Handle location errors
   - Provide fallback options
   - Consider battery usage

3. **User Experience**

   - Show loading states
   - Provide error feedback
   - Support offline mode
   - Implement pull-to-refresh

4. **Performance**
   - Optimize image loading
   - Cache weather data
   - Minimize API calls
   - Handle memory efficiently

## Conclusion

This tutorial has shown you how to create a weather app with features like:

- Current weather display
- 5-day forecast
- Location-based weather
- City search
- Unit conversion
- Weather details

You can extend this app by adding:

- Weather maps
- Weather alerts
- Weather widgets
- Historical data
- Weather sharing
- Custom themes

Remember to:

- Handle errors gracefully
- Test thoroughly
- Consider accessibility
- Follow platform guidelines
- Optimize performance

This app provides a solid foundation for learning Flutter's API integration, location services, and real-time data handling.
