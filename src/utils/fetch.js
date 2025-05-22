import axios from 'axios';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Function to fetch location data (latitude and longitude) based on city name
export const fetchLocation = async (city) => {
    const locationUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`;
    let locationData = {
        lat: null,
        lon: null,
        city: null, 
        state: null
    };

    try {
        const response = await axios.get(locationUrl);
        const data = response.data;
        console.log("Location Data:", data);

        if (Array.isArray(data) && data.length === 0) {
            throw new Error("The data array is empty!");
        } else {
            locationData = {
                lat: data[0].lat,
                lon: data[0].lon,
                city: data[0].name,
                state: data[0].state,
                country: data[0].country
            };
        }
    } catch (error) {
        console.error("Error fetching location data:", error.message);
    }

    return locationData;
};

// Function to fetch weather data (current weather, forecast, and hourly forecast) based on location data
export const fetchWeather = async (locationData) => {
    const { lat, lon } = locationData;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const dailyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&units=metric&appid=${API_KEY}`;
    const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&cnt=7&units=metric&appid=${API_KEY}`;

    let weatherData = null;
    let dailyForecastData = null;
    let hourlyForecastData = null;

    try {
        const [currentWeatherResponse, dailyForecastResponse, hourlyForecastResponse] = await Promise.all([
            axios.get(currentWeatherUrl),
            axios.get(dailyForecastUrl),
            axios.get(hourlyForecastUrl)
        ]);

        if (currentWeatherResponse.data.cod !== 200) {
            throw new Error(`Error: Received status code ${currentWeatherResponse.data.cod} for current weather`);
        }
        if (dailyForecastResponse.data.cod !== "200") {
            throw new Error(`Error: Received status code ${dailyForecastResponse.data.cod} for forecast`);
        }
        if (hourlyForecastResponse.data.cod !== "200") {
            throw new Error(`Error: Received status code ${hourlyForecastResponse.data.cod} for hourly forecast`);
        }

        weatherData = currentWeatherResponse.data;
        dailyForecastData = dailyForecastResponse.data;
        hourlyForecastData = hourlyForecastResponse.data;

        console.log("Current Weather Data:", weatherData);
        //console.log("Daily Forecast Data:", dailyForecastData);
        //console.log("Hourly Forecast Data:", hourlyForecastData);
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
    }

    return { weatherData, dailyForecastData, hourlyForecastData };
};