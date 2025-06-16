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
        // Trigger notification with vibration
        await self.registration.showNotification('Destination Reached!', {
          body: `🎉 You’re at ${dest.name}! 🥳 Party on! 🎊✨`,
          icon: 'favicon.ico',
          vibrate: [500, 200, 500, 200, 500, 200, 500], // Robust vibration pattern
          sound: dest.alarm,
          tag: `dest-${dest.name}`,
          renotify: true,
          data: { alarm: dest.alarm, destinationName: dest.name } // Pass alarm for notification click
        });

        // Log for debugging
        console.log(`🔔 Notification sent for ${dest.name} with vibration`);

        // Update reached destinations
        const reachedDestinations = JSON.parse(localStorage.getItem('reachedDestinations')) || [];
        reachedDestinations.push({ name: dest.name, lat: dest.lat, lon: dest.lon });
        localStorage.setItem('reachedDestinations', JSON.stringify(reachedDestinations));

        // Remove destination
        destinations.splice(index, 1);
        localStorage.setItem('destinations', JSON.stringify(destinations));
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error);
  }
}

// Handle notification click to play sound
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.data);
  event.notification.close();

  const { action, destinationName } = event.action ? event : { action: 'open-app', destinationName: event.notification.data.destinationName };

  if (action === 'open-app') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/index.html');
        }
      })
    );
    // Send message to play alarm and vibrate
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        if (clients.length > 0) {
          clients[0].postMessage({
            type: 'play-alarm',
            alarm: event.notification.data.alarm,
            vibrate: true // Explicitly request vibration
          });
        }
      })
    );
  } else if (action === 'dismiss') {
    console.log(`🗑 Notification for ${destinationName} dismissed.`);
  }
});

// Helper: Distance calculation
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