# SkyWeather - Professional Weather App

A modern, responsive weather application that provides real-time weather information and forecasts for cities worldwide. Built with vanilla JavaScript, HTML5, and CSS3.

![Weather App](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## 🌟 Features

- **Real-Time Weather Data**: Get current weather conditions for any city worldwide
- **Temperature Unit Toggle**: Switch between Celsius (°C) and Fahrenheit (°F)
- **Hourly Forecast**: View weather predictions for the next 24 hours
- **5-Day Forecast**: Plan ahead with a 5-day weather forecast
- **Detailed Weather Information**:
  - Humidity levels
  - Wind speed
  - Atmospheric pressure
  - Visibility distance
  - UV Index
  - Precipitation rates
  - Sunrise and Sunset times
  - Dew point
  - Chance of rain

- **Geolocation Support**: Automatically load weather for your current location
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient-based interface with smooth animations
- **Error Handling**: User-friendly error messages and loading states

## 🎨 Design Highlights

- Clean, modern dark theme with vibrant gradients
- Smooth animations and transitions
- Intuitive navigation bar with search functionality
- Interactive cards with hover effects
- Professional color scheme with cyan, purple, and accent colors
- Full mobile responsiveness with dedicated breakpoints

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with gradients, animations, and flexbox/grid
- **JavaScript (ES6+)**: Dynamic functionality and API integration
- **Font Awesome 6.4.0**: Professional icon library
- **OpenWeather API**: Real-time weather data and forecasts
- **Geolocation API**: User location detection

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- API Key from [OpenWeatherMap](https://openweathermap.org/api)

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/skyweather.git
   cd skyweather
   ```

2. **Get an API Key**:
   - Visit [OpenWeatherMap API](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key

3. **Add your API Key**:
   - Open `script.js`
   - Replace the placeholder API key:
   ```javascript
   const apiKey = "YOUR_API_KEY_HERE";
   ```

4. **Open the application**:
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```

   Then navigate to `http://localhost:8000`

## 💻 Usage

### Search for a City
1. Enter a city name in the search bar at the top
2. Press Enter or click the search button
3. View current weather and forecasts

### Toggle Temperature Units
- Click the **°C** or **°F** button in the navigation bar to switch temperature units
- All temperatures will automatically update

### Auto-Location
- On first load, the app requests your permission to use geolocation
- If granted, weather data for your current location loads automatically
- If denied, the app defaults to London

### View Weather Details
- **Current Weather**: Large card showing main conditions and "feels like" temperature
- **Details Grid**: Humidity, wind speed, pressure, visibility, UV index, and precipitation
- **Additional Info**: Sunrise/sunset times, dew point, and rain chance
- **Hourly Forecast**: Scroll through the next 24 hours of predictions
- **5-Day Forecast**: Plan ahead with daily forecasts

## 📁 Project Structure

```
weather-app/
├── index.html          # Main HTML file with page structure
├── style.css           # All styling and responsive design
├── script.js           # JavaScript functionality and API calls
└── README.md           # Project documentation
```

## 🔧 Key Functions

| Function | Description |
|----------|-------------|
| `checkWeather(city)` | Fetches and displays weather for a specific city |
| `convertTemp(kelvin)` | Converts temperature units (C/F) |
| `formatTime(unixTime)` | Formats Unix timestamps to readable time |
| `calculateDewPoint()` | Calculates dew point using Magnus formula |
| `updateCurrentWeather()` | Updates current weather display |
| `updateHourlyForecast()` | Generates hourly forecast cards |
| `update5DayForecast()` | Generates 5-day forecast cards |

## 🌐 API Integration

The app uses the [OpenWeatherMap API](https://openweathermap.org/api) with the following endpoints:

- **Current Weather**: `api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `api.openweathermap.org/data/2.5/forecast`
- **Reverse Geocoding**: `api.openweathermap.org/geo/1.0/reverse`

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with 3-column grids
- **Tablet (≤768px)**: 2-column layouts for better readability
- **Mobile (≤600px)**: 1-column stacked layouts
- **Small Mobile (≤480px)**: Optimized spacing and font sizes

## 🎯 Future Enhancements

- [ ] Weather alerts and warnings
- [ ] Multiple city comparison
- [ ] Weather history and statistics
- [ ] Dark/Light theme toggle
- [ ] Favorite cities saved to local storage
- [ ] Air quality index (AQI)
- [ ] Weather maps integration
- [ ] PWA support for offline access
- [ ] Multi-language support

## 🐛 Known Issues

- UV Index displays as "N/A" (requires separate API endpoint)
- Some city names may have slight variations in the database

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**[Abdullah Akbar]**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: m.abdullah21306@gmail.com

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for the weather API
- [Font Awesome](https://fontawesome.com/) for icons
- [Flaticon](https://www.flaticon.com/) for weather icons

## 📧 Support

For support, email your.email@example.com or open an issue on GitHub.

---

**Made with ❤️ for weather enthusiasts**
