# Sistema MEAL - Fundación +PaZion / Goles de Vida

Aplicación web robusta para el monitoreo de indicadores (Monitoring, Evaluation, Accountability and Learning) diseñada para el trabajo de campo de la Fundación +PaZion.

## 🚀 Características Clave
- **Multi-proyecto**: Gestión de múltiples ejes estratégicos y sus respectivos indicadores.
- **Offline-First**: Funciona sin conexión a internet mediante IndexedDB y Service Workers. Sincronización automática al detectar señal.
- **Captura Avanzada**: 
  - GPS: Geolocalización precisa de cada registro.
  - Firma Digital: Módulo de trazado para validación de beneficiarios.
  - Evidencia: Carga de fotos y documentos.
- **Módulo de Capacitación**: Guías visuales obligatorias antes de cada captura.
- **Validación**: Bandeja para que administradores aprueben o rechacen registros.
- **Reportes**: Generación de reportes institucionales dinámicos con exportación a PDF.

## 🛠️ Tecnologías
- **HTML5 / CSS3**: Diseño premium con glassmorphism y modo oscuro.
- **Vanilla JavaScript**: Sin frameworks para máxima ligereza y compatibilidad.
- **IndexedDB**: Almacenamiento local persistente.
- **Service Workers**: Capacidades PWA (instalable en móviles).
- **jsPDF / html2canvas**: Motor de generación de reportes.

## 📂 Estructura
- `/css`: Sistema de diseño basado en la identidad de +PaZion.
- `/js`: Lógica de base de datos, autenticación y módulos.
- `index.html`: Acceso al sistema.
- `dashboard.html`: Vista global de KPIs.
- `captura.html`: Formulario de campo.
- `validacion.html`: Aprobación de registros.
- `reportes.html`: Filtros y exportación PDF.

## 📝 Instalación
1. Clona este repositorio.
2. Abre `index.html` en un navegador moderno.
3. (Opcional) Instala como App (PWA) desde el navegador para uso offline.

---
© 2026 Fundación +PaZion - Transformando la subjetividad política de las niñas en el Cauca y el Valle.
