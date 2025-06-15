
# 🚀 DestNotify - Your Ultimate Travel Adventure Hub! 🌍

📍 **Never Miss a Stop, Never Miss the Fun!**  
DestNotify is a **feature-packed Progressive Web App (PWA)** crafted single-handedly to revolutionize your travel experience. With **smart location-based alarms**, **continuous distance tracking**, and a treasure trove of personalized features like weather-based travel tips, movie trailers, local news, holidays, and famous foods, DestNotify ensures you arrive at your destination with **vibrations**, **custom alarms**, **push notifications**, and **party explosions**. It’s not just an app—it’s your **all-in-one travel buddy**, designed to keep you informed, entertained, and on track! 🎉

---

## 🌟 Why I Built DestNotify

As a solo developer and avid traveler, I’ve missed bus stops, gotten lost in new cities, and yearned for a tool that could do more than just navigate. I wanted an app that would **alert me precisely** when I reached my destination, even offline or with my phone locked, while enriching my journey with **personalized suggestions** for food, movies, news, holidays, and travel tips. My dream was to create a **multifunctional travel companion** that’s intuitive, fun, and bursting with features. Thus, **DestNotify** was born! 🚀

My vision was clear:
- Deliver **reliable location-based alarms** with real-time distance tracking using the Haversine formula.
- Build a **one-stop app** with AI-driven suggestions, weather tips, and cultural insights.
- Create a **Progressive Web App (PWA)** for cross-platform access, offline support, and installability.
- Design a **vibrant, engaging UI** with animations, gradients, and a modern vibe.

---

## ✨ Key Features

DestNotify is a powerhouse of features, meticulously designed to make every journey seamless, exciting, and informed. Here’s the complete lineup:

- **📍 Destination Selection with Google Maps**  
  Pin destinations on an interactive map and customize:
  - **Latitude & Longitude**: Precise coordinates for accurate tracking.
  - **Destination Name**: Auto-fetched via reverse geocoding (Google Maps API) or user-entered.
  - **Alarm Name**: Choose from preloaded audio files (e.g., `alarm1.mp3`) or upload custom sounds.
  - **Proximity Range**: Adjustable slider (50m–500m) to trigger alerts when you’re close. 🗺️

- **🔔 Smart Location-Based Alarms with Multi-Channel Notifications**  
  I carefully planned the destination arrival experience to ensure users are notified through multiple channels, even in noisy or distracting environments:
  - **Push Notifications**: Delivered via Service Workers (`sw.js`) with vibrant messages like “🎉 You’re at [Destination]! Party on! 🎊✨”. Includes icon (`favicon.ico`), vibration, and sound, with `renotify: true` to re-alert if needed. Notifications are tagged (e.g., `dest-[Destination]`) to avoid duplicates.
  - **Vibration Feedback**: Custom pattern `[500, 200, 500, 200, 500]` ensures tactile alerts on mobile devices, even with the screen off, perfect for loud settings like buses or trains.
  - **On-Screen Popup**: A celebratory popup (`#reached-announcement`) with `fadeInOut` animation displays “You’ve reached [Destination]!” in a dark, rounded box for 3 seconds, ensuring visibility if the app is open.
  - **Email Confirmation**: Sends a polished email via **EmailJS** upon arrival, including destination name, coordinates, and a festive message (e.g., “Congrats on reaching [Destination]!”). This reinforces the arrival for users checking their inbox later.
  - **Background Sync**: Notifications work when the app is minimized, using `check-location` sync in `sw.js`, ensuring reliability even if the phone is locked. 🎵

- **📏 Continuous Distance Calculation**  
  Uses the Haversine formula in `script.js` for real-time distance between your location and destination. The function is defined as: function getDistance(lat1, lon1, lat2, lon2) { const R = 6371e3; // Earth radius in meters const φ1 = (lat1 * Math.PI) / 180; const φ2 = (lat2 * Math.PI) / 180; const Δφ = ((lat2 - lat1) * Math.PI) / 180; const Δλ = ((lon2 - lon1) * Math.PI) / 180; const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; // Distance in meters }. Updates every 5 seconds for precise tracking, ensuring timely alerts without draining battery. 📐

- **⭐ Favorite Destinations**  
  Mark destinations as favorites with a **star button**:
  - Highlighted with a gold border (`favorite` class in `styles.css`).
  - Automatically **popped to the top** of the destinations list for quick access.
  - Includes a “Show Famous Foods” button (😋 emoji) for favorites only, fetching local cuisine (e.g., Hyderabadi Biryani for Hyderabad) via **Gemini API**. 🌟

- **🌦️ Weather Updates & Travel Tips**  
  For each added destination:
  - Displays real-time **weather** (temperature, icon, description) using **OpenWeather API**, styled in a gradient box with a pulsing loader.
  - Provides **weather-based travel tips** via **Gemini API** (e.g., “Rainy in Hyderabad? Visit a cozy café!” or “Sunny? Explore Golconda Fort!”).
  - Updates dynamically using destination’s latitude/longitude, ensuring tips are location-specific. ☀️

- **🍽️ Famous Foods Suggestions**  
  Discover local cuisine for destinations (or favorites) using **Gemini API**:
  - Vibrant popup with food-patterned background and `slideUp` animation.
  - Lists dishes with descriptions (e.g., Dosa and Filter Coffee for Chennai).
  - Fixed emoji issues by replacing placeholders with 😋 for consistency. 🍕

- **🎬 Movie Recommendations with YouTube API**  
  Find movies tailored to your destination or weather (e.g., thrillers for rainy days) using **Gemini API**:
  - Cinematic popup with film-reel aesthetic, posters, snippets, and **YouTube trailer links** via **YouTube API**.
  - Example: Suggests Telugu blockbusters for Hyderabad with embedded trailers.
  - Styled with `fadeIn` animation and responsive cards. 🎥

- **🎉 Local Holiday Insights**  
  Learn about holidays at your destination using **Calendarific API**:
  - Gold-themed popup with names, dates, descriptions, and travel tips.
  - Animated with `holidaySlideIn` for a festive vibe.
  - Example: Suggests Diwali celebrations for India destinations. 🎄

- **📰 Local News Updates**  
  Stay informed with breaking news for your destination via **GNews API**:
  - Scrollable popup with skeleton loaders for smooth UX.
  - Fetches articles based on destination’s location name. 🗞️

- **🤖 DestiNotiX AI Chatbot**  
  Chat with **DestiNotiX**, an AI-powered bot using **Gemini API**:
  - Offers travel tips, destination suggestions, and witty banter.
  - Supports **fullscreen mode** for immersive chats.
  - Formats responses with gold-bulleted lists (`#chatBox li` in `styles.css`) for clarity.
  - Example: “Visiting Delhi? Don’t miss Qutub Minar and street chaat!” 💬

- **📧 Email Notifications**  
  Receive emails for destination additions and arrivals via **EmailJS**:
  - Includes destination details, coordinates, and festive messages.
  - Fixed image issues (e.g., `x2.png` showing alt text) using public URLs (Imgur).
  - Styled with professional templates for a polished look. 📬

- **🎉 Party Explosion Mode**  
  Celebrates arrivals with:
  - **Confetti animations** (`explodeDown`, `explodeUp`, `explodeLeft`, `explodeRight` in `styles.css`).
  - Festive notification: “🎉 You’re at [Destination]! 🥳 Party on! 🎊✨”.
  - Vibration and sound for extra flair, creating a celebratory vibe. 🎊

- **🔄 Auto-Learn Technology**  
  Analyzes past destinations to suggest smarter routes and locations, stored in LocalStorage for persistence. 🧠

- **🚮 User Data Deletion (Reset Button)**  
  Clear all data (destinations, favorites, logs) with a **circular, bottom-left reset button**:
  - Features a trash can emoji (🗑️), red-to-orange gradient, and hover effects.
  - Resets LocalStorage and reloads the app for a fresh start. 🧹

- **🗑️ Individual Destination Deletion**  
  Remove specific destinations with a trash icon on each card, updating LocalStorage instantly. 🗑️

- **📜 Reached Destinations Log**  
  Tracks reached destinations in LocalStorage, displayed as a travel journal in the UI. 📜

- **📡 Smart Caching & Offline Support**  
  Caches assets (HTML, CSS, JS, images) and API responses in `destnotify-data` cache (`sw.js`) for offline access. Background sync checks location with `check-location` tag, ensuring functionality without internet. 🌐

- **📱 Progressive Web App (PWA)**  
  Installable on iOS, Android, and desktop with standalone display via `manifest.json`. Supports offline mode and push notifications for a native app feel. 📲

- **🎨 Modern UI/UX**  
  Dark theme with **Quicksand font**, gradient buttons, and animations:
  - Popups: `slideUp`, `fadeIn`, `holidaySlideIn`.
  - Confetti: `explodeDown`, `explodeUp`.
  - Floating **Features button** (gold-bordered, bottom-right) toggles news, weather, food, movies, holidays, and DestiNotiX with a `floatButton` animation. ✨

---

## 🛠️ Tech Stack & APIs

DestNotify’s tech stack and APIs were chosen for performance, versatility, and user delight. Here’s the breakdown:

| Technology/API | Purpose | Why I Chose It |
|----------------|---------|----------------|
| **HTML5** | App structure | Semantic, accessible, lightweight for PWA. |
| **CSS3 (Bootstrap, Tailwind)** | Styling & responsive design | Bootstrap for modals, Tailwind for flexibility, custom CSS for animations (e.g., `slideUp`, `explodeDown`). |
| **JavaScript (ES6+)** | Logic & interactivity | Powers geolocation, Haversine calculations, API calls, and dynamic UI updates. |
| **Google Maps API** | Map display & reverse geocoding | Industry-standard for accurate maps and location names. |
| **Geolocation API** | Real-time location tracking | Native browser API for precise, permission-based data. |
| **Gemini API** | Chatbot, food, movies, travel tips | Versatile AI for multiple features, reducing API dependencies. |
| **Calendarific API** | Holiday insights | Reliable for global holiday data with easy integration. |
| **GNews API** | Local news updates | Fast, location-specific news with a generous free tier. |
| **OpenWeather API** | Weather updates | Simple, reliable for real-time weather data. |
| **YouTube API** | Movie trailer links | Embeds trailers for immersive movie suggestions. |
| **EmailJS** | Email notifications | Serverless, quick setup for emails without a backend. |
| **Service Workers** | Offline caching & background sync | Enables PWA features like caching and location checks. |
| **LocalStorage** | Persistent data | Client-side storage for destinations, favorites, and logs. |
| **Netlify** | Deployment | Free, fast, static hosting with SSL and CI/CD. |

### Benefits of the Tech Stack
- **Fast & Lightweight**: HTML, CSS, JS, and Service Workers ensure quick load times and offline functionality.
- **Cross-Platform**: PWA works on iOS, Android, and desktop browsers.
- **Scalable**: APIs support future features like traffic or voice commands.
- **Developer-Friendly**: Bootstrap, Tailwind, and Netlify simplified development.

### Why These APIs?
To make DestNotify a **one-stop travel app**, I selected APIs for **multifunctionality**:
- **Google Maps API**: Essential for core destination selection and precise location names.
- **Gemini API**: Powers chatbot, food, movies, and travel tips with a single, versatile AI model.
- **Calendarific API**: Adds cultural context with holiday data.
- **GNews API**: Keeps users informed with location-specific news.
- **OpenWeather API**: Enhances practicality with weather updates.
- **YouTube API**: Elevates movie suggestions with trailer embeds.
- **EmailJS**: Simplifies email notifications without a server.

This combination ensures DestNotify is **feature-rich**, **maintainable**, and delivers a holistic travel experience.

---

## 📂 Project Structure

Here’s how the project is organized:
📦 DestNotify
├── 📄 index.html           # Main UI with map, popups, and features
├── 📄 about.html           # About page detailing app features
├── 📄 manifest.json        # PWA config for installability and icons
├── 📄 sw.js                # Service Worker for offline caching and sync
├── 📄 script.js            # Core logic for geolocation, APIs, and features
├── 📄 styles.css           # Custom styles for UI, animations, and popups
├── 📁 assets               # Images, icons, and audio files
│   ├── 📷 favicon.ico      # App icon for notifications
│   ├── 🎵 alarm1.mp3       # Default alarm sound
│   ├── 📷 logo.png         # App logo for manifest
│   └── 📷 x2.png           # EmailJS template image
└── 📄 README.md            # Project documentation

### Key Files
- **`index.html`**: Main interface with Google Maps, Bootstrap modals, and popups for news, weather, food, movies, holidays, and DestiNotiX.
- **`script.js`**: Handles geolocation, Haversine calculations, API calls, Auto-Learn, alarms, vibrations, and UI updates.
- **`styles.css`**: Defines dark theme, Quicksand font, gradient buttons, and animations (`slideUp`, `explodeDown`, `holidaySlideIn`).
- **`sw.js`**: Manages offline caching and background location checks using the `sync` event.
- **`manifest.json`**: Configures the PWA for standalone display and installability.
- **`about.html`**: Showcases features like Smart Caching, Auto-Learn, and Reset Details.

---

## 🛠️ Development Journey

As a solo developer, I poured my heart into DestNotify, navigating challenges and celebrating milestones alone. Here’s the epic journey:

### 1. The Spark (Initial Setup 💡)
- **Goal**: Build a location-based alarm app.
- **Tech**: HTML, CSS, JS, Google Maps API.
- **Features**: Map selection, proximity alerts, Haversine distance calculation.
- **Challenges**:
  - Integrating Google Maps for dynamic markers.
  - Ensuring geolocation accuracy across devices.
- **Solutions**:
  - Followed Google Maps API docs for `google.maps.event.addListener`.
  - Tested on Chrome, Firefox, and mobile browsers.

### 2. Core Features (The Foundation 🏗️)
- **Features Added**:
  - Custom audio alarms with upload support.
  - Favorite destinations with famous foods button.
  - Vibration patterns for alerts.
  - EmailJS for confirmation emails.
  - LocalStorage for persistent data.
- **Tech**: Added Bootstrap for modals, Tailwind for styling.
- **Challenges**:
  - LocalStorage data conflicts during updates.
  - EmailJS image embedding issues (e.g., `x2.png` showing alt text).
- **Solutions**:
  - Structured data with JSON for consistency.
  - Used public image URLs (Imgur) for EmailJS templates.

### 3. Multifunctionality (The Growth 🌱)
- **Features Added**:
  - Auto-Learn for smarter suggestions.
  - Weather updates with travel tips (OpenWeather, Gemini).
  - Food and movie suggestions (Gemini, YouTube API).
  - Holiday insights (Calendarific).
  - Local news (GNews).
  - DestiNotiX chatbot with fullscreen mode.
  - Party explosion mode with confetti animations.
- **Tech**: Integrated multiple APIs, optimized with caching.
- **Challenges**:
  - Slow API responses for multiple features.
  - Popup overflow on small screens.
  - CORS issues with Gemini API locally.
- **Solutions**:
  - Used `Promise.all` for parallel API calls, cached responses in LocalStorage.
  - Set `max-height: 80vh` and `overflow-y: auto` in `styles.css`.
  - Set up a proxy server for local testing.

### 4. PWA Transformation (The Leap 🚀)
- **Goal**: Make DestNotify installable and offline-capable.
- **Tech**: Added `manifest.json` and `sw.js` for PWA features.
- **Features**:
  - Offline caching of assets and API responses.
  - Background sync for location checks using `check-location`.
  - Push notifications with vibrations and sounds.
- **Challenges**:
  - Inconsistent background notifications due to browser restrictions.
  - Service Worker `localStorage` access limitations.
- **Solutions**:
  - Used cache storage in `sw.js` instead of `localStorage`.
  - Implemented foreground notifications with vibrations as fallback.

### 5. UI/UX Polish (The Shine ✨)
- **Features Added**:
  - Welcome greeting with single name/email prompt.
  - Reset button with hover effects and trash can emoji.
  - Floating Features button to toggle popups.
  - Animations for popups (`slideUp`, `holidaySlideIn`) and confetti (`explodeDown`).
  - Fixed DestiNotiX bullet point alignment.
- **Tech**: Refined `styles.css` with Quicksand font, gradients.
- **Challenges**:
  - UI overlaps (e.g., toast vs. reset button).
  - Bullet point misalignment in chatbot responses.
- **Solutions**:
  - Moved toasts to bottom-right with `z-index: 1001`.
  - Fixed chatbot lists with `<ul><li>` nesting and CSS (`#chatBox li`).

### 6. Extensive Testing (The Validation 🧪)
- As a solo developer, I conducted rigorous testing to ensure DestNotify was robust, reliable, and user-friendly:
  - **Local Testing**:
    - Ran `http-server` (`npm install -g http-server`) on `localhost:8080` to simulate a production environment.
    - Tested UI rendering, map interactions, and popup animations in Chrome, Firefox, Edge, and Safari.
    - Validated JavaScript functions (e.g., Haversine formula, API calls) using console logs and debugger breakpoints.
    - Checked CSS animations (`slideUp`, `explodeDown`) for smoothness on low-end laptops.
  - **Mobile Emulation**:
    - Used Chrome DevTools to simulate devices like iPhone 12, Galaxy S20, Pixel 5, and iPad Air.
    - Verified responsive popups (`max-height: 80vh`, `overflow-y: auto`), touch gestures, and vibration feedback.
    - Ensured PWA install prompt appeared on Chrome and Safari mobile emulators.
    - Tested orientation changes (portrait to landscape) for UI consistency.
  - **Real-World Testing**:
    - Installed DestNotify on my personal Android phone (Samsung Galaxy A52, Android 13) and borrowed an iPhone 11 (iOS 16) for testing.
    - Conducted field tests by walking to nearby locations (e.g., local café 200m away, park 500m away) with custom proximity ranges (50m, 100m, 300m).
    - Verified multi-channel notifications (push, vibrations, popups, emails) in noisy environments like crowded buses and markets.
    - Tested alarms during simulated naps by locking the phone and walking to a destination, ensuring vibrations and push notifications triggered reliably.
    - Validated offline mode by disabling Wi-Fi and mobile data, checking cached assets (map tiles, popups) and API responses (weather, news).
    - Performed long-distance tests (e.g., 5km bike ride, 10km auto-rickshaw trip) to confirm Haversine calculations updated every 5 seconds without lag.
  - **API Testing**:
    - Used Postman to mock API responses for Gemini, Calendarific, GNews, OpenWeather, YouTube, and Google Maps.
    - Tested error handling (e.g., “No holidays found” for Calendarific, cached weather for OpenWeather) under network failures.
    - Validated EmailJS delivery across Gmail, Outlook, and Yahoo, checking template rendering and image display.
    - Ensured YouTube trailer embeds loaded correctly and fell back to static links if API quotas were exceeded.
  - **Edge Case Testing**:
    - Simulated GPS drift by toggling location services on/off, adjusting proximity ranges to mitigate false positives.
    - Tested reset button by clearing LocalStorage and verifying UI refresh and data removal.
    - Validated favorite destinations stayed at the top of the list and displayed the “Show Famous Foods” button only for favorites.
    - Checked party explosion mode by reaching multiple destinations, ensuring confetti animations didn’t overload the UI.
    - Tested DestiNotiX chatbot with complex queries (e.g., “What’s fun in Hyderabad during monsoon?”) to confirm bullet point formatting.
  - **Performance Testing**:
    - Used Lighthouse in Chrome DevTools to optimize performance, achieving scores above 90 for PWA, accessibility, and speed.
    - Reduced API calls by caching responses in LocalStorage, minimizing battery drain during continuous distance checks.
    - Optimized animations with `will-change` and reduced keyframes for low-end devices.
  - **Cross-Browser Compatibility**:
    - Tested on Chrome (v126), Firefox (v115), Edge (v126), and Safari (v16) to ensure consistent map rendering, notifications, and popups.
    - Fixed Safari-specific issues with Service Worker registration and vibration API support.
- This exhaustive testing ensured DestNotify was polished, reliable, and ready for real-world travel scenarios.

### 7. Deployment & Cleanup (The Launch 🌐)
- **Deployment**:
  - Hosted on **Netlify** for free, static hosting with automatic SSL and CI/CD.
  - Configured iterative deployments for UI improvements and feature additions.
- **Cleanup**:
  - Removed Express and Node.js dependencies (`node_modules`, `package.json`, `package-lock.json`, `server.js`) as they were unnecessary for a static PWA.
  - Rewrote notification logic in `sw.js` using `self.registration.showNotification`.
  - Used EmailJS for serverless email notifications.
- **Challenges**:
  - Netlify caching caused stale assets.
  - Cross-browser PWA install prompt issues.
- **Solutions**:
  - Added cache-busting query strings for assets.
  - Included a manual “Install” button in `index.html`.

---

## ⚠️ Challenges & Solutions

Building DestNotify solo wasn’t without hurdles. Here are the major challenges and how I tackled them:

1. **Background Notification Inconsistency**  
   - **Issue**: Browser restrictions limited Service Worker notifications when the app was closed.
   - **Impact**: Users might miss alerts on long journeys.
   - **Solution**: Implemented foreground notifications with vibrations and popups as fallback. Used tagged notifications (`dest-[Destination]`) to manage duplicates. Planned a future server for reliable push notifications.
   - **Insight**: `sw.js` used cache storage for `checkUserLocation` since `localStorage` isn’t accessible in Service Workers.

2. **API Response Delays**  
   - **Issue**: Multiple API calls (Google Maps, Gemini, Calendarific, GNews, OpenWeather, YouTube) caused UI delays.
   - **Solution**: Cached responses in LocalStorage, used `Promise.all` for parallel requests, and added skeleton loaders (`styles.css`) for smoother UX.

3. **Responsive Popups**  
   - **Issue**: Food, movie, and holiday popups overflowed on small screens.
   - **Solution**: Set `max-height: 80vh`, `overflow-y: auto`, and media queries in `styles.css` for responsiveness.

4. **Geolocation Accuracy**  
   - **Issue**: GPS drift caused false positives for destination alerts.
   - **Solution**: Increased default proximity radius (100m) and allowed user customization in `script.js`.

5. **EmailJS Image Embedding**  
   - **Issue**: Images (e.g., `x2.png`) showed alt text in emails.
   - **Solution**: Used public URLs (Imgur) instead of Google Drive iframes.

6. **Chatbot Bullet Points**  
   - **Issue**: Misaligned bullets in DestiNotiX responses.
   - **Solution**: Updated `formatBotResponse` in `script.js` and styled `#chatBox li` in `styles.css`.

7. **Favorite Foods Button Visibility**  
   - **Issue**: “Show Famous Foods” button appeared for non-favorite destinations.
   - **Solution**: Added conditional rendering in `renderDestinations` to restrict it to favorites only.

---

## 📡 API Integration & Handling

DestNotify leverages multiple APIs for a rich experience. Here’s how I integrated and managed them:

- **Google Maps API**:
  - **Setup**: Loaded via `<script>` in `index.html` with an API key.
  - **Usage**: Displays interactive map, handles marker placement, and reverse geocoding for place names.
  - **Handling**: Cached map tiles for offline use, used `google.maps.event.addListener` for click events.
  - **Error Handling**: Fallback to static coordinates if API fails, logged in console.

- **Gemini API**:
  - **Setup**: Configured in `script.js` with async fetch requests.
  - **Usage**: Powers DestiNotiX chatbot, food, movie suggestions, and weather-based travel tips.
  - **Handling**: Parsed JSON responses, cached in LocalStorage for offline access.
  - **Error Handling**: Displayed fallback messages (e.g., “No suggestions available”) if API timed out.

- **Calendarific API**:
  - **Setup**: Fetched in `script.js` with an API key.
  - **Usage**: Provides holiday names, dates, descriptions, and travel tips.
  - **Handling**: Filtered by destination country, cached data for offline use.
  - **Error Handling**: Showed “No holidays found” if API failed.

- **GNews API**:
  - **Setup**: Configured in `script.js`.
  - **Usage**: Fetches location-specific news articles.
  - **Handling**: Parsed articles, used skeleton loaders for smooth UI.
  - **Error Handling**: Displayed cached news if API timed out.

- **OpenWeather API**:
  - **Setup**: Fetched in `script.js` with an API key.
  - **Usage**: Displays temperature, icon, and description in a gradient box.
  - **Handling**: Rounded temperature values, mapped weather codes to icons.
  - **Error Handling**: Showed cached weather data if API failed.

- **YouTube API**:
  - **Setup**: Integrated in `script.js` with an API key.
  - **Usage**: Embeds trailer links for movie suggestions.
  - **Handling**: Generated embed URLs, cached video metadata.
  - **Error Handling**: Used static links as fallback if API quota was exceeded.

- **EmailJS**:
  - **Setup**: Initialized in `index.html` with service and template IDs.
  - **Usage**: Sends confirmation emails for destination additions and arrivals.
  - **Handling**: Used dynamic parameters for user name, destination, and coordinates.
  - **Error Handling**: Logged errors to console, showed toast notifications.

---

## 🚀 Deployment & Demos

Try DestNotify today! 🌐

- **Deployed Link**: 🌍 [DestNotify Production](https://destnotify-prod.netlify.app/)
- **Demo Video**: 📹 [Watch the Demo](https://drive.google.com/file/d/10_HcPMDI9VcuMdL4cDsVXNYHlczza_af/view?usp=drivesdk)

### Version History
DestNotify evolved through iterative improvements. Add your version links here:

- **First Deployed Version**  
  - Basic alarms with Google Maps.
  - Link: 🌍 [Add Link Here]
- **Major UI/UX Enhancements**  
  - Added favorites, emails, vibrations.
  - Link: 🌍 [Add Link Here]
- **Pre-Alpha Version**  
  - Full PWA with Auto-Learn, weather, news, holidays.
  - Link: 🌍 [DestNotify Pre-Alpha](https://destnotify-prealpha.netlify.app/)
- **Production Version**  
  - Polished UI with reset button, smart caching.
  - Link: 🌍 [DestNotify Production](https://destnotify-prod.netlify.app/)

---

## 📸 Screenshots

Showcase DestNotify’s stunning UI! 📷 *(Add screenshots here, Kamal! Suggested: Home screen with map, food popup, movie popup, holiday popup, news popup, DestiNotiX, reset button, about page.)*

- **Home Screen**: [Add Image Here]
- **Food Popup**: [Add Image Here]
- **Movie Popup**: [Add Image Here]
- **Holiday Popup**: [Add Image Here]
- **News Popup**: [Add Image Here]
- **DestiNotiX Chatbot**: [Add Image Here]
- **Reset Button**: [Add Image Here]
- **About Page**: [Add Image Here]

---

 
