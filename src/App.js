import './App.css';
import './cards.css';
import rain from './assets/rain.png';
import clouds from './assets/clouds.png';
import snow from './assets/snow.png';
import sun from './assets/sun.png';
import loading from './assets/loading.gif';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, messaging } from './FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onMessage } from 'firebase/messaging';

import { fetchLocation, fetchWeather } from "./utils/fetch_mock";
import Auth from './components/Auth';
import Profile from './components/Profile';
import Fallback from './components/Fallback'



function App() {
    const [inputCity, setInputCity] = useState('');
    const [locationData, setLocationData] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [dailyForecast, setDailyForecast] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState(null);
    const [errorMessage, setErrorMessage] = useState('Search for a city');
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const [forecastView, setForecastView] = useState("today"); // "today" o "week"
    const [currentView, setCurrentView] = useState("weather"); // "weather" o "profile"

    // Foreground notifications
    useEffect(() => {
        onMessage(messaging, (payload) => {
            console.log("Received message:", payload);
            alert(`Notification: ${payload.notification.title}\n${payload.notification.body}`);
        });
    }, []);

    // Check online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    //fetch user data (location preference)
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.city) {
                            await fetchWeatherData(userData.city); 
                            //setInputCity(userData.city); 
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setErrorMessage("Failed to load user data.");
                }
            }
            setIsAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchWeatherData = async (city) => {
        setErrorMessage('');

        try {
            const locationData = await fetchLocation(city);

            if (!locationData) {
                setErrorMessage("City not found. Please check the spelling and try again.");
                return;
            }

            setLocationData(locationData);
            
            if (!locationData.lat || !locationData.lon) {
                setErrorMessage("City not found.");
                return;
            }

            const { weatherData, dailyForecastData, hourlyForecastData } = await fetchWeather(locationData);
            setCurrentWeather(weatherData);
            setDailyForecast(dailyForecastData);
            setHourlyForecast(hourlyForecastData);

        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("An error occurred while fetching data.");
        }
    };

    const handleSearch = async () => {
        if (inputCity.trim() === '') {
            setErrorMessage("Please enter a valid city name.");
            setInputCity('');
            return;
        }

        fetchWeatherData(inputCity);
        setInputCity('');
    };

    const getWeatherVisuals = (main) => {
        switch (main) {
            case "Thunderstorm":
                return {
                    image: rain,
                    message: "Thunder and lightning! Better stay indoors."
                };
            case "Atmosphere":
                return {
                    image: clouds,
                    message: "Mysterious atmosphere... maybe a storm is coming."
                };
            case "Clouds":
                return {
                    image: clouds,
                    message: "The sky’s rolling out its dramatic gray carpet."
                };
            case "Clear":
                return {
                    image: sun,
                    message: "The sky is clear! even though the sun isn’t out, a nice walk would still be great."
                };
            case "Drizzle":
                return {
                    image: rain,
                    message: "Light drizzle! It's better to have an umbrella handy."
                };
            case "Rain":
                return {
                    image: rain,
                    message: "Meh, it's raining today. Don't forget your umbrella!"
                };
            case "Snow":
                return {
                    image: snow,
                    message: "It's time to build a snowman!"
                };
            default:
                return {
                    image: sun,
                    message: "Unknown weather... be ready for anything!"
                };
        }
    };    


    if (!isOnline) {
        // If the user is offline, show the Fallback component
        return <Fallback />;
    }

    if (isAuthLoading) {
        return <div>
            <img src={loading} alt="Loading..." className="loading" />
        </div>;
    }

    if (!user) {
        // If user is not authenticated, show the Auth component
        return <Auth />;
    }

    if (currentView === "profile") {
        // Go to the profile page passing the user data (onBack to return to the weather view)
        return <Profile user={user} onBack={() => setCurrentView("weather")} />;
    }

    return (
        <div className="App">
            <div className="layout">
                
                <aside className="sidebar">

                    <form
                        className="search-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSearch();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="🔍  Search places"
                            value={inputCity}
                            onChange={(event) => setInputCity(event.target.value)}
                        />
                    </form>

                    {errorMessage ? (

                        <>
                            <p className="error-message">{errorMessage}</p>
                        </>

                    ) : (

                        <>

                            {locationData && <h3>{locationData.city}, {locationData.state || locationData.country}</h3>}

                            {currentWeather && (
                                <>
                                    <p>
                                        {new Date((currentWeather.dt + currentWeather.timezone) * 1000).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })}
                                        {", "}
                                        {new Date((currentWeather.dt + currentWeather.timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
                                    </p>

                                    <img src={getWeatherVisuals(currentWeather.weather[0].main).image} alt="Illustration" className="sidebar-illustration" />

                                    <h1>{Math.round(currentWeather.main.temp)}°C</h1>

                                    <p>
                                        <strong>
                                            {currentWeather.weather[0].description
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')
                                            }
                                        </strong>
                                    </p>

                                    <p className='comment'>{getWeatherVisuals(currentWeather.weather[0].main).message}</p>
                                </>
                            )}

                        </>

                    )}

                </aside>

                <section className="content">
                    {errorMessage ? (

                        <></>

                    ) : (
                        
                        <>              
                            <div className="tabs">
                                <button 
                                    className={forecastView === "today" ? "active" : ""}
                                    onClick={() => setForecastView("today")}>Today</button>
                                <button 
                                    className={forecastView === "week" ? "active" : ""}
                                    onClick={() => setForecastView("week")}>Week</button>
                                <button 
                                    className="profile-button"
                                    onClick={() => setCurrentView("profile")}>👤  Profile</button>
                            </div>

                            <div className="weather-cards">
                                {forecastView === "today" ? (
                                    <div className="hourly-cards">
                                        {hourlyForecast && hourlyForecast.list.map((hour, index) => (
                                            <div key={index} className="forecast-card">
                                                <h3>{new Date((hour.dt + hourlyForecast.city.timezone) * 1000).getUTCHours()}</h3>
                                                <img 
                                                    src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} 
                                                    alt={hour.weather[0].description} 
                                                />
                                                <p><strong>{Math.round(hour.main.temp)}°</strong></p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="daily-cards">
                                        {dailyForecast && dailyForecast.list.map((day, index) => {
                                            const date = new Date((day.dt + dailyForecast.city.timezone) * 1000);
                                            const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timezone: 'UTC' });
                                            return (
                                                <div key={index} className="forecast-card">
                                                    <h3>{weekday}</h3>
                                                    <img 
                                                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                                                        alt={day.weather[0].description} 
                                                    />
                                                    <p><strong>{Math.round(day.temp.max)}°</strong> {Math.round(day.temp.min)}°</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <h1>Today Highlight</h1>

                            <div className="weather-details">
                                {currentWeather && (
                                    <div className="weather-details-grid">
                                        
                                        {/* Rain */}
                                        <div className="detail-card">
                                            <span className="detail-title">Rain</span>
                                            <div className="detail-main">
                                                <span className="detail-value">
                                                    {currentWeather.rain && currentWeather.rain['1h'] ? currentWeather.rain['1h'] : 0}
                                                </span>
                                                <span className="detail-unit">mm/h</span>
                                            </div>
                                            <div className="detail-status">
                                                {currentWeather.rain && currentWeather.rain['1h'] > 0 ? "Rainy" : "No rain"}
                                            </div>
                                        </div>
                                    
                                        {/* Wind Speed */}
                                        <div className="detail-card">
                                            <span className="detail-title">Wind Speed</span>
                                            <div className="detail-main">
                                                <span className="detail-value">
                                                    {Math.round(currentWeather.wind.speed * 3.6)}
                                                </span>
                                                <span className="detail-unit">km/h</span>
                                            </div>
                                            <div className="detail-status">
                                                {Math.round(currentWeather.wind.speed * 3.6) > 30 ? "Windy" : "Calm"}
                                            </div>
                                        </div>
                                    
                                        {/* Sunrise & Sunset */}
                                        <div className="detail-card">
                                            <span className="detail-title">Sunrise & Sunset</span>
                                            <div className="sun-time">
                                                <div className="sun-time-text">
                                                    ↑ {new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                                <div className="sun-time-text">
                                                    ↓ {new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                            </div>
                                        </div>
                                    
                                        {/* Visibility */}
                                        <div className="detail-card">
                                            <span className="detail-title">Visibility</span>
                                            <div className="detail-main">
                                                <span className="detail-value">
                                                    {(currentWeather.visibility / 1000).toFixed(1)}
                                                </span>
                                                <span className="detail-unit">km</span>
                                            </div>
                                            <div className="detail-status">
                                                {currentWeather.visibility >= 10000
                                                    ? "Clear"
                                                    : currentWeather.visibility >= 4000
                                                    ? "Moderate"
                                                    : "Poor"}
                                            </div>
                                        </div>
                                    
                                        {/* Clouds */}
                                        <div className="detail-card">
                                            <span className="detail-title">Clouds</span>
                                            <div className="detail-main">
                                                <span className="detail-value">
                                                    {currentWeather.clouds.all}
                                                </span>
                                                <span className="detail-unit">%</span>
                                            </div>
                                            <div className="detail-status">
                                                {currentWeather.clouds.all < 20
                                                    ? "Clear sky"
                                                    : currentWeather.clouds.all < 60
                                                    ? "Partly cloudy"
                                                    : "Cloudy"}
                                            </div>
                                        </div>
                                    
                                        {/* Humidity */}
                                        <div className="detail-card">
                                            <span className="detail-title">Humidity</span>
                                            <div className="detail-main">
                                                <span className="detail-value">
                                                    {currentWeather.main.humidity}
                                                </span>
                                                <span className="detail-unit">%</span>
                                            </div>
                                            <div className="detail-status">
                                                {currentWeather.main.humidity < 30
                                                    ? "Dry"
                                                    : currentWeather.main.humidity < 60
                                                    ? "Comfortable"
                                                    : "Humid"}
                                            </div>
                                        </div>
                                    
                                    </div>
                                )}
                            </div>

                        </>

                    )}
                    
                </section>

            </div>
        </div>
    );
}

export default App;