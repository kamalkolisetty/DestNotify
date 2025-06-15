// sw.js
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-location') {
      event.waitUntil(checkUserLocation());
    }
  });
  
  async function checkUserLocation() {
    try {
      const cache = await caches.open('destnotify-data');
      const response = await cache.match('current-location');
      if (!response) return;
  
      const { latitude, longitude } = await response.json();
      let destinations = JSON.parse(localStorage.getItem('destinations')) || [];
  
      for (let [index, dest] of destinations.entries()) {
        const distance = getDistance(latitude, longitude, dest.lat, dest.lon);
        if (distance < dest.proximity) { // Use custom proximity
          await self.registration.showNotification('Destination Reached!', {
            body: `🎉 You’re at ${dest.name}! 🥳 Party on! 🎊✨`,
            icon: 'favicon.ico',
            vibrate: [500, 200, 500, 200, 500, 200, 500], // Match foreground
            sound: dest.alarm,
            tag: `dest-${dest.name}`, // Unique tag to avoid duplicates
            renotify: true // Re-vibrates even if same tag
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
  
  // Helper: Distance calculation (copy from main script if not already here)
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

// Handle notification click to play sound
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
          if (clients.length > 0) {
              clients[0].postMessage({ type: "play-alarm", alarm: event.notification.data.alarm });
          }
      })
  );
});
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.notification.data);
  event.notification.close();

  const { action, destinationName } = event.action ? event : { action: "open-app", destinationName: event.notification.data.destinationName };

  if (action === "open-app") {
      event.waitUntil(
          clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
              for (const client of clientList) {
                  if (client.url.includes("index.html") && "focus" in client) {
                      return client.focus();
                  }
              }
              if (clients.openWindow) {
                  return clients.openWindow("/index.html");
              }
          })
      );
  } else if (action === "dismiss") {
      console.log(`🗑 Notification for ${destinationName} dismissed.`);
  }
});

self.addEventListener("push", (event) => {
  console.log("📬 Push event received:", event);
  const data = event.data ? event.data.json() : {};
  const options = {
      body: data.body || "You've reached your destination!",
      icon: "favicon.ico",
      badge: "favicon.ico",
      vibrate: [500, 200, 500, 200, 500],
      sound: data.sound || "alarm1.mp3"
  };
  event.waitUntil(self.registration.showNotification(data.title || "Destination Reached!", options));
});