# RainBuddy

RainBuddy is a weather-focused web app featuring a custom mascot that visually represents different weather conditions.

Try it!  ->  https://rainbuddy-eb5e6.web.app/

# Technical Stack:
- Frontend: React.js and CSS
- Backend: Firebase (Authentication, Realtime Database, Cloud Messaging)

# Features:
- Users can search for any city to view current weather.
- After logging in, the app shows the weather for the preferred city selected during registration.
- The app uses different illustrations of the mascot based on the weather condition.

# APIs Used:
- Geocoding API for city coordinates
- Current Weather, Hourly Forecast, and Daily Forecast APIs for weather data
- Firebase Cloud Messaging for optional daily push notifications



## Commands to Start the Project:
1. `npm ci` - Install dependencies from package-lock.json
2. `npm start` - Start the development server

## Other Commands:

- `npm run build` - Build the project for production
- `firebase deploy` - Deploy to Firebase
- `firebase deploy --only hosting` - Deploy only hosting to Firebase

- `git branch` - See branches
- `git checkout name_branch` - Switch to a different branch
- `git add .` - Stage all changes
- `git commit -m ""` - Commit with message
- `git push` - Send to remote repository