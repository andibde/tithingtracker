self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("tithing-tracker").then((cache) => {
        return cache.addAll(["/tithingtracker/", "/tithingtracker/index.html", "/tithingtracker/styles.css", "/tithingtracker/app.js"]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
