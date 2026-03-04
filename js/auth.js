/**
 * @file auth.js
 * @description Gestión de autenticación y roles para el Sistema MEAL +PaZion.
 */

import { initDB, getAllData, ensureDataSeeded } from './db.js';

/**
 * Intenta iniciar sesión con un correo y contraseña.
 */
export async function login(correo, password) {
    try {
        // Intentar inicialización normal
        try {
            await initDB();
            await ensureDataSeeded();
        } catch (dbError) {
            console.error('Error inicializando BD en login, procediendo a modo emergencia:', dbError);
            // No hacemos throw aquí para permitir el fallback de abajo
        }

        let usuario = null;

        // 1. Intentar buscar en la base de datos (si está disponible)
        try {
            const usuarios = await getAllData('usuarios');
            usuario = usuarios.find(u => u.correo === correo && u.password === password);
        } catch (e) {
            console.warn('No se pudo leer de la BD para login, usando maestros directos.');
        }

        // 2. Fallback Maestro de Emergencia (Si falla la BD o no está el usuario ahí)
        if (!usuario) {
            const USUARIOS_MAESTROS_FALLBACK = [
                { id: 1, correo: 'admin@pazion.org', nombre: 'Admin PaZion', password: '123', rol: 'Administrador' },
                { id: 2, correo: 'tecnico@pazion.org', nombre: 'Técnico Campo', password: '123', rol: 'Técnico de Campo' }
            ];
            usuario = USUARIOS_MAESTROS_FALLBACK.find(u => u.correo === correo && u.password === password);
            if (usuario) console.info('Login exitoso vía Fallback de Emergencia.');
        }

        if (usuario) {
            const sessionData = {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol,
                correo: usuario.correo,
                loggedInAt: new Date().getTime(),
                mode: 'emergency' // Etiqueta para debug
            };
            localStorage.setItem('pazion_session', JSON.stringify(sessionData));
            return { success: true, user: sessionData };
        }

        return { success: false, message: 'Correo o contraseña incorrectos' };
    } catch (error) {
        console.error('Error crítico en login:', error);
        return { success: false, message: `Falla crítica del sistema: ${error.name || 'Desconocido'}.` };
    }
}

/**
 * Obtiene el usuario actual de la sesión.
 */
export function getCurrentUser() {
    const session = localStorage.getItem('pazion_session');
    return session ? JSON.parse(session) : null;
}

/**
 * Cierra la sesión.
 */
export function logout() {
    localStorage.removeItem('pazion_session');
    window.location.href = 'index.html';
}

/**
 * Verifica si hay una sesión activa y redirecciona si es necesario.
 */
export function checkAuth() {
    const user = getCurrentUser();
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    if (!user && !isLoginPage) {
        window.location.href = 'index.html';
    } else if (user && isLoginPage) {
        window.location.href = 'dashboard.html';
    }

    return user;
}
