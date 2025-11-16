# Todo List - NatiApp

## Fase 1: Configuración Base

### ✅ Tareas Completadas
- [ ✅ ] **Configurar Firebase en el proyecto**
  - Crear proyecto en Firebase Console, instalar dependencias (firebase), crear firebase.config.js con la configuración inicial y habilitar Authentication (Email/Password y Google), Firestore y Storage

- [ ✅ ] **Crear estructura de carpetas base**
  - Configurar la estructura completa: components/ui, components/layout, context, hooks, pages/public, pages/private, services, utils, router según la especificación del README

- [ ✅ ] **Implementar AuthContext y AuthProvider**
  - Crear el contexto de autenticación que maneje el estado del usuario logueado, crear AuthProvider para envolver la app y hook useAuth para consumir el contexto

- [ ✅ ] **Desarrollar servicios de autenticación**
  - Crear auth.service.js con funciones: login(), register(), loginWithGoogle(), logout() y getCurrentUser()

- [ ✅ ] **Configurar React Router y rutas**
  - Crear AppRouter.jsx con todas las rutas (públicas y privadas), implementar ProtectedRoute.jsx para proteger rutas que requieren autenticación

---

## Fase 2: Componentes Base

- [ ✅ ] **Crear componentes UI reutilizables**
  - Desarrollar componentes básicos en components/ui: Button.jsx, Input.jsx, Spinner.jsx, Card.jsx con estilos consistentes

- [ ] **Crear componentes de Layout**
  - Implementar Navbar.jsx, Footer.jsx y MainLayout.jsx para la estructura general de las páginas públicas

- [ ] **Desarrollar páginas públicas**
  - Crear HomePage.jsx (landing), LoginPage.jsx (formulario login), RegisterPage.jsx (formulario registro) y JoinPage.jsx (unirse con código)

---

## Fase 3: Lógica de Negocio

- [ ] **Implementar servicios de Firestore**
  - Crear firestore.service.js con funciones para CRUD de natilleras, miembros y aportes: createNatillera(), getNatilleras(), getUserNatilleras(), addMiembro(), createAporte(), updateAporte(), etc.

- [ ] **Desarrollar DashboardPage**
  - Crear la página principal privada que muestre la lista de natilleras del usuario con opción de crear nueva o unirse a una existente

- [ ] **Crear flujo de creación de Natillera**
  - Implementar CreateNatilleraPage.jsx con formulario para: nombre, monto, periodicidad, fechas. Generar código de invitación único y registrar al admin como primer miembro

---

## Fase 4: Funcionalidades Core

- [ ] **Desarrollar página de detalle de Natillera**
  - Crear NatilleraDetailPage.jsx que muestre información del grupo, total ahorrado, lista de miembros y sus aportes

- [ ] **Implementar vista de Miembro**
  - Crear MemberView.jsx con funcionalidad para reportar pagos, ver historial propio de aportes (pendientes/confirmados) y dashboard del grupo

- [ ] **Implementar vista de Admin**
  - Crear AdminView.jsx con sección de pagos pendientes, botón para confirmar aportes, gestión completa del grupo y código de invitación visible

- [ ] **Crear flujo de unirse a Natillera**
  - Implementar la lógica en JoinPage.jsx para validar código de invitación, verificar que el usuario no esté ya en el grupo y registrarlo como miembro

- [ ] **Implementar actualización en tiempo real**
  - Usar listeners de Firestore (onSnapshot) para que los cambios de estado de aportes y totales se reflejen automáticamente en todos los usuarios conectados

---

## Fase 5: Refinamiento

- [ ] **Crear ProfilePage**
  - Desarrollar página de perfil del usuario donde pueda ver y editar su información básica (nombre, foto)

- [ ] **Implementar utilidades y helpers**
  - Crear funciones en utils/formatters.js para formatear fechas, montos en pesos colombianos, validaciones, generador de códigos únicos

- [ ] **Agregar manejo de errores**
  - Implementar try-catch en servicios, mostrar mensajes de error amigables al usuario, crear componente ErrorBoundary si es necesario

- [ ] **Estilizar la aplicación**
  - Aplicar estilos CSS consistentes, hacer la app responsive, agregar transiciones y feedback visual para mejor UX

---

## Fase 6: Extras y Deploy

- [ ] **Implementar Storage (opcional v2)**
  - Crear storage.service.js para subir comprobantes de pago, agregar funcionalidad en reportar pago para adjuntar imagen

- [ ] **Testing y corrección de bugs**
  - Probar todos los flujos principales, validar edge cases, corregir bugs encontrados, verificar seguridad de Firestore Rules

- [ ] **Configurar Firestore Security Rules**
  - Definir reglas de seguridad para que solo admins puedan confirmar pagos, usuarios solo vean sus natilleras, etc.

- [ ] **Deploy en Firebase Hosting**
  - Configurar firebase.json, hacer build de producción con Vite, deployar la app en Firebase Hosting

---

## Notas de Progreso

- **Fecha de inicio:** 16 de noviembre de 2025
- **Última actualización:** 16 de noviembre de 2025
- **Estado general:** En inicio
