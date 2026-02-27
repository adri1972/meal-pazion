/**
 * @file app.js
 * @description Utilidades globales y renderizado de componentes comunes (Sidebar, Topbar).
 */

import { getCurrentUser, logout } from './auth.js';

/**
 * Inicializa los componentes comunes de la interfaz.
 */
export function initUI() {
    const user = getCurrentUser();
    if (!user) return;

    renderSidebar(user);
    renderTopbar(user);
    initOfflineDetection();
}

/**
 * Renderiza la barra lateral según el rol del usuario.
 */
function renderSidebar(user) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const currentPath = window.location.pathname;

    const navItems = [
        { label: 'Dashboard', icon: '📊', path: 'dashboard.html', roles: ['Administrador', 'Coordinador de Proyecto', 'Técnico de Campo'] },
        { label: 'Captura de Datos', icon: '📝', path: 'captura.html', roles: ['Administrador', 'Coordinador de Proyecto', 'Técnico de Campo'] },
        { label: 'Validación', icon: '✅', path: 'validacion.html', roles: ['Administrador', 'Coordinador de Proyecto'], badge: 3 },
        { label: 'Reportes', icon: '📈', path: 'reportes.html', roles: ['Administrador', 'Coordinador de Proyecto'] },
        { label: 'Configuración', icon: '⚙️', path: 'admin.html', roles: ['Administrador'] }
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user.rol));

    sidebar.innerHTML = `
    <div class="sidebar-brand">
      <img src="assets/img/logo.png" alt="+PaZion" onerror="this.src='https://placehold.co/40x40/7B35C4/white?text=P'">
      <div class="sidebar-brand-text">
        <span class="sidebar-brand-name">+PaZion MEAL</span>
        <span class="sidebar-brand-tagline">Goles de Vida</span>
      </div>
    </div>
    
    <div class="sidebar-section">
      <div class="sidebar-label">Menú Principal</div>
      <nav>
        ${filteredNav.map(item => `
          <a href="${item.path}" class="nav-item ${currentPath.includes(item.path) ? 'active' : ''}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>
    </div>

    <div class="sidebar-footer">
      <div class="user-card" id="userCard">
        <div class="user-avatar">${user.nombre.charAt(0)}</div>
        <div class="user-info">
          <div class="user-name">${user.nombre}</div>
          <div class="user-role">${user.rol}</div>
        </div>
      </div>
    </div>
  `;

    document.getElementById('userCard')?.addEventListener('click', () => {
        if (confirm('¿Deseas cerrar sesión?')) {
            logout();
        }
    });
}

/**
 * Renderiza la barra superior.
 */
function renderTopbar(user) {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    const pageTitle = document.title.split('|')[0].trim();

    topbar.innerHTML = `
    <div class="topbar-title">${pageTitle}</div>
    <div class="topbar-actions">
      <div id="gpsStatus" class="flex items-center gap-sm">
        <span class="text-sm text-muted">GPS</span>
        <div class="gps-dot"></div>
      </div>
      <div class="divider-v" style="width: 1px; height: 24px; background: var(--border);"></div>
      <button class="btn btn-ghost btn-sm" id="btnSync">
        <span>🔄 Sincronizar</span>
      </button>
    </div>
  `;
}

/**
 * Detecta cambios en la conexión a internet.
 */
function initOfflineDetection() {
    const banner = document.createElement('div');
    banner.className = 'offline-banner';
    banner.textContent = '⚠️ Modo Offline: Los datos se guardarán localmente y se sincronizarán al recuperar conexión.';
    document.body.appendChild(banner);

    const updateStatus = () => {
        if (navigator.onLine) {
            banner.classList.remove('visible');
        } else {
            banner.classList.add('visible');
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

/**
 * Muestra una notificación tipo Toast.
 */
export function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
        if (container.childNodes.length === 0) container.remove();
    }, 4000);
}
