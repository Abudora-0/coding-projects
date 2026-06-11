const apiKey = "ab0c4031df070937e689b3a710ae834b";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const geoApiUrl = "https://api.openweathermap.org/geo/1.0/direct?limit=1&q=";

// DOM Elements
const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const errorContainer = document.querySelector(".error-container");
const loadingSpinner = document.getElementById("loadingSpinner");
const weatherCurrentSection = document.getElementById("currentWeather");

let currentTempUnit = "C";
let currentWeatherData = null;
let currentForecastData = null;

// Weather icon mapping
const weatherIcons = {
    "Clear": "fas fa-sun",
    "Clouds": "fas fa-cloud",
    "Rain": "fas fa-cloud-rain",
    "Drizzle": "fas fa-cloud-drizzle",
    "Thunderstorm": "fas fa-bolt",
    "Snow": "fas fa-snowflake",
    "Mist": "fas fa-smog",
    "Smoke": "fas fa-smog",
    "Haze": "fas fa-smog",
    "Dust": "fas fa-wind",
    "Fog": "fas fa-cloud-fog",
    "Sand": "fas fa-wind",
    "Ash": "fas fa-wind",
    "Squall": "fas fa-wind",
    "Tornado": "fas fa-tornado"
};

// Convert temperature
function convertTemp(kelvin) {
    if (currentTempUnit === "C") {
        return Math.round(kelvin);
    } else {
        return Math.round((kelvin * 9/5) + 32);
    }
}

// Format time
function formatTime(unixTime) {
    const date = new Date(unixTime * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Format date
function formatDate(unixTime) {
    const date = new Date(unixTime * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show/hide loading spinner
function toggleLoading(show) {
    if (show) {
        loadingSpinner.classList.add("active");
    } else {
        loadingSpinner.classList.remove("active");
    }
}

// Show error message
function showError(message = "City not found. Please try again.") {
    errorContainer.style.display = "block";
    errorContainer.querySelector("p").textContent = message;
    setTimeout(() => {
        errorContainer.style.display = "none";
    }, 5000);
}

// Get weather icon URL based on condition
function getWeatherIconURL(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

// Get icon from Font Awesome based on weather condition
function getWeatherIcon(condition) {
    return weatherIcons[condition] || "fas fa-cloud";
}

// Get city name from coordinates using Reverse Geocoding
async function getCityFromCoordinates(latitude, longitude) {
    try {
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.length > 0) {
            return data[0].name;
        }
        return null;
    } catch (error) {
        console.error("Error getting city from coordinates:", error);
        return null;
    }
}

// Get user's geolocation
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    console.warn("Geolocation error:", error);
                    reject(error);
                },
                {
                    timeout: 10000,
                    maximumAge: 3600000 // Cache position for 1 hour
                }
            );
        } else {
            reject(new Error("Geolocation not supported"));
        }
    });
}

// Fetch weather by coordinates
async function fetchWeatherByCoordinates(latitude, longitude) {
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather by coordinates:", error);
        return null;
    }
}

// Fetch current weather
async function fetchCurrentWeather(city) {
    try {
        const response = await fetch(weatherApiUrl + city + `&appid=${apiKey}`);
        
        if (response.status === 404) {
            showError("City not found. Please enter a valid city name.");
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather:", error);
        showError("Failed to fetch weather data. Please try again.");
        return null;
    }
}

// Fetch 5-day forecast
async function fetch5DayForecast(city) {
    try {
        const response = await fetch(forecastApiUrl + city + `&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching forecast:", error);
        return null;
    }
}

// Update current weather display
function updateCurrentWeather(data) {
    currentWeatherData = data;
    
    // Update location info
    document.querySelector(".city-name").textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector(".weather-description").textContent = data.weather[0].main;
    document.querySelector(".last-updated").textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    
    // Update weather icon
    const weatherIconURL = getWeatherIconURL(data.weather[0].icon);
    document.querySelector(".weather-icon-main").src = weatherIconURL;
    
    // Update temperature
    const temp = convertTemp(data.main.temp);
    const feelsLike = convertTemp(data.main.feels_like);
    document.querySelector(".temp").textContent = temp + "°";
    document.querySelector(".temp-unit").textContent = currentTempUnit;
    document.querySelector(".feels-like-temp").textContent = feelsLike + "°";
    
    // Update details
    document.querySelector(".humidity").textContent = data.main.humidity + "%";
    document.querySelector(".wind-speed").textContent = Math.round(data.wind.speed) + " km/h";
    document.querySelector(".pressure").textContent = data.main.pressure + " hPa";
    document.querySelector(".visibility").textContent = (data.visibility / 1000).toFixed(1) + " km";
    document.querySelector(".precipitation").textContent = (data.rain?.['1h'] || 0) + " mm";
    
    // Update additional info
    document.querySelector(".sunrise").textContent = formatTime(data.sys.sunrise);
    document.querySelector(".sunset").textContent = formatTime(data.sys.sunset);
    
    // Calculate dew point (approximation)
    const dewPoint = calculateDewPoint(data.main.temp, data.main.humidity);
    document.querySelector(".dew-point").textContent = Math.round(dewPoint) + "°";
    
    // Chance of rain (from forecast data if available)
    if (currentForecastData) {
        const rainChance = calculateRainChance(currentForecastData);
        document.querySelector(".rain-chance").textContent = rainChance + "%";
    }
    
    // UV Index (we'll use a placeholder - would need additional API for real UV data)
    document.querySelector(".uv-index").textContent = "N/A";
}

// Calculate dew point using Magnus formula
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return dewPoint;
}

// Calculate chance of rain from forecast
function calculateRainChance(forecastData) {
    const nextForecasts = forecastData.list.slice(0, 8);
    const rainyForecasts = nextForecasts.filter(f => f.rain?.['3h'] || 0 > 0).length;
    return Math.round((rainyForecasts / nextForecasts.length) * 100);
}

// Update hourly forecast
function updateHourlyForecast(data) {
    const hourlyContainer = document.getElementById("hourlyForecast");
    hourlyContainer.innerHTML = "";
    
    // Get next 24 hours (8 forecasts, 3 hours each)
    const hourlyForecasts = data.list.slice(0, 8);
    
    hourlyForecasts.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        const time = forecastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = convertTemp(forecast.main.temp);
        const iconClass = getWeatherIcon(forecast.weather[0].main);
        
        const hourlyItem = document.createElement("div");
        hourlyItem.className = "hourly-item";
        hourlyItem.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="hourly-icon"><i class="${iconClass}"></i></div>
            <div class="hourly-temp">${temp}°${currentTempUnit}</div>
        `;
        hourlyContainer.appendChild(hourlyItem);
    });
}

// Update 5-day forecast
function update5DayForecast(data) {
    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";
    
    // Group forecasts by day
    const dailyForecasts = {};
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(forecast);
    });
    
    // Get first 5 days
    let dayCount = 0;
    for (const [date, forecasts] of Object.entries(dailyForecasts)) {
        if (dayCount >= 5) break;
        
        // Calculate min/max temps
        const temps = forecasts.map(f => f.main.temp);
        const maxTemp = convertTemp(Math.max(...temps));
        const minTemp = convertTemp(Math.min(...temps));
        
        // Get most common weather condition
        const weatherCondition = forecasts[0].weather[0].main;
        const iconClass = getWeatherIcon(weatherCondition);
        
        const forecastDate = new Date(forecasts[0].dt * 1000);
        const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";
        forecastCard.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon"><i class="${iconClass}"></i></div>
            <div class="forecast-temp">
                <div class="forecast-max">${maxTemp}°${currentTempUnit}</div>
                <div class="forecast-min">${minTemp}°${currentTempUnit}</div>
            </div>
            <div class="forecast-desc">${weatherCondition}</div>
        `;
        forecastContainer.appendChild(forecastCard);
        dayCount++;
    }
}

// Main weather check function
async function checkWeather(city) {
    if (!city.trim()) {
        showError("Please enter a city name.");
        return;
    }
    
    toggleLoading(true);
    
    const currentWeather = await fetchCurrentWeather(city);
    
    if (!currentWeather) {
        toggleLoading(false);
        return;
    }
    
    const forecast = await fetch5DayForecast(city);
    
    toggleLoading(false);
    
    if (forecast) {
        currentForecastData = forecast;
        updateHourlyForecast(forecast);
        update5DayForecast(forecast);
    }
    
    updateCurrentWeather(currentWeather);
    errorContainer.style.display = "none";
    weatherCurrentSection.style.display = "block";
}

// Temperature unit toggle
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const newUnit = link.getAttribute("data-temp-unit");
        
        // Update UI styling
        document.querySelectorAll(".nav-link").forEach(l => l.style.borderColor = "var(--border-color)");
        link.style.borderColor = "var(--primary-color)";
        link.style.color = "var(--primary-color)";
        
        currentTempUnit = newUnit;
        
        // Update displays if we have weather data
        if (currentWeatherData) {
            updateCurrentWeather(currentWeatherData);
            if (currentForecastData) {
                updateHourlyForecast(currentForecastData);
                update5DayForecast(currentForecastData);
            }
        }
    });
});

// Event listeners
searchBtn.addEventListener("click", () => {
    checkWeather(cityInput.value);
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkWeather(cityInput.value);
    }
});

// Load default city on page load
document.addEventListener("DOMContentLoaded", async () => {
    // Set Celsius as default selected
    const celsiusLink = document.querySelector('[data-temp-unit="C"]');
    celsiusLink.style.borderColor = "var(--primary-color)";
    celsiusLink.style.color = "var(--primary-color)";
    
    // Try to get user's location and load weather
    try {
        toggleLoading(true);
        const { latitude, longitude } = await getUserLocation();
        
        // Get weather by coordinates
        const currentWeather = await fetchWeatherByCoordinates(latitude, longitude);
        
        if (currentWeather) {
            const forecast = await fetch5DayForecast(currentWeather.name);
            
            if (forecast) {
                currentForecastData = forecast;
                updateHourlyForecast(forecast);
                update5DayForecast(forecast);
            }
            
            updateCurrentWeather(currentWeather);
            cityInput.value = currentWeather.name;
            errorContainer.style.display = "none";
            weatherCurrentSection.style.display = "block";
        } else {
            // Fallback to default city if coordinates fail
            checkWeather("London");
        }
        
        toggleLoading(false);
    } catch (error) {
        console.warn("Could not get user location, loading default city...", error);
        toggleLoading(false);
        // Fallback to a default city
        checkWeather("London");
    }
});