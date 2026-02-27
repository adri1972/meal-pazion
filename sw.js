/**
 * @file sw.js
 * @description Service Worker para el Sistema MEAL +PaZion.
 * Permite el funcionamiento offline cacheando los assets esenciales.
 */

const CACHE_NAME = 'pazion-meal-v2';
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

// Instalación: Cachear assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cacheando assets institucionales...');
            return cache.addAll(ASSETS);
        })
    );
});

// Activación: Limpiar caches antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

// Estrategia: Network First, falling back to Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
