import './App.css';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from './FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import { fetchLocation, fetchWeather } from "./utils/fetch";
import Auth from './components/Auth';

function App() {
  const [inputCity, setInputCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('Search for a city');
  const [user, setUser] = useState(null);

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
              setInputCity(userData.city);
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
      if (!locationData.lat || !locationData.lon) {
        setErrorMessage("City not found.");
        return;
      }

      const { weatherData, dailyForecastData, hourlyForecastData } = await fetchWeather(locationData);
      setWeatherData({
        currentData: weatherData,
        dailyForecast: dailyForecastData,
        hourlyForecast: hourlyForecastData
      });
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
  };

  return (
    <div className="App">
      {user ? (
        <div className="layout">
          <header className="header">
            <form
              className="search-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              <input
                type="text"
                placeholder="Cerca città..."
                value={inputCity}
                onChange={(event) => setInputCity(event.target.value)}
              />
            </form>
            <div className="profile-icon">👤</div>
          </header>

          <aside className="sidebar">
            <div className="sidebar-element"></div>
          </aside>

          <div className="container">
            {errorMessage ? (
              <p className="error-message">{errorMessage}</p>
            ) : (
              <>
                <div id="block-1" className="block block-a">
                  {weatherData && <p>{weatherData.currentData.weather[0].main}, {weatherData.currentData.weather[0].description}, {weatherData.currentData.main.temp}°C</p>}
                </div>

                <div id="block-2" className="block block-a">
                  {weatherData && weatherData.hourlyForecast.list.slice(0, 7).map((item, index) => (
                    <p key={index}>{Math.round(item.main.temp)}, </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;