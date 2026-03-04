/**
 * @file sw.js
 * @description Service Worker para el Sistema MEAL +PaZion.
 * Permite el funcionamiento offline cacheando los assets esenciales.
 */

const CACHE_NAME = 'pazion-meal-v21-final';
const ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './captura.html',
    './validacion.html',
    './reportes.html',
    './analisis.html',
    './capacitacion.html',
    './admin.html',
    './css/main.css',
    './js/app.js',
    './js/auth.js',
    './js/db.js',
    './js/firma.js',
    './js/chart.min.js',
    './manifest.json',
    './assets/img/logo.png',
    './assets/docs/Guia_Rapida_Captura_PaZion.html'
];

// Instalación: Cachear assets y forzar activación inmediata
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Instalando caché v20...');
            return cache.addAll(ASSETS);
        })
    );
});

// Activación: Limpiar caches antiguos e interceptar inmediatamente
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia: Network First con fallback a Cache Robusto
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si hay red, actualizamos el caché para futuras consultas offline
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // SI NO HAY RED:
                // Buscamos en el caché ignorando los parámetros de búsqueda (?v=19, etc.)
                // Esto garantiza que 'app.js?v=19' cargue aunque solo tengamos 'app.js'
                return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;

                    // Si es una navegación a una página HTML y no está en caché, devolver index.html como fallback
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
