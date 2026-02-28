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
  forceSystemUpdate();
}

/**
 * Función nuclear para limpiar cachés rebeldes y service workers antiguos.
 */
async function forceSystemUpdate() {
  const CURRENT_VER = 'v16-super-crisp';
  if (localStorage.getItem('pazion_system_version') === CURRENT_VER) return;

  console.warn('Detectada versión antigua. Iniciando limpieza profunda de caché...');

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      // Unregister everything to start clean
      await registration.unregister();
    }
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
  }

  localStorage.setItem('pazion_system_version', 'v16-super-crisp');
  console.log('Limpieza completada. Recargando sistema...');
  window.location.reload();
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
    { label: 'Validación', icon: '✅', path: 'validacion.html', roles: ['Administrador', 'Coordinador de Proyecto'] },
    { label: 'Reportes', icon: '📈', path: 'reportes.html', roles: ['Administrador', 'Coordinador de Proyecto'] },
    { label: 'Análisis Estratégico', icon: '🧠', path: 'analisis.html', roles: ['Administrador', 'Coordinador de Proyecto'] },
    { label: 'Capacitación', icon: '🎧', path: 'capacitacion.html', roles: ['Administrador', 'Coordinador de Proyecto', 'Técnico de Campo'] },
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
      <button id="closeSidebarBtn" style="background: none; border: none; font-size: 24px; color: #111827; margin-left: auto; display: none; cursor: pointer; padding: 4px;">✕</button>
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
    <div class="flex items-center gap-sm">
      <button id="mobileMenuBtn" class="btn btn-ghost btn-sm btn-icon" style="display: none;">
        <span style="font-size: 20px;">☰</span>
      </button>
      <div class="topbar-title">${pageTitle}</div>
    </div>
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

  // Mobile menu logic
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.getElementById('closeSidebarBtn');

  // Create backdrop if not exists
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    backdrop.style.display = 'none';
  }

  const handleMobileView = () => {
    const isMobile = window.innerWidth <= 768;
    if (mobileBtn) mobileBtn.style.display = isMobile ? 'block' : 'none';
    if (closeBtn) closeBtn.style.display = isMobile ? 'block' : 'none';
    if (!isMobile) {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.style.display = 'none';
    }
  };

  handleMobileView();
  window.addEventListener('resize', handleMobileView);

  const toggleSidebar = () => {
    if (sidebar) {
      const isOpen = sidebar.classList.toggle('open');
      if (backdrop) backdrop.style.display = isOpen ? 'block' : 'none';
    }
  };

  if (mobileBtn) mobileBtn.addEventListener('click', toggleSidebar);
  if (backdrop) backdrop.addEventListener('click', toggleSidebar);
  if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

  // Close sidebar when clicking links on mobile
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggleSidebar();
    });
  });
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
