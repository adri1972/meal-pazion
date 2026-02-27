/**
 * @file sw.js
 * @description Service Worker para el Sistema MEAL +PaZion.
 * Permite el funcionamiento offline cacheando los assets esenciales.
 */

const CACHE_NAME = 'pazion-meal-v6';
const ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './captura.html',
    './validacion.html',
    './reportes.html',
    './admin.html',
    './css/main.css',
    './js/app.js',
    './js/auth.js',
    './js/db.js',
    './js/firma.js',
    './manifest.json'
];

// Instalación: Cachear assets y forzar activación inmediata
self.addEventListener('install', (event) => {
    self.skipWaiting(); // ¡OBLIGA AL NUEVO SW A INSTALARSE INMEDIATAMENTE!
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cacheando assets institucionales...');
            return cache.addAll(ASSETS);
        })
    );
});

// Activación: Limpiar caches antiguos y tomar control total
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // ¡TOMA EL CONTROL INMEDIATO DE LAS PESTAÑAS ABIERTAS!
    );
});

// Estrategia: Network First, actualizando el caché silenciosamente
self.addEventListener('fetch', (event) => {
    // Si la petición no es HTTP/HTTPS (por ejemplo chrome-extension://), dejarla pasar
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si hay red y la respuesta es válida, actualizamos el caché
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si no hay red, intentamos recuperar del caché
                return caches.match(event.request);
            })
    );
});
