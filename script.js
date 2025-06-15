


let destinations = JSON.parse(localStorage.getItem("destinations")) || [];
let deferredPrompt;
if ('Notification' in window && navigator.serviceWorker) {
    Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
            console.log("⚠️ Notification permission denied.");
        }
    });
}

if ('vibrate' in navigator) {
    console.log("✅ Vibration API is supported.");
} else {
    console.log("⚠️ Vibration API NOT supported.");
}

let previewing = false;
let currentAudio = null;
let map;
let userMarker;
let workingWithFavorite = false; // Default: Works for user's live location
let weatherData = null;
let userLocationCache = {
    lat: null,
    lon: null,
    placeName: null,
    state: null,
    countryCode: null,
    lastUpdated: null
};
function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            map = new google.maps.Map(document.getElementById("map"), {
                center: userLocation,
                zoom: 14,
                mapTypeId: 'roadmap'
            });
            userMarker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });

            // Listen for map clicks to add destination

        }, (error) => {
            alert("⚠️ Please enable location access in your browser settings.");
        });
    } else {
        alert("⚠️ Geolocation is not supported by this browser.");
    }
}

let autoLearnEnabled = JSON.parse(localStorage.getItem("autoLearn")) ?? true;

function toggleAutoLearning() {
    autoLearnEnabled = !autoLearnEnabled;
    localStorage.setItem("autoLearn", JSON.stringify(autoLearnEnabled));
    updateStatus(`✅ Auto-Learn Feature  enabled`);


}


function previewAlarm() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    const selectedAlarm = document.getElementById('audioSelect').value;
    currentAudio = new Audio(selectedAlarm);
    if (previewing) {
        currentAudio.play();
    }
}

function togglePreview() {
    previewing = !previewing;
    const previewBtn = document.getElementById('previewBtn');
    if (previewing) {
        previewBtn.textContent = "Pause ";
        previewAlarm(); // Play the alarm immediately upon clicking preview button
    } else {
        previewBtn.textContent = "Play";
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
    }
}

function updateStatus(message) {
    document.getElementById('status').innerText = message;
    console.log(message);
}


// Open Features Container

function openFeaturesContainer() {
    console.log("✨ Opening features container");
    const container = document.getElementById("features-container");
    const featuresBtn = document.getElementById("features-btn");

    if (container) {
        container.classList.remove("d-none");
        console.log("✅ Features container displayed");
        featuresBtn.style.display = "none";

    } else {
        console.error("❌ Features container not found");
    }
}
// Close Features Container

function closeFeaturesContainer() {
    console.log("🔚 Closing features container");
    const container = document.getElementById("features-container");
    const featuresBtn = document.getElementById("features-btn");
    featuresBtn.style.display = "block";

    if (container) {
        container.classList.add("d-none");
        console.log("👋 Features container closed");
    } else {
        console.error("❌ Features container not found");
    }

    if (featuresBtn) {
        // Hide features button
        console.log("✨ Features button hidden");
    }
}

// Restore Features Button
function restoreFeaturesButton() {
    console.log("✨ Restoring features button");
    const featuresBtn = document.getElementById("features-btn");
    if (featuresBtn) {
        featuresBtn.style.display = "block";
        console.log("✅ Features button restored");
    } else {
        console.error("❌ Features button not found");
    }
}

document.getElementById("features-btn").addEventListener("click", openFeaturesContainer);
document.getElementById("features-close").addEventListener("click", closeFeaturesContainer);




function deleteDestination(name) {
    console.log(`🗑 Deleting destination: ${name}`);

    let destinations = JSON.parse(localStorage.getItem("destinations")) || [];

    // ✅ Filter out the destination to be deleted
    let updatedDestinations = destinations.filter(dest => dest.name !== name);

    console.log("✅ Updated destinations after deletion:", updatedDestinations);

    // ✅ Save the updated list to `localStorage`
    localStorage.setItem("destinations", JSON.stringify(updatedDestinations));

    // ✅ Re-render the UI
    renderDestinations();
}



// Updated botReply function with a friendlier tone
// Define API constants globally
const GEMINI_API_KEY = "AIzaSyAlXhVz_GHavAnut_j9YaYQa-19zxE4jx4"; // Secure this in production!
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAlXhVz_GHavAnut_j9YaYQa-19zxE4jx4`;

// Chatbot helper function
function botReply(message) {
    const chatBox = document.getElementById("chatBox");

    // ✅ Wrap bot messages in a <div> for proper alignment
    chatBox.innerHTML += `<div style="text-align: left; margin-bottom: 8px;"><strong>DestNotiXBot:</strong> ${message}</div>`;

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message
}


// Convert latitude & longitude to a location name
async function getLocationNameFromLatLon(lat, lon) {
    // Check cache first
    if (userLocationCache.lat === lat && userLocationCache.lon === lon && userLocationCache.placeName) {
        console.log("✅ Using cached place name:", userLocationCache.placeName);
        return userLocationCache.placeName;
    }

    console.log(`📍 Converting Lat: ${lat}, Lon: ${lon} to location name...`);
    const GEOCODING_API_KEY = "AIzaSyDDtuzB--uV8IFHOXn49wGz4kZ9LwOYGL0";
    const GEOCODING_API_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GEOCODING_API_KEY}`;

    try {
        const response = await fetch(GEOCODING_API_URL);
        const data = await response.json();

        if (data.status === "OK" && data.results[0]) {
            const locationName = data.results[0].address_components
                .filter(component => component.types.includes("locality") || component.types.includes("administrative_area_level_1"))
                .map(component => component.long_name)
                .join(", ") || data.results[0].formatted_address.split(",")[0].trim();

            console.log(`✅ Google Geocoding API success: ${locationName}`);
            return locationName || "Unknown Location";
        } else {
            throw new Error(`Google Geocoding failed: ${data.status}`);
        }
    } catch (error) {
        console.warn(`⚠️ Google Geocoding failed: ${error.message}. Falling back to Gemini...`);
        const prompt = `Convert latitude ${lat} and longitude ${lon} into a location name. Provide only the location name.`;
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBbINjoDygkCyj5wqVw80SoDSm2OorGtNk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            const geminiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown Location";
            console.log(`✅ Gemini fallback success: ${geminiResult}`);
            return geminiResult;
        } catch (geminiError) {
            console.error(`❌ Gemini fallback failed: ${geminiError.message}`);
            return "Unknown Location";
        }
    }
}
// Get all location names from stored destinations


// Fetch initial destination-based suggestions with flair


async function getInitialSuggestions() {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += '<div style="text-align: left;"><strong>DestNotiXBot:</strong> Hang tight, sweetie, I’m digging up some travel gems! ✨ <span class="loader"></span></div>';
    closeFeaturesContainer();
    const featuresBtn = document.getElementById("features-btn");
    featuresBtn.style.display = "none";
    console.log("Fetching saved locations...");

    let locations = await getAllLocationNames();
    // ✅ Remove duplicates & clean newlines properly
    locations = [...new Set(locations.map(loc => loc.replace(/\n/g, "").trim()))];

    // ✅ Join locations in a clean format
    let formattedLocations = locations.filter(loc => loc).join(", ");
    console.log("🚀 Unique & Cleaned Locations:", formattedLocations);

    if (formattedLocations.length > 0) {
        let prompt = `Suggest 8 nearby destinations to these: ${formattedLocations}.
    - The first three should be within 10-50 km from user's already visited destinations.
    - The next two should be within 52-100km from user's already visited destinations.
    - The next three should be within the same state.
    - Format each suggestion in this exact way: Place Name - Short fun description(without any extra symbols like quotes or colons use emojis accordingly if u want).
    - Do NOT enclose names or descriptions in quotes or any special characters.
    - Keep the descriptions 2lines each`;

        console.log("Generated prompt for API:", prompt);

        try {
            console.log("Sending request to Gemini API...");
            let response = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            console.log("Received API response status:", response.status);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            let data = await response.json();
            console.log("Parsed API response:", data);

            let suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || "No fun places found, sorry!";
            console.log("Extracted suggestion text:", suggestion);

            // Process API response into a list of suggestions
            const suggestionLines = suggestion.split("\n").map(line => line.trim()).filter(line => line);
            console.log("Processed suggestion lines:", suggestionLines);

            // ✅ Limit displayed locations to 4 & ensure proper formatting
            let disLoc = locations.slice(0, 4).join(", ");
            console.log("Displaying first 4 locations:", disLoc);

            let formattedResponse = `<div style="text-align: left;">Hey there! Since you’ve already been to cool spots like <strong>${disLoc.replace(/['"]/g, "")}</strong>, check these out:<br><br>`;

            // Add emojis and bold formatting dynamically
            const emojis = ['✨', '🔥', '🎉', '🥳', '🚀', '🤩', '✨'];

            suggestionLines.forEach((line, index) => {
                // ✅ Skip unnecessary headers like "Within 10-50 km:"
                if (line.includes("Within") || line.includes("Here are 8 nearby destinations") || line.includes("Okay")) {
                    return;
                }

                // ✅ Extract clean name and description
                const cleanLine = line.replace(/^\d+\.\s*/, "").trim(); // Remove numbering (1., 2., etc.)

                if (cleanLine) {
                    formattedResponse += `${emojis[index % emojis.length]} <strong>${cleanLine.split(" - ")[0]}</strong> - ${cleanLine.split(" - ")[1]}<br>`;
                }
            });

            formattedResponse += `<br>What’s on your mind now? I’m here for anything! 😍`;

            console.log("Final formatted response:", formattedResponse);
            document.querySelector(".loader")?.remove();

            botReply(formattedResponse);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            botReply("Yikes! Looks like the travel gods are taking a break. 😅 No worries, I’m still here for a good chat! Want to try again?");
        }
    } else {
        console.warn("No destinations found. Prompting user to add locations.");
        botReply("Hey sweetie! 🌟 No destinations yet? Add some spots, and I’ll sprinkle some travel magic! Want me to suggest a few popular places near you? 😊");
    }

    // Mark the first interaction as complete
    console.log("Marking chat as opened in localStorage.");
    localStorage.setItem("chatFirstOpened", JSON.stringify(true));

}

async function getAllLocationNames() {
    const destinations = JSON.parse(localStorage.getItem("destinations")) || [];
    const deletedDestinations = JSON.parse(localStorage.getItem("deletedDestinations")) || [];
    const allDestinations = [...new Set([...destinations, ...deletedDestinations])];

    let selectedDestinations = [];

    // ✅ Step 1: Use all current destinations if they are 6 or more
    if (destinations.length >= 6) {
        selectedDestinations = [...destinations.slice(0, 6)]; // Take first 6
    } else {
        // ✅ Step 2: Take all available destinations + recently deleted to make it up to 6
        let needed = 6 - destinations.length;
        let recentDeleted = deletedDestinations.slice(-needed); // Get the last 'needed' deleted destinations

        selectedDestinations = [...destinations, ...recentDeleted]; // Fill up to 6
    }

    // ✅ Step 3: Get remaining destinations (excluding already selected ones)
    const remainingDestinations = allDestinations.filter(dest => !selectedDestinations.includes(dest));

    // ✅ Step 4: Shuffle remaining destinations using Fisher-Yates
    for (let i = remainingDestinations.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [remainingDestinations[i], remainingDestinations[j]] = [remainingDestinations[j], remainingDestinations[i]];
    }

    // ✅ Step 5: Pick 2 random destinations from the shuffled remaining list
    const randomDestinations = remainingDestinations.slice(0, 2);

    // ✅ Step 6: Combine final selection (6 main + 2 random)
    selectedDestinations = [...selectedDestinations, ...randomDestinations];

    console.log("📍 Final Selected Destinations:", selectedDestinations);
    let locationNames = [];

    // ✅ Convert Lat/Lon to location names
    for (let dest of selectedDestinations) {
        let name = await getLocationNameFromLatLon(dest.lat, dest.lon);
        locationNames.push(name);
    }

    return locationNames;
}

// Event listeners
// ... (previous code: GEMINI_API_URL, botReply, getInitialSuggestions, etc.) ...

function formatBotResponse(text) {
    if (!text) return ""; // If text is empty, return nothing

    // ✅ Fix bold formatting (**bold** → <strong>bold</strong>)
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // ✅ Fix italic formatting (*italic* → <em>italic</em>)
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // ✅ Convert bullet points (* Item) into <li> and group into single <ul>
    let lines = text.split("\n");
    let inList = false;
    let output = [];
    let listItems = [];

    for (let line of lines) {
        if (line.trim().startsWith("* ")) {
            // Start or continue a list
            listItems.push(`<li>${line.replace(/^\* (.*)/, "$1")}</li>`);
            inList = true;
        } else {
            // End list if we were in one
            if (inList && listItems.length > 0) {
                output.push(`<ul>${listItems.join("")}</ul>`);
                listItems = [];
                inList = false;
            }
            // Add non-list line
            output.push(line);
        }
    }

    // Close any open list at the end
    if (inList && listItems.length > 0) {
        output.push(`<ul>${listItems.join("")}</ul>`);
    }

    text = output.join("\n");

    // ✅ Convert double newlines into paragraph breaks
    text = text.replace(/\n\n/g, "<br><br>");

    // ✅ Convert remaining single newlines into line breaks
    text = text.replace(/\n/g, "<br>");

    return text.trim();
}

// Event listeners
document.getElementById("openBot").addEventListener("click", function () {

    document.getElementById("chatBotContainer").classList.remove("d-none");
    const isFirstOpen = localStorage.getItem("chatFirstOpened") !== "true";
    if (isFirstOpen) {
        botReply("Hey!! Iam DestNotiXBot ✨ - by Kamal with ❤️");
        getInitialSuggestions();
    } else {
        // botReply("Hey!! What’s on your mind today? 😊");
        getInitialSuggestions();
    }
});

document.getElementById("closeBot").addEventListener("click", function () {
    alert("Okay, take a breather! 🏖️ Just call me when you need me again. 🚀💙");

    document.getElementById("chatBotContainer").classList.add("d-none");

    restoreFeaturesButton(); // Restore features button
});

document.getElementById("toggleSize2").addEventListener("click", function () {
    const chatContainer = document.getElementById("chatBotContainer");
    const toggleBtn = document.getElementById("toggleSize2");
    if (chatContainer.classList.contains("chatbot-fullscreen")) {
        chatContainer.classList.remove("chatbot-fullscreen");
        toggleBtn.textContent = "Expand";
    } else {
        chatContainer.classList.add("chatbot-fullscreen");
        toggleBtn.textContent = "Shrink";
    }
});

document.getElementById("clearChat").addEventListener("click", function () {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = ""; // Clear the chat content
    botReply("Poof! Chat’s all cleared out. What’s next, sweetie? ✨");
});

document.getElementById("sendMessage").addEventListener("click", function () {
    const userMessage = document.getElementById("userInput").value.trim();
    if (!userMessage) return;

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<p style="text-align: left;"><strong>You:</strong> ${userMessage}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    document.getElementById("userInput").value = "";

    fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userMessage }]
            }]
        })
    })
        .then(response => response.json())
        .then(data => {
            let dd = data.candidates?.[0]?.content?.parts?.[0]?.text
            console.log(dd)
            const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, I’m drawing a blank! Let’s try that again.";
            const formattedResponse = formatBotResponse(rawResponse);
            botReply(formattedResponse);

        })
        .catch(error => {
            console.error("Error fetching from Gemini API:", error);
            botReply("Yikes, something went wonky! Give me a sec and try again, okay?");
        });
});


async function getWeather(lat, lon) {
    console.log(`🌍 Fetching weather for Lat: ${lat}, Lon: ${lon}`);
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9dbb73dd734f05dfca6205ca9e85ab5d&units=metric`
        );
        const data = await response.json();

        if (response.ok) {
            console.log("🌤️ Weather Data fetched successfully:", data);
            weatherData = data; // Store globally
            updateWeatherUI(data); // Already in your code
            // Removed suggestMoviesBasedOnWeather call here to avoid auto-trigger
        } else {
            console.error("⚠️ Error fetching weather:", data.message);
        }
    } catch (error) {
        console.error("❌ Weather API request failed:", error);
    }
}


function updateWeatherUI(data) {
    const weatherContainer = document.getElementById("weatherContainer");

    // 🌦️ Extract relevant weather details
    const location = data.name || "Cloud Nine"; // 📍 City name
    const temp = Math.round(data.main.temp); // 🌡️ Temperature
    const description = data.weather[0].description; // 🌦️ Weather description
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`; // 🌤️ Dynamic icon
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6; // Nighttime check
    // ✅ Get a fun weather suggestion
    const suggestion = getWeatherSuggestion(data.weather[0].main, temp, isNight);

    // ✅ Update UI with better styling
    weatherContainer.innerHTML = `
        <div class="weather-box">
            <div class="weather-left">
                <img src="${weatherIcon}" alt="${description}" class="weather-icon">
                <div>
                    <span class="weather-temp">${temp}°C</span>
                    <span class="weather-desc">${description}</span>
                </div>
            </div>
            <div class="weather-details">
                <p>📍 <strong>${location}</strong></p>
                <p> <strong>${suggestion}</strong></p>
            </div>
        </div>
    `;
}


// State-language mapping
const stateLanguageMap = {
    "Andhra Pradesh": "Telugu",
    "Telangana": "Telugu",
    "Tamil Nadu": "Tamil",
    "Karnataka": "Kannada",
    "Kerala": "Malayalam",
    "Maharashtra": "Marathi",
    "West Bengal": "Bengali",
    "Punjab": "Punjabi",
    "Gujarat": "Gujarati",
    "Uttar Pradesh": "Hindi",
    "Rajasthan": "Hindi",
    "Madhya Pradesh": "Hindi",
    "Delhi": "Hindi",
    "Bihar": "Hindi",
    "Jharkhand": "Hindi",
    "Odisha": "Odia",
    "Assam": "Assamese",
    "Hyderabad": "Telugu",
    "Unknown": "English",
    "United States": "English",
    "South Korea": "Korean",
    "IN": "Hindi",
    "US": "English",
    "KR": "Korean"
};

// Region-based genre mapping
const regionGenreMap = {
    "Andhra Pradesh": { genre: "Action", suggestion: "🌟 No weather data, but let’s dive into some Telugu Action in Andhra Pradesh!" },
    "Telangana": { genre: "Action", suggestion: "🌟 No weather data, but let’s enjoy some Telugu Action in Telangana!" },
    "Tamil Nadu": { genre: "Thriller", suggestion: "🌟 No weather data, but Tamil Thrillers are calling in Tamil Nadu!" },
    "Karnataka": { genre: "Drama", suggestion: "🌟 No weather data, but Kannada Drama vibes await in Karnataka!" },
    "Kerala": { genre: "Romantic", suggestion: "🌟 No weather data, but Malayalam Romantic is perfect in Kerala!" },
    "Maharashtra": { genre: "Drama", suggestion: "🌟 No weather data, but Marathi Drama shines in Maharashtra!" },
    "West Bengal": { genre: "Drama", suggestion: "🌟 No weather data, but Bengali Drama awaits in West Bengal!" },
    "Punjab": { genre: "Comedy", suggestion: "🌟 No weather data, but Punjabi Comedy brings laughs in Punjab!" },
    "Gujarat": { genre: "Drama", suggestion: "🌟 No weather data, but Gujarati Drama feels right in Gujarat!" },
    "Uttar Pradesh": { genre: "Drama", suggestion: "🌟 No weather data, but Hindi Drama hits home in Uttar Pradesh!" },
    "Rajasthan": { genre: "Romantic", suggestion: "🌟 No weather data, but Hindi Romantic sparkles in Rajasthan!" },
    "Madhya Pradesh": { genre: "Thriller", suggestion: "🌟 No weather data, but Hindi Thrillers thrill in Madhya Pradesh!" },
    "Delhi": { genre: "Action", suggestion: "🌟 No weather data, but Hindi Action roars in Delhi!" },
    "Bihar": { genre: "Drama", suggestion: "🌟 No weather data, but Hindi Drama resonates in Bihar!" },
    "Jharkhand": { genre: "Drama", suggestion: "🌟 No weather data, but Hindi Drama feels right in Jharkhand!" },
    "Odisha": { genre: "Drama", suggestion: "🌟 No weather data, but Odia Drama shines in Odisha!" },
    "Assam": { genre: "Drama", suggestion: "🌟 No weather data, but Assamese Drama awaits in Assam!" },
    "Hyderabad": { genre: "Action", suggestion: "🌟 No weather data, but let’s enjoy some Telugu Action in Hyderabad!" },
    "United States": { genre: "Thriller", suggestion: "🌟 No weather data, but Hollywood Thrillers are perfect in the USA!" },
    "South Korea": { genre: "Thriller", suggestion: "🌟 No weather data, but Korean Thrillers bring the chills in South Korea!" },
    "Unknown": { genre: "Drama", suggestion: "🌟 No weather data, but let’s enjoy some English Drama!" },
    "IN": { genre: "Drama", suggestion: "🌟 No weather data, but Indian Drama vibes are perfect!" },
    "US": { genre: "Thriller", suggestion: "🌟 No weather data, but Hollywood Thrillers await!" },
    "KR": { genre: "Thriller", suggestion: "🌟 No weather data, but Korean Thrillers are calling!" }
};

// Regional content
const regionalContent = {
    "Telugu": [
        { Title: "Salaar: Part 1 – Ceasefire", Type: "Movie", Year: "2023", Genres: ["Action", "Thriller"], Snippet: "A rebel’s roar shakes the underworld—pure action masala!", Trailer: "https://www.youtube.com/watch?v=Joo_jE8kMDg" },
        { Title: "Baahubali: The Beginning", Type: "Movie", Year: "2015", Genres: ["Action", "Drama", "Epic"], Snippet: "Epic battles and royal drama—Telugu grandeur unleashed!", Trailer: "https://www.youtube.com/watch?v=sOEg_YZQsTI" },
        { Title: "Pushpa: The Rise", Type: "Movie", Year: "2021", Genres: ["Action", "Crime"], Snippet: "Smuggling and swagger—Allu Arjun’s raw energy!", Trailer: "https://www.youtube.com/watch?v=Q1NKMPhP8PY" },
        { Title: "Hi Nanna", Type: "Movie", Year: "2023", Genres: ["Romantic", "Drama"], Snippet: "Heartstrings tugged with love and tears—family feels!", Trailer: "https://youtu.be/3Ld05Om2UWs?si=7leOEoq3pimbBrZp" },
        { Title: "Panchatantram", Type: "Series", Year: "2022", Genres: ["Drama", "Anthology"], Snippet: "A weave of tales—anthology with a Telugu twist!", Trailer: "https://www.youtube.com/watch?v=IWdhJ-HdQb4" },
        { Title: "Dhootha", Type: "Series", Year: "2023", Genres: ["Thriller", "Supernatural"], Snippet: "Supernatural thrills—dark secrets unfold!", Trailer: "https://www.youtube.com/watch?v=-ITBFd_K5_M" },
        { Title: "F2: Fun and Frustration", Type: "Movie", Year: "2019", Genres: ["Comedy"], Snippet: "Hilarious family chaos—non-stop laughs!", Trailer: "https://www.youtube.com/watch?v=IWdhJ-HdQb4" }
    ],
    "Tamil": [
        { Title: "Leo", Type: "Movie", Year: "2023", Genres: ["Action", "Thriller"], Snippet: "A bloody sweet action ride—Vijay at his best!", Trailer: "https://www.youtube.com/watch?v=Po3jStA673E" },
        { Title: "Ponniyin Selvan: I", Type: "Movie", Year: "2022", Genres: ["Action", "Drama", "Historical"], Snippet: "Epic Tamil history unfolds—grand and gripping!", Trailer: "https://www.youtube.com/watch?v=D4qAQYlgZQs" },
        { Title: "Vikram", Type: "Movie", Year: "2022", Genres: ["Action", "Thriller"], Snippet: "Action-packed revenge—Kamal Haasan shines!", Trailer: "https://www.youtube.com/watch?v=OKBMCL-frPU" },
        { Title: "Navarasa", Type: "Series", Year: "2021", Genres: ["Drama", "Anthology"], Snippet: "Nine emotions, nine stories—Tamil anthology bliss!", Trailer: "https://www.youtube.com/watch?v=Go6O1wX8H-c" },
        { Title: "Kaithi", Type: "Movie", Year: "2019", Genres: ["Action", "Thriller"], Snippet: "One night of chaos—high-octane thrills!", Trailer: "https://www.youtube.com/watch?v=example" }
    ],
    "Kannada": [
        { Title: "KGF: Chapter 1", Type: "Movie", Year: "2018", Genres: ["Action", "Crime"], Snippet: "Gold mines and grit—Yash’s rise to power!", Trailer: "https://www.youtube.com/watch?v=qXgF-iJ_ezE" },
        { Title: "Kantara", Type: "Movie", Year: "2022", Genres: ["Action", "Drama", "Folklore"], Snippet: "Folklore meets fury—nature’s wild call!", Trailer: "https://www.youtube.com/watch?v=8mrVmf239GU" },
        { Title: "777 Charlie", Type: "Movie", Year: "2022", Genres: ["Drama", "Adventure"], Snippet: "A man and his dog—heartwarming journey!", Trailer: "https://www.youtube.com/watch?v=example" }
    ],
    "Malayalam": [
        { Title: "Drishyam", Type: "Movie", Year: "2013", Genres: ["Thriller", "Drama"], Snippet: "A family man’s cunning—suspense at its peak!", Trailer: "https://www.youtube.com/watch?v=FmSI1Enfc-M" },
        { Title: "Premam", Type: "Movie", Year: "2015", Genres: ["Romantic", "Comedy"], Snippet: "Love through the ages—youthful and sweet!", Trailer: "https://www.youtube.com/watch?v=pbgvTikmIMk" },
        { Title: "Minnal Murali", Type: "Movie", Year: "2021", Genres: ["Action", "Superhero"], Snippet: "Superhero vibes—Malayalam style!", Trailer: "https://www.youtube.com/watch?v=example" }
    ],
    "Hindi": [
        { Title: "Pathaan", Type: "Movie", Year: "2023", Genres: ["Action", "Thriller"], Snippet: "SRK’s spy thriller—action with Bollywood flair!", Trailer: "https://www.youtube.com/watch?v=vqu4z34wENw" },
        { Title: "Mirzapur", Type: "Series", Year: "2018", Genres: ["Crime", "Thriller"], Snippet: "Gritty crime saga—UP’s underworld unleashed!", Trailer: "https://www.youtube.com/watch?v=ZNeGF-PvRHY" },
        { Title: "Dangal", Type: "Movie", Year: "2016", Genres: ["Drama", "Sports"], Snippet: "Wrestling dreams—family and grit!", Trailer: "https://www.youtube.com/watch?v=x_7YlGv9u1g" }
    ],
    "English": [
        { Title: "Inception", Type: "Movie", Year: "2010", Genres: ["Thriller", "Sci-Fi"], Snippet: "Dreams within dreams—mind-bending thriller!", Trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0" },
        { Title: "Stranger Things", Type: "Series", Year: "2016", Genres: ["Thriller", "Supernatural"], Snippet: "80s vibes and spooky mysteries!", Trailer: "https://www.youtube.com/watch?v=b9EkMc79ZSU" },
        { Title: "The Matrix", Type: "Movie", Year: "1999", Genres: ["Action", "Sci-Fi"], Snippet: "Reality or simulation—action sci-fi classic!", Trailer: "https://www.youtube.com/watch?v=m8e-FF8MsqU" },
        { Title: "The Hangover", Type: "Movie", Year: "2009", Genres: ["Comedy"], Snippet: "Wild Vegas night—laugh-out-loud chaos!", Trailer: "https://www.youtube.com/watch?v=tcdUhdOlz9M" }
    ],
    "Korean": [
        { Title: "Parasite", Type: "Movie", Year: "2019", Genres: ["Thriller", "Drama"], Snippet: "Class divide turns wild—Korean masterpiece!", Trailer: "https://www.youtube.com/watch?v=5xH0HfJHsaY" },
        { Title: "Squid Game", Type: "Series", Year: "2021", Genres: ["Thriller", "Survival"], Snippet: "Survival games—tension and thrills!", Trailer: "https://www.youtube.com/watch?v=oqxAJKy0ii4" }
    ]
};

// Gemini API URL
const GEMINI_API_URL2 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC0Xf8q7DmL-krKqAP83Je_G6E3N9k8l6I";

userLocationCache = {};

// Cache location for service worker
async function cacheLocation() {
    const cache = await caches.open("destnotify-cache");
    await cache.put("/userLocationCache", new Response(JSON.stringify(userLocationCache)));
}

// Get user location
async function getUserLocation() {
    console.log("📍 Fetching user location...");
    if (!navigator.geolocation) {
        console.warn("⚠️ Geolocation not supported.");
        userLocationCache = { state: "Unknown", countryCode: "IN", lastUpdated: Date.now() };
        localStorage.setItem("userLocationCache", JSON.stringify(userLocationCache));
        await cacheLocation();
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: true });
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`📍 Location: Lat ${lat}, Lon ${lon}`);
        await getWeather(lat, lon);

        let state = "Unknown";
        let countryCode = "Unknown";
        let placeName = "Unknown";

        // Try Google Maps Geocoding
        const GOOGLE_API_KEY = "AIzaSyDv7AV98HrkjkRFuBcY1qlfMtHViZK-jRA"; // Replace with your key
        try {
            const response = await Promise.race([
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_API_KEY}`),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Geocoding timeout")), 5000))
            ]);
            const data = await response.json();
            if (data.status === "OK" && data.results.length) {
                for (const component of data.results[0].address_components) {
                    if (component.types.includes("administrative_area_level_1")) {
                        state = component.long_name; // e.g., Telangana
                    }
                    if (component.types.includes("country")) {
                        countryCode = component.short_name; // e.g., IN
                    }
                    if (component.types.includes("locality") || component.types.includes("sublocality")) {
                        placeName = component.long_name; // e.g., Nalgonda
                    }
                }
                if (placeName === "Unknown") {
                    placeName = data.results[0].address_components.find(c => c.types.includes("locality") || c.types.includes("sublocality") || c.types.includes("postal_town"))?.long_name || data.results[0].formatted_address.split(",")[0].trim();
                }
            } else {
                throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || "Unknown error"}`);
            }
        } catch (error) {
            console.warn("⚠️ Google Maps Geocoding failed:", error.message);
            // Fallback to Gemini
            const prompt = `Given latitude ${lat} and longitude ${lon}, provide the city name and state name if in India (e.g., Nalgonda, Telangana), or country name if outside. Return in the format: city, state or city, country.`;
            const geminiResponse = await Promise.race([
                fetch(GEMINI_API_URL2, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                }).then(res => res.json()),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), 5000))
            ]).catch(err => {
                console.warn(`⚠️ Gemini API failed: ${err.message}`);
                return null;
            });

            let locationGuess = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Unknown, Unknown";
            const [city, region] = locationGuess.split(",").map(s => s.trim());
            if (region.toLowerCase().includes("telangana") || city.toLowerCase().includes("nalgonda") || city.toLowerCase().includes("hyderabad")) {
                state = "Telangana";
                countryCode = "IN";
                placeName = city && city !== "Unknown" ? city : "Nalgonda"; // Default to Nalgonda if city is unclear
            } else if (["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Kerala", "Maharashtra", "West Bengal", "Punjab", "Gujarat", "Uttar Pradesh", "Rajasthan", "Madhya Pradesh", "Delhi", "Bihar", "Jharkhand", "Odisha", "Assam"].includes(region)) {
                state = region;
                countryCode = "IN";
                placeName = city && city !== "Unknown" ? city : region;
            } else {
                state = null;
                countryCode = region === "United States" ? "US" : region === "South Korea" ? "KR" : "IN";
                placeName = city && city !== "Unknown" ? city : region;
            }
        }

        userLocationCache = { lat, lon, placeName, state, countryCode, lastUpdated: Date.now() };
        localStorage.setItem("userLocationCache", JSON.stringify(userLocationCache));
        await cacheLocation();
        console.log(`🌍 Detected: ${state || countryCode}`, userLocationCache);
    } catch (error) {
        console.error("❌ Geolocation error:", error.message);
        userLocationCache = { state: "Unknown", countryCode: "IN", lastUpdated: Date.now() };
        localStorage.setItem("userLocationCache", JSON.stringify(userLocationCache));
        await cacheLocation();
    }
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    localStorage.removeItem("userLocationCache"); // Clear cache to force fresh fetch
    await getUserLocation();
    console.log("✅ Loaded location:", userLocationCache);
});
let genre = "Drama";
// Suggest movies
async function suggestMoviesBasedOnWeather(weatherData) {
    console.log("🎬 Suggesting movies based on weather...");
    closeFeaturesContainer();
    document.getElementById("features-btn").style.display = "none";
    const popup = document.getElementById("moviePopup");
    if (!popup) {
        console.error("❌ Movie popup not found!");
        return;
    }


    let suggestion = "🎥 Time to enjoy a movie!";
    if (weatherData) {
        const condition = weatherData.weather[0].main;
        const temp = weatherData.main.temp;
        const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
        genre = condition.includes("Rain") ? "Drama" : condition.includes("Clear") ? "Comedy" : "Thriller";
        suggestion = getWeatherSuggestion(condition, temp, isNight, genre);
    } else {
        const region = userLocationCache.state || userLocationCache.countryCode || "Unknown";
        const regionData = regionGenreMap[region] || regionGenreMap["Unknown"];
        genre = regionData.genre;
        suggestion = regionData.suggestion;
        console.warn("⚠️ No weather data, using region-based genre:", genre, "for region:", region);
    }

    await fetchMovieRecommendations(genre, suggestion);
}



// Fetch movie recommendations
async function fetchMovieRecommendations(genre, movieSuggestion, useDefault = false) {
    console.log(`🎥 Fetching movies for genre: ${genre}, Default: ${useDefault}`);
    const popup = document.getElementById("moviePopup");
    const content = document.getElementById("movie-content");

    if (!popup || !content) {
        console.error("❌ Movie popup elements missing!");
        alert("Error: Movie popup not available!");
        return;
    }

    content.innerHTML = '<p><span class="loader"></span> ⏳ Fetching movies...</p>';
    popup.classList.remove("d-none");

    if (useDefault) {
        console.log("🎬 Using default Telugu list");
        showMoviePopup(regionalContent["Telugu"].slice(0, 5), movieSuggestion);
        return;
    }

    try {
        let locationGuess = userLocationCache.state || userLocationCache.countryCode || "Unknown";
        let language = stateLanguageMap[locationGuess] || {
            "United States": "English",
            "South Korea": "Korean",
            "Unknown": "English"
        }[locationGuess] || "English";
        console.log(`🗣️ Language: ${language}`);

        const contentList = regionalContent[language] || regionalContent["English"];
        const genreLower = genre.toLowerCase();
        let recommendations = contentList.filter(item =>
            item.Genres.some(g => g.toLowerCase() === genreLower)
        );

        if (!recommendations.length) {
            console.log(`⚠️ No ${genre} in ${language}, using all content`);
            recommendations = contentList;
        }

        recommendations = await Promise.all(
            recommendations.slice(0, 5).map(async (movie) => {
                const trailer = await getTrailerLink(movie.Title);
                return { ...movie, Trailer: trailer || movie.Trailer || "#" };
            })
        );

        const localizedSuggestion = `${movieSuggestion} In ${locationGuess}, enjoy ${language} ${genre} vibes!`;
        console.log(`🎬 Showing ${recommendations.length} recommendations`);
        showMoviePopup(recommendations, localizedSuggestion);
    } catch (error) {
        console.error("❌ Fetch error:", error.message);
        content.innerHTML = `<p>Oops, couldn’t fetch ${genre} movies!</p>`;
        showMoviePopup(regionalContent["Telugu"].slice(0, 5), "Fallback: Telugu hits!");
    }
}

// Show movie popup
async function showMoviePopup(movies, movieSuggestion) {
    console.log("🎬 Displaying movie suggestions in popup");
    const popup = document.getElementById("moviePopup");
    const content = document.getElementById("movie-content");
    if (!popup || !content) {
        console.error("❌ Movie popup elements missing!");
        return;
    }

    closeFeaturesContainer();
    document.getElementById("features-btn").style.display = "none";
    const foodBtn = document.getElementById("floating-food-btn");
    const chatbotBtn = document.getElementById("openBot");
    if (foodBtn) foodBtn.style.display = "none";
    if (chatbotBtn) chatbotBtn.style.display = "none";

    const genreFromSuggestion = movieSuggestion.match(/Drama|Comedy|Thriller|Action|Romantic/i)?.[0]?.toLowerCase();
    const noGenreMessage = movies.length && genreFromSuggestion && !movies.some(m => m.Genres.some(g => g.toLowerCase() === genreFromSuggestion))
        ? `<p>😿 No ${genreFromSuggestion} movies found, but here are some ${movies[0].Type}s!</p>`
        : movies.length === 0
            ? `<p>😿 No movies available right now!</p>`
            : "";

    content.innerHTML = `
        <div class="movie-suggestion-message">
            ${movieSuggestion}
            ${noGenreMessage}
        </div>
        <div class="movie-list">
            ${movies.length ? movies.map((movie, index) => `
                <div class="movie-card" style="animation: slideIn 0.5s ease-out ${index * 0.1}s forwards; opacity: 0;">
                    <div class="movie-info">
                        <h6 class="movie-title">${movie.Type}: ${movie.Title} <span class="movie-year">(${movie.Year})</span></h6>
                        <p class="movie-snippet">${movie.Snippet}</p>
                        <a href="${movie.Trailer || '#'}" target="_blank" class="movie-trailer-link">
                            ${movie.Trailer && movie.Trailer !== '#' ? 'Watch Trailer ▶️' : 'No Trailer Available'}
                        </a>
                    </div>
                </div>
            `).join("") : ""}
        </div>
    `;
    popup.classList.remove("d-none");
    console.log("✅ Movie popup styled and displayed");
}

// Get trailer link
async function getTrailerLink(movieTitle) {
    try {
        const response = await fetch(`http://localhost:3000/api/youtube-trailer?q=${encodeURIComponent(movieTitle + " official trailer")}`, { signal: AbortSignal.timeout(5000) });
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
        }
        console.warn(`⚠️ No trailer found for ${movieTitle} via API`);
        return null;
    } catch (error) {
        console.error("❌ Error fetching trailer:", error.message);
        return null;
    }
}
function getGenreFromWeather(condition, temp) {
    console.log(`🎬 Mapping weather to genre: ${condition}, Temp: ${temp}°C`);
    condition = condition.toLowerCase();
    if (condition.includes("rain") || condition.includes("drizzle")) {
        return "Drama";
    } else if (condition.includes("clear")) {
        return "Comedy";
    } else if (condition.includes("thunderstorm") || condition.includes("snow")) {
        return "Thriller";
    } else if (condition.includes("clouds") || condition.includes("cloudy")) {
        return "Romantic";
    } else if (condition.includes("mist") || condition.includes("fog")) {
        return "Mystery";
    } else if (temp >= 35) {
        return "Action";
    } else if (temp <= 10) {
        return "Drama";
    } else {
        return "Adventure";
    }
}
// Weather suggestion
function getWeatherSuggestion(weatherCondition, temp, isNight, genre = "") {
    genre = getGenreFromWeather(weatherCondition, temp);
    console.log(`🌦️ Generating movie suggestion for Weather: ${weatherCondition}, Temp: ${temp}°C, Night: ${isNight}, Genre: ${genre}`);
    if (weatherCondition.includes("Rain")) {
        return isNight
            ? `🌧️ Rainy night—perfect for a ${genre} movie with a warm drink! ☕`
            : `🌧️ Rainy day—cozy up with a ${genre} movie and enjoy the vibes!`;
    } else if (weatherCondition.includes("Clear")) {
        if (isNight) {
            return temp < 20
                ? `✨ Clear and cool—watch a ${genre} movie under the stars! 🌙`
                : `✨ Clear skies—enjoy a ${genre} movie with a night breeze! 🔭`;
        } else {
            return temp < 28
                ? `☀️ Clear and pleasant—great for a ${genre} movie indoors or out! 🏕️`
                : `☀️ Sunny day—chill with a ${genre} movie and stay cool!`;
        }
    } else if (weatherCondition.includes("Clouds")) {
        return isNight
            ? `☁️ Cloudy night—ideal for a ${genre} movie and a coffee! ☕`
            : `☁️ Cloudy skies—settle in for a ${genre} movie day!`;
    } else if (weatherCondition.includes("Snow")) {
        return isNight
            ? `❄️ Snowy night—stay warm with a ${genre} movie! 🎥`
            : `❄️ Snowy day—perfect for a ${genre} movie indoors! ⛄`;
    } else if (weatherCondition.includes("Thunderstorm")) {
        return isNight
            ? `⛈️ Stormy night—best for a thrilling ${genre} movie indoors! 🏡`
            : `⛈️ Stormy weather—watch a ${genre} movie and stay safe!`;
    } else if (weatherCondition.includes("Drizzle")) {
        return isNight
            ? `🌦️ Light drizzle—relax with a ${genre} movie and the rain sounds! 🎶`
            : `🌦️ Light drizzle—enjoy a ${genre} movie with a cozy vibe!`;
    } else if (weatherCondition.includes("Mist") || weatherCondition.includes("Fog")) {
        return isNight
            ? `🌫️ Foggy night—perfect for a mysterious ${genre} movie! 🚗💨`
            : `🌫️ Foggy day—get lost in a ${genre} movie!`;
    } else if (temp >= 35) {
        return isNight
            ? `🌆 Warm night—cool off with a ${genre} movie and ice cream! 🍦`
            : `🔥 Super hot—stay in with a ${genre} movie and AC!`;
    } else if (temp <= 10) {
        return isNight
            ? `🥶 Chilly night—warm up with a ${genre} movie!`
            : `🥶 Cold day—cozy up with a ${genre} movie!`;
    } else {
        return isNight
            ? `🌙 Peaceful night—unwind with a ${genre} movie!`
            : `🌍 Any weather’s good for a ${genre} movie day!`;
    }
}

// Close popup
function closeMoviePopup() {
    console.log("🔚 Closing movie popup...");
    const popup = document.getElementById("moviePopup");
    const foodBtn = document.getElementById("floating-food-btn");
    const chatbotBtn = document.getElementById("openBot");

    if (popup) {
        popup.classList.add("d-none");
        console.log("👋 Popup closed successfully");
        restoreFeaturesButton();
    } else {
        console.error("❌ Popup not found when trying to close!");
    }

    if (foodBtn) {
        foodBtn.style.display = "block";
        console.log("🍽️ Restored floating food button");
    }
    if (chatbotBtn) {
        chatbotBtn.style.display = "block";
        console.log("🤖 Restored DestNotiX chatbot button");
    }

    workingWithFavorite = false;
}








async function suggestNewsNearMe() {
    console.log("📰 Starting news fetch...");
    const popup = document.getElementById("newsPopup");
    const content = document.getElementById("news-content");
    content.innerHTML = '<p><span class="loader"></span> <span class="pulse-text">⏳ Fetching news...</span></p>';
    popup.classList.remove("d-none");
    closeFeaturesContainer();
    document.getElementById("features-btn").style.display = "none";

    try {
        if (!userLocationCache.lat || !userLocationCache.lon) {
            throw new Error("No location data available");
        }
        let placeName = userLocationCache.placeName;
        let newsItems = await fetchNews(placeName);

        if (!newsItems) {
            console.log(`📰 No news for ${placeName}, trying broader region...`);
            placeName = userLocationCache.state; // Fallback to state
            newsItems = await fetchNews(placeName);
        }

        content.innerHTML = newsItems
            ? `<div style="text-align: left;">Top stories around your area!</div>${newsItems}`
            : "<p>No news found, even in the broader region!</p>";

        localStorage.setItem(`newsCache_${placeName}`, content.innerHTML);
    } catch (error) {
        console.error("❌ News fetch error:", error);
        content.innerHTML = "<p>Oops, couldn’t fetch news! Try again later.</p>";
    }
}


async function fetchNews(location) {
    const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(location)}&lang=en&country=in&max=6&token=f986ad724ad5c526bcd0dd2a66b203d5`);
    const data = await response.json();

    console.log("API Response:", data); // Debugging log to check API response

    if (data.totalArticles > 0 && Array.isArray(data.articles)) {
        return data.articles.slice(0, 5).map(article => {
            console.log("Processing article:", article); // Log each article being processed

            return `
        <br>
        <div style="
            border: 1px solid #ddd; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 15px auto; 
            background: #fff; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
            transition: transform 0.3s ease-in-out; 
            max-width: 600px; 
            text-align: left;"> 

            <h6 style="margin: 0; color: #222; font-size: 1.3rem; font-weight: bold;">
                ${article.title}
            </h6>

            <p style="margin: 8px 0 10px; font-size: 1rem; color: #555; line-height: 1.5;">
                ${article.description || "No description available."}
            </p>

            <a href="${article.url}" target="_blank" 
               style="
                display: inline-block; 
                background: #007bff; 
                color: #fff; 
                padding: 8px 12px; 
                border-radius: 5px; 
                text-decoration: none; 
                font-size: 1rem; 
                font-weight: bold;">
                Read more
            </a>
        </div>`;
        }).join(""); // Joins all generated HTML blocks into a single string
    }

    console.log("No articles found or API error."); // Log if no articles found
    return "";
}


async function getBroaderLocation(lat, lon) {
    // Use Gemini API or a simpler reverse geocoding approach to get state/city
    const prompt = `Given latitude ${lat} and longitude ${lon}, provide the state or nearest major city. Return only the name.`;
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAeaVU8RUgxd7bgmGRyqHK3HhsR_95eSVo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown Region";
    } catch (error) {
        console.error("❌ Error fetching broader location:", error);
        return "Unknown Region";
    }
}

function closeNewsPopup() {
    const popup = document.getElementById("newsPopup");
    popup.classList.add("d-none");
    restoreFeaturesButton();
}



// Default holidays to display while fetching
const defaultHolidays = [
    {
        name: "New Year's Day",
        date: { iso: "2025-01-01T00:00:00Z" },
        description: "Celebrate the start of a new year with joy and resolutions!",
        tip: "Plan a cozy gathering with friends and family!"
    },
    {
        name: "Spring Festival",
        date: { iso: "2025-03-20T00:00:00Z" },
        description: "Welcome spring with vibrant celebrations!",
        tip: "Enjoy outdoor activities and embrace the season!"
    },
    {
        name: "Independence Day",
        date: { iso: "2025-07-04T00:00:00Z" },
        description: "A day to honor freedom and unity!",
        tip: "Watch fireworks and enjoy a festive barbecue!"
    }
];

// Helper function to render holidays
function renderHolidays(holidays) {
    return holidays.map((holiday, index) => `
        <div class="holiday-card" style="animation-delay: ${index * 0.1}s;">
            <h6>${holiday.name}</h6>
            <p class="holiday-date">📅 ${new Date(holiday.date.iso).toLocaleDateString()}</p>
            <p class="holiday-desc">${holiday.description || "A day to celebrate!"}</p>
            <p class="holiday-tip">💡 ${holiday.tip || getHolidayTip(holiday.name)}</p>
        </div>
    `).join("");
}


async function showHolidays() {
    console.log("🎉 Starting holidays fetch...");
    const popup = document.getElementById("holidaysPopup");
    const content = document.getElementById("holidays-content");

    content.innerHTML = `
        <div class="holidays-intro">
            Your next break is closer than you think! Check out these upcoming holidays! 🎉
        </div>
        <div class="holidays-list" id="holidays-list">
            ${renderHolidays(defaultHolidays)}
        </div>
    `;
    popup.classList.remove("d-none");
    closeFeaturesContainer();
    document.getElementById("features-btn").style.display = "none";

    try {
        let placeName = userLocationCache.placeName;
        let countryCode = userLocationCache.countryCode;

        if (!countryCode || countryCode === "None") {
            console.warn(`⚠️ Invalid country code (${countryCode}), falling back to 'US'`);
            countryCode = "US";
        }

        content.innerHTML = `
            <div class="holidays-intro">
                Your next break is closer than you think! Check out these upcoming holidays! 🎉
            </div>
            <div class="holidays-list" id="holidays-list">
                <p><span class="loader"></span> <span class="pulse-text">⏳ Fetching holidays...</span></p>
                ${renderHolidays(defaultHolidays)}
            </div>
        `;

        let holidayItems = await fetchHolidays(countryCode, placeName);
        if (!holidayItems) {
            console.log(`🎉 No specific holidays for ${placeName}, fetching for country...`);
            holidayItems = await fetchHolidays(countryCode);
        }

        content.innerHTML = `
            <div class="holidays-intro">
                Your next break is closer than you think! Check out these upcoming holidays! 🎉
            </div>
            <div class="holidays-list" id="holidays-list">
                ${holidayItems || "<p class='no-holidays'>No holidays found for this year! 😔</p>"}
            </div>
        `;
        localStorage.setItem(`holidaysCache_${placeName}`, content.innerHTML);
    } catch (error) {
        console.error("❌ Holidays fetch error:", error);
        content.innerHTML = `
            <div class="holidays-intro">
                Your next break is closer than you think! Check out these upcoming holidays! 🎉
            </div>
            <div class="holidays-list" id="holidays-list">
                <p class="no-holidays">Oops, couldn’t fetch holidays! Try again later. 😿</p>
            </div>
        `;
    }
}



async function fetchHolidays(countryCode, placeName = null) {
    const year = new Date().getFullYear();
    const url = placeName
        ? `https://calendarific.com/api/v2/holidays?api_key=qr7L2kj71Ieaos9s1i0K99l8V1xqdfXl&country=${countryCode}&year=${year}&location=${placeName.split(',')[0]}`
        : `https://calendarific.com/api/v2/holidays?api_key=qr7L2kj71Ieaos9s1i0K99l8V1xqdfXl&country=${countryCode}&year=${year}`;

    try {
        const response = await fetch(url);
        console.log(`🌐 API Response Status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(`🌐 API Response Data:`, data);

        if (data.response && data.response.holidays && data.response.holidays.length > 0) {
            let holidays = data.response.holidays
                .filter(h => new Date(h.date.iso) > new Date())
                .sort((a, b) => new Date(a.date.iso) - new Date(b.date.iso))
                .slice(0, 5);

            if (holidays.length === 0) {
                console.log(`⚠️ No upcoming holidays, showing recent ones...`);
                holidays = data.response.holidays
                    .sort((a, b) => new Date(b.date.iso) - new Date(a.date.iso))
                    .slice(0, 5);
            }

            if (holidays.length > 0) {
                return renderHolidays(holidays);
            }
        }
        return "";
    } catch (error) {
        console.error(`❌ Fetch error in fetchHolidays:`, error);
        throw error;
    }
}

async function getCountryCode(lat, lon) {
    const prompt = `Given latitude ${lat} and longitude ${lon}, provide the ISO 3166-1 alpha-2 country code (e.g., "IN" for India). Return only the code.`;
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC0Xf8q7DmL-krKqAP83Je_G6E3N9k8l6I", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "IN"; // Default to India if fails
    } catch (error) {
        console.error("❌ Error fetching country code:", error);
        return "IN"; // Fallback
    }
}

function getHolidayTip(holidayName) {
    const name = holidayName.toLowerCase();

    // Indian Holidays
    if (name.includes("holi")) return "Get ready for colors and chaos—pack a spare shirt! 🎨";
    if (name.includes("diwali") || name.includes("deepavali")) return "Lights, sweets, and fireworks—book travel early! 🪔";
    if (name.includes("independence")) return "Parades and flags everywhere—expect busy roads! 🇮🇳";
    if (name.includes("republic")) return "Celebrate with pride—watch for traffic near events! 🇮🇳";
    if (name.includes("ganesh") || name.includes("ganpati")) return "Modaks and music—plan for festive detours! 🐘";
    if (name.includes("dussehra") || name.includes("dasara")) return "Victory vibes—check out local fairs! ⚔️";
    if (name.includes("raksha") || name.includes("rakhi")) return "Family time—roads might be calm, enjoy! 🎁";
    if (name.includes("eid")) return "Feasts and prayers—dress up and explore! 🌙";
    if (name.includes("christmas")) return "Jingle all the way—cozy up or hit the markets! 🎄";
    if (name.includes("pongal") || name.includes("sankranti")) return "Kites and kolams—perfect for a sunny outing! 🪁";
    if (name.includes("onam")) return "Flower carpets and feasts—join the festivities! 🌸";
    if (name.includes("ugadi") || name.includes("gudi padwa")) return "New year, new plans—start fresh! 🌟";

    // Generic/Global Holidays
    if (name.includes("new year")) return "Fireworks and resolutions—party or plan ahead! 🎇";
    if (name.includes("labor") || name.includes("labour") || name.includes("may day")) return "A day off—relax or take a short trip! 🛠️";
    if (name.includes("thanksgiving")) return "Food coma incoming—save room for dessert! 🦃";
    if (name.includes("halloween")) return "Spooky vibes—trick-or-treat on the go! 🎃";
    if (name.includes("valentine")) return "Love’s in the air—plan a sweet getaway! 💕";
    if (name.includes("easter")) return "Egg hunts and spring vibes—enjoy the outdoors! 🐣";

    // Smart Fallbacks based on keywords
    if (name.includes("festival") || name.includes("fest")) return "Crowds and cheer—check local events! 🎉";
    if (name.includes("national")) return "Patriotic spirit—roads might be packed! 🏳️";
    if (name.includes("religious") || name.includes("holy")) return "Sacred moments—respect local customs! 🙏";
    if (name.includes("bank")) return "Shops might close—plan your errands! 💸";

    // Default Catch-All
    const randomTips = [
        "A great day to explore or chill—your call! 🌟",
        "Holiday mode on—make the most of it! 😎",
        "Time to unwind or adventure—enjoy! 🚀",
        "Celebrate or relax—happy holiday! 🎈"
    ];
    return randomTips[Math.floor(Math.random() * randomTips.length)];
}


function closeHolidaysPopup() {
    const popup = document.getElementById("holidaysPopup");
    popup.classList.add("d-none");
    restoreFeaturesButton();
}



let alarms = [];

function toggleAlarm(index) {
    const alarmSelect = document.getElementById(`audioSelect-${index}`);
    const selectedAlarm = alarmSelect.value;
    const playPauseBtn = document.querySelector(`#audioSelect-${index}`).nextElementSibling;

    if (alarms[index]) {
        alarms[index].pause();
        alarms[index].currentTime = 0;
        alarms[index] = null;
        playPauseBtn.textContent = "Play";
    } else {
        let alarm = new Audio(selectedAlarm);
        alarms[index] = alarm;
        alarm.play().then(() => {
            console.log("🎶 Alarm is playing!");
            playPauseBtn.textContent = "Pause";
        }).catch((err) => {
            console.log("🔇 Auto-play blocked:", err);
            alert("🔊 Click anywhere to enable alarm playback!");
            document.body.addEventListener("click", () => {
                alarm.play().then(() => console.log("🎶 Alarm played after user click!"));
            }, { once: true });
        });
    }
}


function changeAlarm(index) {
    if (alarms[index]) {
        alarms[index].pause();
        alarms[index].currentTime = 0;
    }
    toggleAlarm(index);
}

// ✅ Initialize EmailJS
(function () {
    emailjs.init("0jU8-GLncwXyPHu3l"); // Replace with your EmailJS Public Key
})();

// ✅ Function to Send Email When Destination is Reached


function toggleFavorite(name) {
    console.log(`⭐ Toggling favorite for: ${name}`);

    let destinations = JSON.parse(localStorage.getItem("destinations")) || [];

    // ✅ Find the correct destination
    let dest = destinations.find(dest => dest.name === name);

    if (!dest) {
        console.error(`❌ Destination not found: ${name}`);
        return;
    }

    // ✅ Toggle favorite status
    dest.favorite = !dest.favorite;
    console.log(`🎯 New favorite status for ${name}: ${dest.favorite}`);

    // ✅ Save updated list to `localStorage`
    localStorage.setItem("destinations", JSON.stringify(destinations));

    // ✅ Check if any favorites are left
    let anyFavoritesLeft = destinations.some(dest => dest.favorite);
    console.log("🧐 Any favorites left?", anyFavoritesLeft);

    // ✅ If no favorites left, clear extra data
    if (!anyFavoritesLeft) {
        console.log("🔥 All favorites removed!");
        localStorage.removeItem("favoriteFoodLocations");
    }

    // ✅ Re-render the UI
    renderDestinations();
}




function playAlarm(soundFile) {
    let alarm = new Audio(soundFile);
    alarm.play().then(() => {
        console.log("🎶 Alarm is playing!");
        if ('vibrate' in navigator) {
            console.log("📳 Vibrating phone...");
            // Repeat pattern 3 times for emphasis
            navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
        }
    }).catch((err) => {
        console.log("🔇 Auto-play blocked:", err);
        alert("🔊 Click anywhere to enable alarm playback!");
        document.body.addEventListener("click", () => {
            alarm.play().then(() => {
                if ('vibrate' in navigator) {
                    navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
                }
            });
        }, { once: true });
    });
}

async function getWeatherForDestination(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9dbb73dd734f05dfca6205ca9e85ab5d&units=metric`);
        const data = await response.json();
        if (response.ok) {
            return {
                temp: Math.round(data.main.temp),
                weather: data.weather[0].description,
                icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`
            };
        } else {
            return { temp: "N/A", weather: "Weather unavailable", icon: "" };
        }
    } catch (error) {
        return { temp: "N/A", weather: "Weather unavailable", icon: "" };
    }
}

//tip1
function getTravelTip(weatherCondition, temp, isNight) {
    if (weatherCondition.includes("rain")) {
        return isNight
            ? "🌧️ Rainy night—stay cozy indoors with a warm drink!"
            : "🌧️ Expect rain—carry an umbrella & wear waterproof shoes!";
    }
    else if (weatherCondition.includes("clear")) {
        if (isNight) {
            return temp < 20
                ? "✨ Clear and cool—perfect for a peaceful night walk! 🌙"
                : "✨ Clear skies—stargazing could be amazing tonight! 🔭";
        } else {
            return temp < 28
                ? "☀️ Clear and pleasant—great for outdoor adventures! 🏕️"
                : "☀️ Sunny and warm—stay hydrated and wear sunscreen! 🧴";
        }
    }
    else if (weatherCondition.includes("clouds")) {
        return isNight
            ? "☁️ Cloudy night—grab a coffee and enjoy the chill vibes!"
            : "☁️ Cloudy—perfect for exploring without the heat!";
    }
    else if (weatherCondition.includes("snow")) {
        return isNight
            ? "❄️ Snowy night—stay warm and drive safely on icy roads!"
            : "❄️ Snowy day—bundle up and enjoy the winter wonderland!";
    }
    else if (weatherCondition.includes("thunderstorm")) {
        return isNight
            ? "⛈️ Stormy night—better to stay inside and enjoy a movie! 🎥"
            : "⛈️ Stormy weather—stay indoors and keep an eye on updates!";
    }
    else if (weatherCondition.includes("drizzle")) {
        return isNight
            ? "🌦️ Light drizzle—perfect for a cozy night indoors!"
            : "🌦️ Light drizzle—bring a jacket just in case!";
    }
    else if (weatherCondition.includes("fog") || weatherCondition.includes("mist")) {
        return isNight
            ? "🌫️ Foggy night—be extra careful if you're driving! 🚗💨"
            : "🌫️ Foggy morning—drive carefully & use headlights!";
    }
    else if (temp >= 30) {
        return isNight
            ? "🌆 Warm night—enjoy a late-night ice cream or a breezy walk! 🍦"
            : "🔥 It's hot outside—wear light clothes and drink plenty of water!";
    }
    else if (temp <= 15) {
        return isNight
            ? "🥶 Chilly night—layer up if you're heading out!"
            : "🥶 Cool day—wear a jacket to stay comfortable!";
    }
    else {
        return "🌍 Enjoy your destination and have a great trip!";
    }
}


const GEMINI_API_KEY2 = "AIzaSyBbINjoDygkCyj5wqVw80SoDSm2OorGtNk"; // Replace with your API key

async function showFamousFood(placeName) {
    const headings = [
        "Feast Your Eyes! 🍴✨",
        "Savor the Stars! 🌟🍽️",
        "Taste the Magic! 🪄😋",
        "Bite into Bliss! 🍔💖",
        "Culinary Delights Await! 🍲🎉",
        "Foodie Heaven Unleashed! 🥐🌈",
        "A Flavor Fiesta! 🎊🍕",
        "Dish Up Some Joy! 🥗😊"
    ];
    document.getElementById("food-title").innerHTML = headings[Math.floor(Math.random() * headings.length)];
    const popup = document.getElementById("foodPopup");
    closeFeaturesContainer();
    const featuresBtn = document.getElementById("features-btn");
    featuresBtn.style.display = "none";
    popup.classList.remove("d-none");
    document.getElementById("floating-food-btn").style.display = "none";
    document.getElementById("food-content").innerHTML = '<p><span class="loader"></span> <span class="pulse-text">⏳ Cooking up some food ideas...</span></p>';

    try {
        const foodSuggestions = await getFamousFood(placeName);
        document.getElementById("food-content").innerHTML = foodSuggestions;
        localStorage.setItem(`foodCache_${placeName}`, foodSuggestions);
    } catch (error) {
        const cachedFood = localStorage.getItem(`foodCache_${placeName}`);
        if (cachedFood) {
            document.getElementById("food-content").innerHTML = `${cachedFood}<p style="color: #888; font-style: italic;">(Cached—internet’s playing hide and seek! 🌐)</p>`;
        } else {
            document.getElementById("food-content").innerHTML = `<p>Oops, the chef’s out of ideas! 😿 <button class="btn btn-sm btn-warning" onclick="suggestFoodNearMe()">Retry</button></p>`;
        }
    }
}


function parseFoodSuggestions(rawText, placeName) {
    console.log("📜 Raw text to parse:", rawText);
    const lines = rawText.split("\n").filter(line => line.trim() !== "");
    let html = "<div>";
    let currentDish = "";
    let descriptionLines = [];
    let startedList = false;

    lines.forEach((line, index) => {
        // Detect the start of the food list
        if (!startedList && line.match(/^\d+\.\s*\*\*/)) {
            startedList = true;
        }
        if (!startedList) return; // Skip preamble text

        // Match dish line with name, optional emojis, and description
        const dishMatch = line.match(/^\d+\.\s*\*\*(.+?):\*\*\s*(\([🍕🍔🍟🥟🍜🍣🥗🍲🥘🍛🌮🥙🍗🍖🥚🥐🍞🥖🥞🧀🍝🍠🥔🍆🥕🌽🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🥝🍅🍇🌶️🥓🥩🍤🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🥛🍼☕🍵🍶🍾🍷🍸🍹🍺🍻🥂🥃🫓]+\))?\s*(.*)?/i);
        if (dishMatch) {
            // If we have a previous dish, finalize it
            if (currentDish && descriptionLines.length) {
                const emojis = descriptionLines[0].emojis || ""; // Use provided emojis or empty string
                const description = descriptionLines.map(d => d.text).join(" ").trim();
                html += `
                    <div class="food-item" style="animation: fadeIn 0.5s ease forwards; animation-delay: ${index * 0.1}s;">
                        <h5>${currentDish} ${emojis}</h5>
                        <p>${description || "A local favorite!"}</p>
                    </div>
                `;
            }
            // Start new dish
            currentDish = dishMatch[1].trim();
            const emojis = dishMatch[2] || ""; // Capture emojis or empty string
            const initialDescription = dishMatch[3] ? dishMatch[3].trim() : "";
            descriptionLines = [{ emojis, text: initialDescription }];
        } else if (currentDish && line.trim() && !line.match(/^\d+\./)) {
            // Append continuation lines to the current dish's description
            descriptionLines.push({ emojis: "", text: line.trim() });
        }
    });

    // Finalize the last dish
    if (currentDish && descriptionLines.length) {
        const emojis = descriptionLines[0].emojis || "";
        const description = descriptionLines.map(d => d.text).join(" ").trim();
        html += `
            <div class="food-item" style="animation: fadeIn 0.5s ease forwards; animation-delay: ${lines.length * 0.1}s;">
                <h5>${currentDish} ${emojis}</h5>
                <p>${description || "A local favorite!"}</p>
            </div>
        `;
    }

    html += `<p style="font-style: italic; color: #ff9a8b; margin-top: 20px;">Ready for a foodie adventure  ? Pick your fave! 😋</p>`;
    html += "</div>";
    console.log("📝 Final parsed HTML:", html);
    return html.length > 15 ? html : "<p>No tasty details available yet!</p>";
}


function closeFoodPopup() {
    console.log("🔚 Closing food popup...");
    const popup = document.getElementById("foodPopup");
    const foodBtn = document.getElementById("floating-food-btn");

    if (popup) {
        popup.classList.add("d-none");
        console.log("👋 Popup closed successfully");
        restoreFeaturesButton(); // Restore features button

    } else {
        console.error("❌ Popup not found when trying to close!");
    }

    // Restore the floating food button after closing the popup
    if (foodBtn) {
        foodBtn.style.display = "block"; // ✅ Make sure it reappears
    }
    restoreFeaturesButton();
    // Reset favorite mode if applicable
    workingWithFavorite = false;
}





async function getFamousFood(placeName) {
    console.log(`🍽️ Starting getFamousFood for: ${placeName}`);

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API took too long")), 10000) // 10s timeout
    );
    let prompt = `What are the top 5 famous foods in ${placeName}? 
Give short descriptions too with emojis.

If you don’t know, provide:
1. Top 5 famous foods in the nearest known city to ${placeName}.
2. If no nearby city is known, give the top 5 famous foods of ${placeName}'s state.
3. If you don’t know the state, provide the top 5 famous foods of ${placeName}'s country.
4. If you don’t know the country, provide top 5 famous foods globally.

`;
    try {
        const responsePromise = fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBbINjoDygkCyj5wqVw80SoDSm2OorGtNk",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );

        const response = await Promise.race([responsePromise, timeoutPromise]);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        let data = await response.json();
        let foodSuggestions = data.candidates?.[0]?.content?.parts?.[0]?.text || "No food info available.";
        return parseFoodSuggestions(foodSuggestions, placeName);
    } catch (error) {
        console.error(`❌ Error in getFamousFood: ${error.message}`);
        return `<p>Oops, the food fairies are napping! 😴 <button class="btn btn-sm btn-warning" onclick="suggestFoodNearMe()">Retry</button></p>`;
    }
}


async function suggestFoodNearMe() {
    console.log("🗺️ Starting suggestFoodNearMe...");
    closeFeaturesContainer();
    document.getElementById("features-btn").style.display = "none";

    let popup = document.getElementById("foodPopup");
    popup.classList.remove("d-none");
    popup.classList.add("d-block");

    document.getElementById("food-content").innerHTML =
        '<p><span class="loader"></span> <span class="pulse-text">⏳ Fetching food details...</span></p>';

    let favoriteFoodLocations = JSON.parse(localStorage.getItem("favoriteFoodLocations")) || [];

    if (workingWithFavorite && favoriteFoodLocations.length > 0) {
        console.log("💖 Working with multiple favorite locations...");
        for (let placeName of favoriteFoodLocations) {
            console.log(`🍽️ Fetching food for: ${placeName}`);
            await showFamousFood(placeName);
        }
        return;
    }

    try {
        if (!userLocationCache.lat || !userLocationCache.lon) {
            throw new Error("No location data available");
        }
        let placeName = userLocationCache.placeName;
        console.log(`🍽️ Fetching food for live location: ${placeName}`);
        await showFamousFood(placeName);
    } catch (error) {
        console.error(`❌ Location error: ${error.message}`);
        alert("❌ No location data available.");
    }
}

// Modified setDestination to include a name


function setDestination() {
    isAddingDestination = true;
    document.getElementById("floating-food-btn").style.display = "none"; // ✅ Hide the button
    document.getElementById("openBot").style.display = "none"; // ✅ Hide the button

    map.setOptions({ draggableCursor: "pointer" });
    alert("Click on the map to select your destination.");

    google.maps.event.clearListeners(map, "click");

    map.addListener("click", async (event) => {
        if (!isAddingDestination) return;
        isAddingDestination = false;

        let lat = event.latLng.lat();
        let lon = event.latLng.lng();

        const name = prompt("Enter a name for this destination (e.g., Home, Work):") || `Unnamed-${Date.now()}`;
        const alarm = prompt("Enter alarm sound file name (e.g., alarm1):") || 'alarm1';
        let alarmFile = `${alarm}.mp3`;

        // ✅ Ask user for proximity range (default 50m if not provided)
        let proximity = parseInt(prompt("Set alarm proximity in meters  (e.g., 100 for 100m) (min 10m)  :") || "50", 10);
        proximity = isNaN(proximity) ? 50 : Math.max(10, proximity); // Ensuring a valid range (min 10m)

        // 🔥 Fetch weather and travel tip
        let weatherInfo = await getWeatherForDestination(lat, lon);
        const currentHour = new Date().getHours();
        const isNight = currentHour >= 18 || currentHour < 6; // Nighttime check
        let travelTip = getTravelTip(weatherInfo.weather, weatherInfo.temp, isNight);

        // let travelTip = getTravelTip(weatherInfo.weather);

        let newDestination = { lat, lon, alarm: alarmFile, favorite: false, name, weather: weatherInfo, travelTip, proximity };
        destinations.push(newDestination);
        localStorage.setItem("destinations", JSON.stringify(destinations));

        console.log(newDestination);

        // ✅ Add marker with weather info
        let marker = new google.maps.Marker({
            position: { lat, lng: lon },
            map: map,
            title: `${name} - ${weatherInfo.temp}°C, ${weatherInfo.weather}`
        });

        renderDestinations();
        startTracking();

        updateStatus(`✅ Added: ${name} at Lat ${lat}, Lon ${lon}, Alarm: ${alarmFile}, ${weatherInfo.temp}°C - ${weatherInfo.weather}, Proximity: ${proximity}m`);
        document.getElementById("floating-food-btn").style.display = "block"; // ✅ Show the button again
        document.getElementById("openBot").style.display = "block"; // ✅ Show the button again

    });
}



// Updated renderDestinations to use names

async function renderDestinations() {
    console.log("Rendering destinations...");

    const destContainer = document.getElementById("destinations");
    let html = "";

    let destinations = JSON.parse(localStorage.getItem("destinations")) || [];
    destinations.sort((a, b) => b.favorite - a.favorite);

    for (const [index, dest] of destinations.entries()) {
        const cardClass = dest.favorite ? "destination-card favorite" : "destination-card";

        const temp = dest.weather?.temp ?? "N/A";
        const weatherDesc = dest.weather?.weather ?? "Weather unavailable";
        const weatherIcon = dest.weather?.icon ? `<img src="${dest.weather.icon}" width="30px">` : "";

        html += `
 <div id="destination-${index}" class="${cardClass}"
    style="border-radius: 10px; cursor: pointer; box-shadow: 0 2px 10px #ff9a9e; position: relative; z-index: 1;">
    <div class="destination-header">
        <span class="destination-title">📌 ${dest.name}</span>
        ${dest.favorite
                ? `<button class="star-btn" onclick="toggleFavorite('${dest.name}')">★</button>`
                : `<button class="star-btn" onclick="toggleFavorite('${dest.name}')">☆</button>`}
        <button class='btn btn-danger btn-sm delete-btn' onclick='deleteDestination("${dest.name}")'>🗑 Delete</button>
    </div>

    <div class="destination-details">
        <p>📍 Lat: <strong>${dest.lat}</strong>, Lon: <strong>${dest.lon}</strong></p>
        <p> જ⁀➴ Distance: <strong id="distance-${index}">${dest.distance}</strong></p>
        <p>🔔 Alarm: <strong>${dest.alarm}</strong></p>
        <p>🌡️ <strong>${temp}°C</strong> - ${weatherDesc} ${weatherIcon}</p>
        <p><strong>${dest.travelTip ?? "No travel tip available."}</strong></p>
        <p>🎯 <strong>Proximity: ${dest.proximity}m</strong></p> 
        ${dest.favorite
                ? `<button class="fancy-food-btn" 
                onclick="setFavoriteModeAndSuggestFood('${dest.name}')"
                style="
                    background-image: linear-gradient(180deg, #2af598 0%, #009efd 100%);
                    border: none;
                    color: black;
                    font-size: 15px;
                    font-weight: bold;
                    padding: 10px 15px;
                    margin-top: 5px;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(255, 153, 153, 0.5);
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    display: flex;
                    gap: 4px;
                    position: relative;
                    z-index: 2; /* Lower than popups */
                "
                onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 15px rgba(255, 153, 153, 0.8)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(255, 153, 153, 0.5)';"
                onmousedown="this.style.transform='scale(0.98)';"
                onmouseup="this.style.transform='scale(1)';"
            >Show Famous Foods here.. 🤤</button>`
                : ""}
    </div>
</div>
<br>
`;




    }

    destContainer.innerHTML = html;
}



async function setFavoriteModeAndSuggestFood(name) {
    console.log(`⭐ Adding favorite location: ${name}`);

    let destinations = JSON.parse(localStorage.getItem("destinations")) || [];

    // ✅ Find the correct destination by `name`
    let dest = destinations.find(dest => dest.name === name);

    if (!dest) {
        console.error(`❌ Destination not found: ${name}`);
        return;
    }

    const { lat, lon } = dest; // ✅ Correct lat/lon
    console.log(`📍 Retrieved Coordinates: Lat ${lat}, Lon ${lon}`);

    // Convert lat/lon to a place name
    const placeName = await getLocationNameFromLatLon(lat, lon);
    if (!placeName) {
        console.error("❌ Could not determine place name.");
        return;
    }

    console.log(`🏙️ Retrieved Place Name: ${placeName}`);

    // Get the current list of favorite locations
    let favoriteFoodLocations = JSON.parse(localStorage.getItem("favoriteFoodLocations")) || [];

    // Avoid duplicates
    if (!favoriteFoodLocations.includes(placeName)) {
        favoriteFoodLocations.push(placeName);
        localStorage.setItem("favoriteFoodLocations", JSON.stringify(favoriteFoodLocations));
        console.log(`✅ Added to favorites: ${placeName}`);
    } else {
        console.warn(`⚠️ ${placeName} is already in favorites.`);
    }

    // Set working mode to favorite
    workingWithFavorite = true;

    // Call suggestFoodNearMe() (which will now use the favorite places)
    suggestFoodNearMe();
}





// Updated triggerPartyExplosion with custom name and announcement
function triggerPartyExplosion(destName) {
    const emojis = ['🎉', '🥳', '🎊', '🎈', '✨', '🎆', '🎇', '🍾', '🎂', '🎵', '💃', '🕺'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1000';
    document.body.appendChild(container);

    for (let i = 0; i < 25; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const popper = document.createElement('span');
        popper.textContent = emoji;
        popper.style.position = 'absolute';
        popper.style.fontSize = `${1.5 + Math.random() * 1.5}rem`;
        popper.style.opacity = '0';

        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
            popper.style.top = '-50px';
            popper.style.left = `${Math.random() * 100}%`;
            popper.style.animation = `explodeDown ${0.8 + Math.random() * 0.5}s ease-out forwards`;
        } else if (edge === 1) {
            popper.style.bottom = '-50px';
            popper.style.left = `${Math.random() * 100}%`;
            popper.style.animation = `explodeUp ${0.8 + Math.random() * 0.5}s ease-out forwards`;
        } else if (edge === 2) {
            popper.style.left = '-50px';
            popper.style.top = `${Math.random() * 100}%`;
            popper.style.animation = `explodeRight ${0.8 + Math.random() * 0.5}s ease-out forwards`;
        } else {
            popper.style.right = '-50px';
            popper.style.top = `${Math.random() * 100}%`;
            popper.style.animation = `explodeLeft ${0.8 + Math.random() * 0.5}s ease-out forwards`;
        }

        popper.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(popper);
    }

    setTimeout(() => {
        document.body.removeChild(container);
    }, 9000);

    // Show "Destination Reached" announcement
    const announcement = document.getElementById('reached-announcement');
    announcement.textContent = `🎉 ${destName} Reached! 🥳✨`;
    announcement.style.display = 'block';
    setTimeout(() => {
        announcement.style.display = 'none';
    }, 9000); // Matches fadeInOut animation duration

    updateStatus(`🎉 ${destName} reached! 🥳✨`);

}

// Update startTracking
function startTracking() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            async (position) => {
                let currentLat = position.coords.latitude;
                let currentLon = position.coords.longitude;
                document.getElementById("current-location").innerText = `📡 Current Location: Lat ${currentLat}, Lon ${currentLon}`;

                const cache = await caches.open('destnotify-data');
                await cache.put('current-location', new Response(JSON.stringify({
                    latitude: currentLat,
                    longitude: currentLon
                })));

                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker.ready.then((registration) => {
                        registration.sync.register('check-location')
                            .then(() => console.log("✅ Background sync registered"))
                            .catch((err) => console.error("❌ Background sync registration failed:", err));
                    });
                }

                destinations.forEach((dest, index) => {
                    let distance = getDistance(currentLat, currentLon, dest.lat, dest.lon);
                    let distanceText = distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(2)} m`;
                    document.getElementById(`distance-${index}`).innerText = distanceText;
                    destinations[index].distance = distanceText;
                    updateStatus(`🚀 ${dest.name}: ${distanceText} away`);

                    // ✅ Use user-defined proximity instead of a fixed 50m
                    if (distance < dest.proximity) {
                        console.log("🚨 Destination reached!");
                        updateStatus(`🚀 🥳 🎇 ${dest.name} reached!!! 🥳 🎇`);
                        showToast(`🎉 Reached ${dest.name}! 🥳`); // ✅ Non-blocking notification
                        playAlarm(dest.alarm);
                        triggerPartyExplosion(dest.name);
                        sendArrivalEmail(dest.name, dest.lat, dest.lon);

                        destinations.splice(index, 1);
                        localStorage.setItem("destinations", JSON.stringify(destinations));
                        renderDestinations();
                    }
                });
            },
            (error) => updateStatus(`❌ Error: ${error.message}`),
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
    }
}

// ✅ Non-blocking Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.top = '60vh';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 10000); // Disappears after 3 sec
}



(function () {
    emailjs.init("0jU8-GLncwXyPHu3l");  // Replace with your actual EmailJS Public Key
    // Replace with your actual EmailJS Public Key
})();

function resetUser() {
    // Clear user details from localStorage
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("promptShown");

    // Update welcome message
    document.getElementById("welcome-message").innerText = "";

    // Notify user and reload to trigger prompt
    showToast("🚮 User details cleared! Reloading...");
    setTimeout(() => location.reload(), 2000); // Reload after 2s to show toast
}


function sendArrivalEmail(destinationName, latitude, longitude) {
    let userEmail = localStorage.getItem("userEmail");
    let userName = localStorage.getItem("userName") || "Shraddha"; // Default if not set
    console.log(`📬 Sending push notification for: ${destinationName}`);

    if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("🎉 Destination Reached!", {
                body: `Hey ${userName}! You've arrived at ${destinationName} (Lat: ${latitude}, Lon: ${longitude}). Time to celebrate! 🥳✨`,
                icon: "favicon.ico",
                badge: "favicon.ico",
                vibrate: [500, 200, 500, 200, 500],
                sound: "alarm1.mp3", // Use a default alarm or destination-specific sound
                data: { destinationName, latitude, longitude },
                actions: [
                    { action: "open-app", title: "Open DestNotify" },
                    { action: "dismiss", title: "Dismiss" }
                ]
            });
            console.log("✅ Push notification triggered!");
        }).catch((error) => {
            console.error("❌ Failed to trigger push notification:", error);
            showToast("😿 Couldn't send arrival notification. Please check permissions.");
        });
    } else {
        console.warn("⚠️ Push notifications not supported.");
        showToast(`🎉 ${destinationName} reached! (Notifications not supported)`);
    }
    if (!userEmail) {
        console.error("❌ No email found! Skipping email notification.");
        return;
    }

    console.log(`📧 Sending email to: ${userEmail}`);

    let templateParams = {
        to_name: userName,
        to_email: userEmail,
        destination_name: destinationName,
        latitude: latitude,   // Include latitude
        longitude: longitude  // Include longitude
    };

    emailjs.send("service_9oyj0bm", "destnotify_kamal", templateParams)
        .then(function (response) {
            console.log("✅ Email Sent Successfully!", response);
            alert("📩 Arrival email sent successfully!");
        })
        .catch(function (error) {
            console.error("❌ Failed to send email:", error);

        });
}


//         function sendArrivalEmail(destinationName, latitude, longitude) {
//     let userName = localStorage.getItem("userName") || "Traveler";
//     console.log(`📬 Sending push notification for: ${destinationName}`);

//     if ("serviceWorker" in navigator && "PushManager" in window) {
//         navigator.serviceWorker.ready.then((registration) => {
//             registration.showNotification("🎉 Destination Reached!", {
//                 body: `Hey ${userName}! You've arrived at ${destinationName} (Lat: ${latitude}, Lon: ${longitude}). Time to celebrate! 🥳✨`,
//                 icon: "favicon.ico",
//                 badge: "favicon.ico",
//                 vibrate: [500, 200, 500, 200, 500],
//                 sound: "alarm1.mp3", // Use a default alarm or destination-specific sound
//                 data: { destinationName, latitude, longitude },
//                 actions: [
//                     { action: "open-app", title: "Open DestNotify" },
//                     { action: "dismiss", title: "Dismiss" }
//                 ]
//             });
//             console.log("✅ Push notification triggered!");
//         }).catch((error) => {
//             console.error("❌ Failed to trigger push notification:", error);
//             showToast("😿 Couldn't send arrival notification. Please check permissions.");
//         });
//     } else {
//         console.warn("⚠️ Push notifications not supported.");
//         showToast(`🎉 ${destinationName} reached! (Notifications not supported)`);
//     }
// }

let hasPrompted = false; // In-memory flag to prevent multiple prompts in the same session

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📄 DOM Content Loaded, initializing...");

    // Load cached location if available
    const cachedLocation = localStorage.getItem("userLocationCache");
    if (cachedLocation) {
        userLocationCache = JSON.parse(cachedLocation);
        if (Date.now() - userLocationCache.lastUpdated < 3600000) { // 1 hour cache validity
            console.log("✅ Loaded cached location:", userLocationCache);
        } else {
            console.log("🕒 Cached location expired, fetching new location...");
            await getUserLocation();
        }
    } else {
        await getUserLocation();
    }

    // Check if prompt has already been shown (persistent flag)
    const promptShown = localStorage.getItem("promptShown") === "true";

    // Check for userName and userEmail
    let userName = localStorage.getItem("userName");
    let userEmail = localStorage.getItem("userEmail");

    // Only prompt if not already shown and name/email are missing/invalid
    if (!promptShown && (!userName || !userEmail || userName.trim() === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) && !hasPrompted) {
        hasPrompted = true; // Set in-memory flag to prevent re-prompting

        setTimeout(() => {
            // Prompt for name
            let attempts = 3;
            while (!userName && attempts > 0) {
                userName = prompt(`Hey there! What's your name? 😊 (${attempts} attempts left)`);
                attempts--;
            }
            if (!userName) {
                userName = "Guest";
            }

            // Prompt for email with basic validation
            attempts = 3;
            while (!userEmail && attempts > 0) {
                userEmail = prompt(`Please enter your email (for notifications). 📩 (${attempts} attempts left)`);
                if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
                    userEmail = null;
                    alert("Please enter a valid email (e.g., you@example.com).");
                }
                attempts--;
            }
            if (!userEmail) {
                userEmail = "guest@destnotify.com"; // Fallback email
            }

            // Save to localStorage
            localStorage.setItem("userName", userName.trim());
            localStorage.setItem("userEmail", userEmail.trim());
            localStorage.setItem("promptShown", "true"); // Set persistent flag

            // Set welcome message
            document.getElementById("welcome-message").innerText = `Welcome, ${userName.trim()}! 😊`;

            alert(`Welcome, ${userName}! 🎉 You're all set.`);
        }, 1500);
    } else {
                document.getElementById("welcome-message").innerText = `Welcome, ${userName ? userName.trim() : 'Guest'}! 😊`;

        console.log(`✅ User info already set: ${userName}, ${userEmail}`);
    }
    
    // Attach reset button event listener
    const resetBtn = document.getElementById("reset-user-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetUser);
    }
});

 
async function getStateAndCountryCode(lat, lon) {
    const prompt = `Given latitude ${lat} and longitude ${lon}, provide the state name (if in India) or nearest major city, and the ISO 3166-1 alpha-2 country code. Return JSON: {"state": "state_name", "countryCode": "code"}`;
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBbINjoDygkCyj5wqVw80SoDSm2OorGtNk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
        return {
            state: result.state || "Unknown State",
            countryCode: result.countryCode || "IN"
        };
    } catch (error) {
        console.error("❌ Error fetching state/country code:", error);
        return { state: "Unknown State", countryCode: "IN" };
    }
}




// Update window load event
window.addEventListener('load', () => {
    const reachedDestinations = JSON.parse(localStorage.getItem('reachedDestinations')) || [];
    if (reachedDestinations.length > 0) {
        reachedDestinations.forEach(dest => {
            triggerPartyExplosion(dest.name || `Destination at Lat ${dest.lat}`); // Fallback for older data
        });
        localStorage.setItem('reachedDestinations', JSON.stringify([]));
    }
    renderDestinations();
    startTracking();
});

// Update service worker interaction (in sw.js logic, adjust reachedDestinations to include name)
async function checkUserLocation() {
    try {
        const cache = await caches.open('destnotify-data');
        const response = await cache.match('current-location');
        if (!response) return;

        const { latitude, longitude } = await response.json();
        let destinations = JSON.parse(localStorage.getItem('destinations')) || [];

        for (let [index, dest] of destinations.entries()) {
            const distance = getDistance(latitude, longitude, dest.lat, dest.lon);
            if (distance < 50) {
                self.registration.showNotification('Destination Reached!', {
                    body: `🎉 You’re at ${dest.name}! 🥳 Party on! 🎊✨`,
                    icon: 'favicon.ico',
                    vibrate: [200, 100, 200],
                    sound: dest.alarm
                });

                const reachedDestinations = JSON.parse(localStorage.getItem('reachedDestinations')) || [];
                reachedDestinations.push({ name: dest.name, lat: dest.lat, lon: dest.lon });
                localStorage.setItem('reachedDestinations', JSON.stringify(reachedDestinations));

                destinations.splice(index, 1);
                localStorage.setItem('destinations', JSON.stringify(destinations));
            }
        }
    } catch (error) {
        console.error('Error in background sync:', error);
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById("installBtn").style.display = "block";
});
navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "play-alarm") {
        console.log("🔔 Playing alarm sound...");

        let alarm = new Audio(event.data.alarm);
        alarm.play().catch((err) => {
            console.log("🔇 Auto-play blocked:", err);
            alert("🔊 Tap anywhere to enable alarm playback!");

            document.body.addEventListener("click", () => {
                alarm.play();
            }, { once: true });
        });

        // 📳 Trigger vibration
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500]);
        }
    }
});


document.getElementById("installBtn").addEventListener("click", () => {
    if (!deferredPrompt) {
        alert("📲 App installation is not available right now.");
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
            console.log("User installed the app");
        }
        deferredPrompt = null;
    });
    document.getElementById("installBtn").style.display = "none";
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
        .then(() => console.log("✅ Service Worker Registered"))
        .catch((err) => console.log("❌ Service Worker Error:", err));
}


renderDestinations();
startTracking();

      
     