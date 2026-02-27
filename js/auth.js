/**
 * @file auth.js
 * @description Gestión de autenticación y roles para el Sistema MEAL +PaZion.
 */

import { initDB, getAllData } from './db.js';

/**
 * Intenta iniciar sesión con un correo y contraseña.
 */
export async function login(correo, password) {
    await initDB();
    const usuarios = await getAllData('usuarios');

    const usuario = usuarios.find(u => u.correo === correo && u.password === password);

    if (usuario) {
        // Solo guardamos info no sensible en la sesión
        const sessionData = {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            correo: usuario.correo,
            loggedInAt: new Date().getTime()
        };
        localStorage.setItem('pazion_session', JSON.stringify(sessionData));
        return { success: true, user: sessionData };
    }

    return { success: false, message: 'Correo o contraseña incorrectos' };
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
