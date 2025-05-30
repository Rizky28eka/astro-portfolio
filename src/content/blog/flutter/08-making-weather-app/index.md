---
title: "Make a Weather App using API"
summary: "Display weather from online API"
date: "2024, 03, 27"
tags: ["flutter", "api", "weather", "http"]
difficulty: "medium"
draft: false
---

## Make a Weather App using API

Creating a weather app in Flutter allows you to display real-time weather information using various weather APIs. This guide will show you how to build a weather app with features like current weather, forecasts, and location-based weather updates.

## Why Build a Weather App?

Weather apps are popular because they:

- Provide essential daily information
- Can be monetized through ads
- Have high user engagement
- Offer various API options

## Implementation

1. **Setup Dependencies**

   ```yaml
   # pubspec.yaml
   dependencies:
     http: ^latest_version
     geolocator: ^latest_version
     intl: ^latest_version
   ```

2. **Weather Model**

   ```dart
   class Weather {
     final String cityName;
     final double temperature;
     final String description;
     final double windSpeed;
     final int humidity;
     final String icon;

     Weather({
       required this.cityName,
       required this.temperature,
       required this.description,
       required this.windSpeed,
       required this.humidity,
       required this.icon,
     });

     factory Weather.fromJson(Map<String, dynamic> json) {
       return Weather(
         cityName: json['name'],
         temperature: json['main']['temp'].toDouble(),
         description: json['weather'][0]['description'],
         windSpeed: json['wind']['speed'].toDouble(),
         humidity: json['main']['humidity'],
         icon: json['weather'][0]['icon'],
       );
     }
   }
   ```

3. **Weather Service**

   ```dart
   class WeatherService {
     final String apiKey = 'YOUR_API_KEY';
     final String baseUrl = 'https://api.openweathermap.org/data/2.5';

     Future<Weather> getWeather(String city) async {
       final response = await http.get(
         Uri.parse('$baseUrl/weather?q=$city&appid=$apiKey&units=metric'),
       );

       if (response.statusCode == 200) {
         return Weather.fromJson(jsonDecode(response.body));
       } else {
         throw Exception('Failed to load weather data');
       }
     }

     Future<Weather> getWeatherByLocation(double lat, double lon) async {
       final response = await http.get(
         Uri.parse('$baseUrl/weather?lat=$lat&lon=$lon&appid=$apiKey&units=metric'),
       );

       if (response.statusCode == 200) {
         return Weather.fromJson(jsonDecode(response.body));
       } else {
         throw Exception('Failed to load weather data');
       }
     }
   }
   ```

4. **Weather Screen**

   ```dart
   class WeatherScreen extends StatefulWidget {
     @override
     _WeatherScreenState createState() => _WeatherScreenState();
   }

   class _WeatherScreenState extends State<WeatherScreen> {
     final WeatherService _weatherService = WeatherService();
     Weather? _weather;
     bool _isLoading = false;

     @override
     void initState() {
       super.initState();
       _getCurrentLocationWeather();
     }

     Future<void> _getCurrentLocationWeather() async {
       setState(() => _isLoading = true);
       try {
         Position position = await Geolocator.getCurrentPosition();
         _weather = await _weatherService.getWeatherByLocation(
           position.latitude,
           position.longitude,
         );
       } catch (e) {
         // Handle error
       } finally {
         setState(() => _isLoading = false);
       }
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(title: Text('Weather App')),
         body: _isLoading
             ? Center(child: CircularProgressIndicator())
             : _weather == null
                 ? Center(child: Text('No weather data available'))
                 : _buildWeatherInfo(),
       );
     }
   }
   ```

## Advanced Features

1. **Weather Forecast**

   ```dart
   Future<List<Weather>> getForecast(String city) async {
     final response = await http.get(
       Uri.parse('$baseUrl/forecast?q=$city&appid=$apiKey&units=metric'),
     );

     if (response.statusCode == 200) {
       final data = jsonDecode(response.body);
       return (data['list'] as List)
           .map((item) => Weather.fromJson(item))
           .toList();
     } else {
       throw Exception('Failed to load forecast data');
     }
   }
   ```

2. **Weather Icons**

   ```dart
   Widget _buildWeatherIcon(String iconCode) {
     return Image.network(
       'https://openweathermap.org/img/wn/$iconCode@2x.png',
       width: 100,
       height: 100,
     );
   }
   ```

3. **Location Search**

   ```dart
   class LocationSearch extends StatelessWidget {
     final Function(String) onLocationSelected;

     @override
     Widget build(BuildContext context) {
       return TextField(
         decoration: InputDecoration(
           hintText: 'Enter city name',
           prefixIcon: Icon(Icons.search),
         ),
         onSubmitted: onLocationSelected,
       );
     }
   }
   ```

## Best Practices

1. **Error Handling**

   - Handle API errors gracefully
   - Show user-friendly error messages
   - Implement retry mechanisms
   - Cache weather data

2. **Performance**

   - Implement proper caching
   - Optimize API calls
   - Handle offline mode
   - Use efficient data structures

3. **User Experience**
   - Add loading indicators
   - Implement pull-to-refresh
   - Show weather animations
   - Provide location permissions

## Common Features

1. **Weather Details**

   - Temperature
   - Humidity
   - Wind speed
   - Pressure
   - Visibility

2. **Forecast Features**

   - Daily forecast
   - Hourly forecast
   - Weather alerts
   - Precipitation chance

3. **Location Features**
   - Current location
   - City search
   - Favorite locations
   - Location permissions

## Conclusion

Building a weather app in Flutter provides an excellent opportunity to learn API integration, state management, and user interface design. By following these guidelines and implementing the provided examples, you can create a feature-rich weather application that provides valuable information to users.
