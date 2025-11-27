
self.addEventListener('install', function(e){
  e.waitUntil(caches.open('steelweld-demo-v1').then(function(cache){
    return cache.addAll(['./','./index.html','./style.css','./app.js']);
  }));
});
self.addEventListener('fetch', function(e){
  e.respondWith(caches.match(e.request).then(function(r){ return r || fetch(e.request); }));
});
