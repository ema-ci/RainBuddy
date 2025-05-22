import './App.css';
import sample from './assets/sample.png';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, messaging } from './FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onMessage } from 'firebase/messaging';

import { fetchLocation, fetchWeather } from "./utils/fetch";
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

    const [view, setView] = useState("today"); // "today" o "week"  FORECAST VIEW
    const handleViewChange = (newView) => setView(newView);

    const [currentView, setCurrentView] = useState("weather"); // "weather" o "profile"

    // Foreground notifications
    useEffect(() => {
        onMessage(messaging, (payload) => {
            console.log("Received message:", payload);
        });
    }, []);

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
                            //setInputCity(userData.city);
                            await fetchWeatherData(userData.city);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setErrorMessage("Failed to load user data.");
                }
            }

        });

        return () => unsubscribe();
    }, []);

    const fetchWeatherData = async (city) => {
        setErrorMessage('');

        try {
            const locationData = await fetchLocation(city);
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
            return;
        }

        fetchWeatherData(inputCity);
        setInputCity('');
    };


    const isOnline = navigator.onLine; // Check at rendering if the user is online
    if (!isOnline) {
        return <Fallback />;
    }

    if (!user) {
        // If user is not authenticated, show the Auth component
        return <Auth />;
    }

    if (currentView === "profile") {
        // If user is authenticated and current view is profile, show the Profile component
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

                            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>

                            <img src={sample} alt="Illustration" className="sidebar-illustration" />

                            {currentWeather && <h1>{Math.round(currentWeather.main.temp)}°C</h1>}

                            <p><strong>{currentWeather && currentWeather.weather[0].description
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </strong></p>

                            <p className='comment'>Qui ci sarà un divertente commento del signor RainBuddy</p>

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
                                    className={view === "today" ? "active" : ""}
                                    onClick={() => handleViewChange("today")}>Today</button>
                                <button 
                                    className={view === "week" ? "active" : ""}
                                    onClick={() => handleViewChange("week")}>Week</button>
                                <button 
                                    className="profile-button"
                                    onClick={() => setCurrentView("profile")}>👤  Profile</button>
                            </div>

                            <div className="weather-cards">
                                {view === "today" ? (
                                    <div className="hourly-cards">
                                        {hourlyForecast && hourlyForecast.list.map((hour, index) => (
                                            <div key={index} className="forecast-card">
                                                <h3>{new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', hour12: false })}</h3>
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
                                            const date = new Date(day.dt * 1000);
                                            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
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
                                        <div className="detail-card">
                                            <h4>Humidity</h4>
                                            <p>{currentWeather.main.humidity}%</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Wind Speed</h4>
                                            <p>{Math.round(currentWeather.wind.speed * 3.6)} km/h</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Pressure</h4>
                                            <p>{currentWeather.main.pressure} hPa</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Feels Like</h4>
                                            <p>{Math.round(currentWeather.main.feels_like)}°C</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Visibility</h4>
                                            <p>{(currentWeather.visibility / 1000).toFixed(1)} km</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Cloudiness</h4>
                                            <p>{currentWeather.clouds.all}%</p>
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