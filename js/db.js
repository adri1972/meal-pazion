/**
 * @file db.js
 * @description Gestión de la base de datos IndexedDB para el Sistema MEAL +PaZion.
 * Permite el funcionamiento offline-first.
 */

const DB_NAME = 'PazionMEAL';
const DB_VERSION = 1;

let db;

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
            console.log('Base de datos inicializada correctamente');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Almacén de Usuarios
            if (!db.objectStoreNames.contains('usuarios')) {
                const userStore = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('correo', 'correo', { unique: true });
            }

            // Almacén de Proyectos
            if (!db.objectStoreNames.contains('proyectos')) {
                db.createObjectStore('proyectos', { keyPath: 'id', autoIncrement: true });
            }

            // Almacén de Indicadores
            if (!db.objectStoreNames.contains('indicadores')) {
                const indicatorStore = db.createObjectStore('indicadores', { keyPath: 'id', autoIncrement: true });
                indicatorStore.createIndex('proyecto_id', 'proyecto_id', { unique: false });
            }

            // Almacén de Capturas (Registros)
            if (!db.objectStoreNames.contains('capturas')) {
                const captureStore = db.createObjectStore('capturas', { keyPath: 'id', autoIncrement: true });
                captureStore.createIndex('indicador_id', 'indicador_id', { unique: false });
                captureStore.createIndex('estado', 'estado', { unique: false });
                captureStore.createIndex('sync_status', 'sync_status', { unique: false });
            }

            // Semilla de datos iniciales
            seedInitialData(event.currentTarget.transaction);
        };
    });
}

/**
 * Inserta datos de prueba e indicadores reales de la Fundación.
 */
function seedInitialData(transaction) {
    const userStore = transaction.objectStore('usuarios');
    const projectStore = transaction.objectStore('proyectos');
    const indicatorStore = transaction.objectStore('indicadores');

    // Usuarios iniciales
    const users = [
        { correo: 'admin@pazion.org', nombre: 'Admin PaZion', password: '123', rol: 'Administrador' },
        { correo: 'tecnico@pazion.org', nombre: 'Técnico Campo', password: '123', rol: 'Técnico de Campo' }
    ];
    users.forEach(u => userStore.add(u));

    // Proyecto inicial
    const proyectoId = 1;
    projectStore.add({
        id: proyectoId,
        nombre: 'Goles de Vida',
        eje: 'Integral',
        meta_global: 100,
        activo: true,
        descripcion: 'Programa insignia de la Fundación +PaZion para el liderazgo y paz.'
    });

    // Indicadores reales
    const indicadores = [
        // Eje 1
        { proyecto_id: proyectoId, eje: 'Empoderamiento y Liderazgo Femenino', nombre: 'Índice de Autoconfianza', meta: '80% con aumento >3 puntos' },
        { proyecto_id: proyectoId, eje: 'Empoderamiento y Liderazgo Femenino', nombre: 'Agencia de Decisión', meta: '100% de las participantes' },
        { proyecto_id: proyectoId, eje: 'Empoderamiento y Liderazgo Femenino', nombre: 'Identificación de Derechos', meta: '90% de las participantes' },
        // Eje 2
        { proyecto_id: proyectoId, eje: 'Construcción de Paz y Territorio', nombre: 'Percepción de Espacio Seguro', meta: '95% de percepción positiva' },
        { proyecto_id: proyectoId, eje: 'Construcción de Paz y Territorio', nombre: 'Resolución de Conflictos', meta: 'Reducción del 50% en incidentes' },
        { proyecto_id: proyectoId, eje: 'Construcción de Paz y Territorio', nombre: 'Vínculo Intercultural', meta: '1 encuentro bimensual' },
        // Eje 3
        { proyecto_id: proyectoId, eje: 'Permanencia y Excelencia Deportiva', nombre: 'Tasa de Retención', meta: '85% de retención anual' },
        { proyecto_id: proyectoId, eje: 'Permanencia y Excelencia Deportiva', nombre: 'Desempeño Competitivo', meta: 'Mínimo 2 torneos anuales' },
        { proyecto_id: proyectoId, eje: 'Permanencia y Excelencia Deportiva', nombre: 'Escalamiento Deportivo', meta: '2-3 jugadoras por ciclo' }
    ];
    indicadores.forEach(i => indicatorStore.add(i));
}

/**
 * CRUD genérico: Guardar dato
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
 * CRUD genérico: Obtener todos los datos de un store
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
 * CRUD genérico: Obtener dato por ID
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
 * CRUD genérico: Actualizar dato
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
