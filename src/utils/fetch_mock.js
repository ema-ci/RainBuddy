// Mock data generators for testing purposes

const weatherConditions = ['Thunderstorm', 'Drizzle', 'Rain', 'Snow', 'Clear', 'Clouds', 'Atmosphere'];
const weatherDescriptions = {
    'Thunderstorm': ['thunderstorm with light rain', 'thunderstorm with rain', 'thunderstorm'],
    'Drizzle': ['light drizzle', 'drizzle', 'heavy drizzle'],
    'Rain': ['light rain', 'moderate rain', 'heavy rain', 'shower rain'],
    'Snow': ['light snow', 'snow', 'heavy snow'],
    'Clear': ['clear sky'],
    'Clouds': ['few clouds', 'scattered clouds', 'broken clouds', 'overcast clouds'],
    'Atmosphere': ['mist', 'fog', 'haze']
};

const cities = [
    { name: 'London', country: 'GB', state: 'England', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', country: 'US', state: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', country: 'JP', state: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', state: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', country: 'AU', state: 'New South Wales', lat: -33.8688, lon: 151.2093 },
    { name: 'Rome', country: 'IT', state: 'Lazio', lat: 41.9028, lon: 12.4964 },
    { name: 'Berlin', country: 'DE', state: 'Berlin', lat: 52.5200, lon: 13.4050 },
    { name: 'Madrid', country: 'ES', state: 'Madrid', lat: 40.4168, lon: -3.7038 }
];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max, decimals = 1) => 
    (Math.random() * (max - min) + min).toFixed(decimals);

const getRandomWeatherCondition = () => {
    const main = weatherConditions[getRandomInt(0, weatherConditions.length - 1)];
    const descriptions = weatherDescriptions[main];
    const description = descriptions[getRandomInt(0, descriptions.length - 1)];
    return { main, description };
};

const getWeatherIcon = (main, isDay = true) => {
    const iconMap = {
        'Thunderstorm': '11d',
        'Drizzle': '09d',
        'Rain': '10d',
        'Snow': '13d',
        'Clear': isDay ? '01d' : '01n',
        'Clouds': '04d',
        'Atmosphere': '50d'
    };
    return iconMap[main] || '01d';
};

export const fetchLocation = async (city) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, getRandomInt(200, 500)));
    
    // Random chance of "city not found"
    if (Math.random() < 0.1) {
        return null;
    }
    
    // Return a random city or match the input
    const matchingCity = cities.find(c => c.name.toLowerCase() === city.toLowerCase());
    const selectedCity = matchingCity || cities[getRandomInt(0, cities.length - 1)];
    
    return {
        city: selectedCity.name,
        country: selectedCity.country,
        state: selectedCity.state,
        lat: selectedCity.lat,
        lon: selectedCity.lon
    };
};

export const fetchWeather = async (locationData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, getRandomInt(300, 700)));
    
    const now = Math.floor(Date.now() / 1000);
    const timezone = getRandomInt(-43200, 43200); // Random timezone offset
    
    // Generate current weather
    const currentCondition = getRandomWeatherCondition();
    const currentTemp = getRandomFloat(-10, 35, 1);
    
    const weatherData = {
        dt: now,
        timezone: timezone,
        weather: [{
            main: currentCondition.main,
            description: currentCondition.description,
            icon: getWeatherIcon(currentCondition.main)
        }],
        main: {
            temp: parseFloat(currentTemp),
            humidity: getRandomInt(20, 95),
            pressure: getRandomInt(980, 1030)
        },
        wind: {
            speed: parseFloat(getRandomFloat(0, 15, 1)) // m/s
        },
        clouds: {
            all: getRandomInt(0, 100)
        },
        visibility: getRandomInt(1000, 10000),
        rain: Math.random() > 0.7 ? { '1h': parseFloat(getRandomFloat(0.1, 10, 1)) } : undefined,
        sys: {
            sunrise: now - getRandomInt(3600, 7200),
            sunset: now + getRandomInt(3600, 7200)
        }
    };
    
    // Generate hourly forecast (next 24 hours, every 3 hours)
    const hourlyForecastData = {
        city: {
            name: locationData.city,
            timezone: timezone
        },
        list: Array.from({ length: 8 }, (_, i) => {
            const hourCondition = getRandomWeatherCondition();
            return {
                dt: now + (i * 3 * 3600),
                main: {
                    temp: parseFloat(getRandomFloat(parseFloat(currentTemp) - 5, parseFloat(currentTemp) + 5, 1))
                },
                weather: [{
                    main: hourCondition.main,
                    description: hourCondition.description,
                    icon: getWeatherIcon(hourCondition.main)
                }]
            };
        })
    };
    
    // Generate daily forecast (next 7 days)
    const dailyForecastData = {
        city: {
            name: locationData.city,
            timezone: timezone
        },
        list: Array.from({ length: 7 }, (_, i) => {
            const dayCondition = getRandomWeatherCondition();
            const maxTemp = parseFloat(getRandomFloat(parseFloat(currentTemp), parseFloat(currentTemp) + 10, 1));
            const minTemp = parseFloat(getRandomFloat(parseFloat(currentTemp) - 10, parseFloat(currentTemp), 1));
            
            return {
                dt: now + ((i + 1) * 86400),
                temp: {
                    max: maxTemp,
                    min: minTemp
                },
                weather: [{
                    main: dayCondition.main,
                    description: dayCondition.description,
                    icon: getWeatherIcon(dayCondition.main)
                }]
            };
        })
    };
    
    return {
        weatherData,
        dailyForecastData,
        hourlyForecastData
    };
};