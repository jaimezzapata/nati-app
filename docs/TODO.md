# Todo List - NatiApp

## Fase 1: Configuración Base ✅

### ✅ Tareas Completadas
- [✅] **Configurar Firebase en el proyecto**
  - Crear proyecto en Firebase Console, instalar dependencias (firebase), crear firebase.config.js con la configuración inicial y habilitar Authentication (Email/Password y Google), Firestore y Storage

- [✅] **Crear estructura de carpetas base**
  - Configurar la estructura completa: components/ui, components/layout, context, hooks, pages/public, pages/private, services, utils, router según la especificación del README

- [✅] **Implementar AuthContext y AuthProvider**
  - Crear el contexto de autenticación que maneje el estado del usuario logueado, crear AuthProvider para envolver la app y hook useAuth para consumir el contexto

- [✅] **Desarrollar servicios de autenticación**
  - Crear auth.service.js con funciones: login(), register(), loginWithGoogle(), logout() y getCurrentUser()

- [✅] **Configurar React Router y rutas**
  - Crear AppRouter.jsx con todas las rutas (públicas y privadas), implementar ProtectedRoute.jsx para proteger rutas que requieren autenticación

---

## Fase 2: Componentes Base ✅

- [✅] **Crear componentes UI reutilizables**
  - Desarrollar componentes básicos en components/ui: Button.jsx, Input.jsx, Spinner.jsx, Card.jsx, Modal.jsx con estilos consistentes

- [✅] **Crear componentes de Layout**
  - Implementar Navbar.jsx, Footer.jsx y MainLayout.jsx para la estructura general de las páginas públicas

- [✅] **Desarrollar páginas públicas**
  - Crear HomePage.jsx (landing), LoginPage.jsx (formulario login), RegisterPage.jsx (formulario registro) y JoinPage.jsx (unirse con código)

---

## Fase 3: Lógica de Negocio ✅

- [✅] **Implementar servicios de Firestore**
  - Crear firestore.service.js con funciones para CRUD de natilleras, miembros y aportes: createNatillera(), getNatilleras(), getUserNatilleras(), addMiembro(), createAporte(), updateAporte(), confirmAporte(), rejectAporte(), etc.

- [✅] **Desarrollar DashboardPage**
  - Crear la página principal privada que muestre la lista de natilleras del usuario con opción de crear nueva o unirse a una existente

- [✅] **Crear flujo de creación de Natillera**
  - Implementar CreateNatilleraPage.jsx con formulario para: nombre, monto, periodicidad, fechas. Generar código de invitación único y registrar al admin como primer miembro

---

## Fase 4: Funcionalidades Core ✅

- [✅] **Desarrollar página de detalle de Natillera**
  - Crear NatilleraDetailPage.jsx que muestre información del grupo, total ahorrado, lista de miembros y sus aportes

- [✅] **Implementar vista de Miembro**
  - Crear MemberView.jsx con funcionalidad para reportar pagos, ver historial propio de aportes (pendientes/confirmados/rechazados) y dashboard del grupo

- [✅] **Implementar vista de Admin**
  - Crear AdminView.jsx con sección de pagos pendientes, botón para confirmar/rechazar aportes (con motivo), gestión completa del grupo y código de invitación visible con copia al portapapeles

- [✅] **Crear flujo de unirse a Natillera**
  - Implementar la lógica en JoinPage.jsx para validar código de invitación, verificar que el usuario no esté ya en el grupo y registrarlo como miembro

- [✅] **Implementar actualización en tiempo real**
  - Usar listeners de Firestore (onSnapshot) para que los cambios de estado de aportes y totales se reflejen automáticamente en todos los usuarios conectados

---

## Fase 5: Refinamiento 🔄

- [✅] **Crear ProfilePage**
  - Desarrollar página de perfil del usuario donde pueda ver y editar su información básica (nombre, foto), cambiar contraseña

- [✅] **Implementar utilidades y helpers**
  - Crear funciones en utils/formatters.js para formatear fechas, montos en pesos colombianos, validaciones, generador de códigos únicos, nombres de meses

- [✅] **Crear sistema de modales personalizado**
  - Implementar useModal.jsx con useAlert y useConfirm para reemplazar alert() y confirm() nativos
  - Implementar useToast.jsx para notificaciones no invasivas
  - Crear componente Modal.jsx base reutilizable
  - Documentar uso en docs/MODALES.md

- [✅] **Sistema de reportes completo**
  - Crear ReportsPage.jsx con filtros avanzados (socio, estado, mes, rango de fechas)
  - Implementar reports.service.js con getReportData() y funciones de exportación
  - Exportación a PDF con diseño profesional (encabezados, estadísticas, tablas coloreadas)
  - Exportación a Excel con 3 hojas (Resumen, Aportes, Por Socio)
  - Exportación a CSV con UTF-8 BOM
  - Agregar ruta /reportes/:natilleraId protegida

- [ ] **Agregar manejo de errores global**
  - Crear componente ErrorBoundary para errores no controlados
  - Mejorar mensajes de error en servicios de Firebase
  - Agregar validaciones de formularios más robustas

- [🔄] **Estilizar la aplicación**
  - Aplicar estilos CSS consistentes (Tailwind) ✅
  - Hacer la app responsive ✅
  - Agregar transiciones y feedback visual (spinner, loading states) ✅
  - Mejorar animaciones de modales y toasts ✅
  - Refinamientos de UX pendientes

---

## Fase 6: Extras y Deploy 📋

- [ ] **Implementar gráficos estadísticos**
  - Instalar recharts: `npm install recharts`
  - Crear gráficos en ReportsPage: evolución mensual, distribución por socio, tasa de confirmación
  - Agregar gráfico de resumen en DashboardPage

- [ ] **Implementar Storage (v2)**
  - Crear storage.service.js para subir comprobantes de pago
  - Agregar funcionalidad en reportar pago para adjuntar imagen
  - Mostrar comprobantes en AdminView para validación

- [ ] **Funcionalidades adicionales**
  - Notificaciones push cuando hay pagos pendientes (Firebase Cloud Messaging)
  - Historial de cambios en aportes (audit log)
  - Exportar código QR de invitación
  - Modo oscuro (dark mode)
  - Calculadora de natillera (proyecciones)

- [ ] **Testing y corrección de bugs**
  - Probar todos los flujos principales
  - Validar edge cases (natillera sin miembros, sin aportes, fechas límite)
  - Corregir bugs encontrados
  - Testing de rendimiento con datos grandes

- [ ] **Configurar Firestore Security Rules**
  - ⚠️ **ALTA PRIORIDAD** - Actualmente en modo test
  - Definir reglas: solo admins pueden confirmar/rechazar pagos
  - Usuarios solo pueden ver sus natilleras
  - Validación de permisos por rol
  - Validación de estructura de datos

- [ ] **Deploy en Firebase Hosting**
  - Configurar firebase.json para hosting
  - Hacer build de producción con Vite: `npm run build`
  - Deployar la app: `firebase deploy`
  - Configurar dominio personalizado (opcional)
  - Configurar variables de entorno de producción

---

## Notas de Progreso

- **Fecha de inicio:** 16 de noviembre de 2025
- **Última actualización:** 16 de noviembre de 2025
- **Estado general:** Fase 5 (Refinamiento) - 80% completado

### Funcionalidades Core Implementadas ✅
- ✅ Sistema de autenticación completo (Email/Password, Google)
- ✅ Gestión de natilleras (crear, listar, detalle)
- ✅ Sistema de aportes (reportar, confirmar, rechazar con motivo)
- ✅ Roles diferenciados (Admin/Miembro)
- ✅ Actualización en tiempo real (Firestore listeners)
- ✅ Sistema de reportes con filtros y exportación (PDF, Excel, CSV)
- ✅ Sistema de modales personalizado
- ✅ Perfil de usuario editable
- ✅ Código de invitación con copia al portapapeles
- ✅ Contador de miembros por natillera
- ✅ Redirección automática después de logout

### Próximos Pasos Prioritarios
1. **Gráficos estadísticos** con recharts (visualización de datos)
2. **Firestore Security Rules** (seguridad para producción) ⚠️
3. **Testing completo** de todos los flujos
4. **Deploy a producción** en Firebase Hosting

### Mejoras Técnicas Recientes
- Instaladas versiones estables de jsPDF (2.5.2) y jspdf-autotable (3.8.3)
- Sistema de reportes con diseño profesional en PDF y Excel
- Manejo robusto de Firestore Timestamps en exportaciones
- Hooks personalizados para modales y toasts

### Deuda Técnica
- Firestore en modo test (sin security rules) ⚠️
- Falta ErrorBoundary global
- Sin testing automatizado
- Sin optimizaciones de rendimiento (lazy loading, code splitting)
