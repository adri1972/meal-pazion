/**
 * @file db.js
 * @description Gestión de la base de datos IndexedDB para el Sistema MEAL +PaZion.
 * Permite el funcionamiento offline-first.
 */

const DB_NAME = 'PazionMEAL';
const DB_VERSION = 8; // v8: Refactorización de sembrado para mayor robustez

let db;

// Lista maestra de indicadores — fuente de verdad única
const INDICADORES_MAESTROS = [
    // Eje 1
    { id: 1, proyecto_id: 1, eje: 'Empoderamiento y Liderazgo Femenino', nombre: 'Índice de Autoconfianza', meta: '80% con aumento >3 puntos' },
    { id: 2, proyecto_id: 1, eje: 'Empoderamiento y Liderazgo Femenino', nombre: 'Agencia de Decisión', meta: '100% de las participantes' },
    { id: 3, proyecto_id: 1, eje: 'Empoderamiento y Liderazgo Femenino', nombre: 'Identificación de Derechos', meta: '90% de las participantes' },
    // Eje 2
    { id: 4, proyecto_id: 1, eje: 'Construcción de Paz y Territorio', nombre: 'Percepción de Espacio Seguro', meta: '95% de percepción positiva' },
    { id: 5, proyecto_id: 1, eje: 'Construcción de Paz y Territorio', nombre: 'Resolución de Conflictos', meta: 'Reducción del 50% en incidentes' },
    { id: 6, proyecto_id: 1, eje: 'Construcción de Paz y Territorio', nombre: 'Vínculo Intercultural', meta: '1 encuentro bimensual' },
    // Eje 3
    { id: 7, proyecto_id: 1, eje: 'Permanencia y Excelencia Deportiva', nombre: 'Tasa de Retención', meta: '85% de retención anual' },
    { id: 8, proyecto_id: 1, eje: 'Permanencia y Excelencia Deportiva', nombre: 'Desempeño Competitivo', meta: 'Mínimo 2 torneos anuales' },
    { id: 9, proyecto_id: 1, eje: 'Permanencia y Excelencia Deportiva', nombre: 'Escalamiento Deportivo', meta: '2-3 jugadoras por ciclo' }
];

const USUARIOS_MAESTROS = [
    { id: 1, correo: 'admin@pazion.org', nombre: 'Admin PaZion', password: '123', rol: 'Administrador' },
    { id: 2, correo: 'tecnico@pazion.org', nombre: 'Técnico Campo', password: '123', rol: 'Técnico de Campo' }
];

const PROYECTO_MAESTRO = {
    id: 1,
    nombre: 'Goles de Vida',
    eje: 'Integral',
    meta_global: 100,
    activo: true,
    descripcion: 'Programa insignia de la Fundación +PaZion para el liderazgo y paz.'
};

/**
 * Inicializa la base de datos y crea los almacenes de objetos (stores).
 */
export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Error al abrir la base de datos:', event.target.error);
            reject('Error al abrir IndexedDB');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log(`Base de datos v${DB_VERSION} inicializada correctamente.`);
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            const tx = event.target.transaction;
            console.log(`Migración de BD: v${event.oldVersion} → v${event.newVersion}`);

            // --- Eliminar stores antiguas para empezar limpio ---
            const storesToDelete = ['usuarios', 'proyectos', 'indicadores', 'capturas'];
            storesToDelete.forEach(storeName => {
                if (dbInstance.objectStoreNames.contains(storeName)) {
                    dbInstance.deleteObjectStore(storeName);
                }
            });

            // --- Crear stores nuevas ---
            const userStore = dbInstance.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('correo', 'correo', { unique: true });

            dbInstance.createObjectStore('proyectos', { keyPath: 'id', autoIncrement: true });

            const indicatorStore = dbInstance.createObjectStore('indicadores', { keyPath: 'id', autoIncrement: true });
            indicatorStore.createIndex('proyecto_id', 'proyecto_id', { unique: false });
            indicatorStore.createIndex('eje', 'eje', { unique: false });

            const captureStore = dbInstance.createObjectStore('capturas', { keyPath: 'id', autoIncrement: true });
            captureStore.createIndex('indicador_id', 'indicador_id', { unique: false });
            captureStore.createIndex('estado', 'estado', { unique: false });
            captureStore.createIndex('sync_status', 'sync_status', { unique: false });

            // --- Sembrar datos iniciales en la misma transacción de migración ---
            seedAllData(tx);
        };
    });
}

/**
 * Función centralizada de sembrado de datos (Maestros + Capturas de prueba).
 * @param {IDBTransaction} transaction 
 */
export function seedAllData(transaction) {
    console.log('Iniciando sembrado completo de datos...');

    const userStore = transaction.objectStore('usuarios');
    USUARIOS_MAESTROS.forEach(u => userStore.put(u));

    transaction.objectStore('proyectos').put(PROYECTO_MAESTRO);

    const indStore = transaction.objectStore('indicadores');
    INDICADORES_MAESTROS.forEach(i => indStore.put(i));

    const objCapturas = transaction.objectStore('capturas');

    // Generar 15 capturas ficticias para visualizar datos enriquecidos en el Dashboard
    const estadosPosibles = ['Aprobado', 'Rechazado', 'Borrador', 'Aprobado', 'Aprobado'];
    const ejesPosibles = ['Empoderamiento y Liderazgo Femenino', 'Construcción de Paz y Territorio', 'Permanencia y Excelencia Deportiva'];

    for (let i = 0; i < 15; i++) {
        let ejeRand = ejesPosibles[Math.floor(Math.random() * ejesPosibles.length)];
        let indBase = INDICADORES_MAESTROS.find(ind => ind.eje === ejeRand);

        let fechaRand = new Date();
        fechaRand.setDate(fechaRand.getDate() - Math.floor(Math.random() * 30));

        let estadoRand = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
        let syncStatus = (estadoRand === 'Aprobado' && Math.random() > 0.3) ? 'Synced' : 'Pending';

        let capturaVirtual = {
            id: i + 1,
            indicador_id: indBase.id,
            indicador_nombre: indBase.nombre,
            eje: ejeRand,
            fecha: fechaRand.toISOString(),
            estado: estadoRand,
            sync_status: syncStatus,
            tipo: Math.random() > 0.5 ? 'retencion' : 'escala',
            gps: { lat: 4.6097 + (Math.random() * 0.1), lng: -74.0817 + (Math.random() * 0.1) }
        };

        if (capturaVirtual.tipo === 'retencion') {
            capturaVirtual.conteo = { total: Math.floor(Math.random() * 50) + 10 };
        } else {
            let parts = [];
            let r = Math.floor(Math.random() * 20) + 5;
            for (let p = 0; p < r; p++) parts.push({ nombre: 'Participante ' + p, valor: Math.floor(Math.random() * 10) });
            capturaVirtual.participantes = parts;
        }

        objCapturas.put(capturaVirtual);
    }

    console.log('Sembrado completado (Maestros + 15 Capturas de prueba).');
}

/**
 * Verifica si la BD tiene los indicadores correctos. Si no, los re-siembra.
 * Se llama siempre al iniciar la página de captura para garantizar datos frescos.
 */
export async function ensureDataSeeded() {
    if (!db) {
        console.warn('ensureDataSeeded: BD no inicializada.');
        return;
    }

    const indicadores = await getAllData('indicadores');
    const capturas = await getAllData('capturas');

    console.log(`ensureDataSeeded: ${indicadores.length} indicadores, ${capturas.length} capturas.`);

    if (indicadores.length >= INDICADORES_MAESTROS.length && capturas.length > 0) {
        console.log('Datos de indicadores y capturas OK.');
        return;
    }

    console.warn(`Re-sembrando datos (Faltan indicadores o capturas)...`);

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios', 'proyectos', 'indicadores', 'capturas'], 'readwrite');

        transaction.oncomplete = () => {
            console.log('Re-siembra completada exitosamente.');
            resolve();
        };
        transaction.onerror = (e) => {
            console.error('Error en re-siembra:', e.target.error);
            reject(e.target.error);
        };

        seedAllData(transaction);
    });
}

/**
 * Expone la lista maestra de indicadores para uso directo (sin pasar por BD si hay problemas).
 */
export function getIndicadoresMaestros() {
    return [...INDICADORES_MAESTROS];
}

// ============================================================
// CRUD Genérico
// ============================================================

/**
 * Guarda un dato en un store.
 */
export async function addData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Obtiene todos los datos de un store.
 */
export async function getAllData(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Obtiene un dato por ID.
 */
export async function getDataById(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Actualiza un dato.
 */
export async function updateData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Elimina la BD completa y recarga la página.
 * Útil como herramienta de diagnóstico en la pantalla de administración.
 */
export async function resetDatabase() {
    if (db) {
        db.close();
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
            console.log('Base de datos eliminada. Recargando...');
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
}
