# Proyecto: NatiApp (Especificación Técnica)

## 1. Concepto Central (MVP)

La aplicación **"NatiApp"** no es una pasarela de pagos. Es un **libro contable social y transparente** diseñado para digitalizar y formalizar la confianza de las "natilleras" tradicionales.

* **Problema que soluciona:** El desorden de los grupos de WhatsApp, los Excel compartidos, la falta de transparencia sobre quién ha pagado y la carga manual del tesorero.
* **Solución (MVP):** Una aplicación web donde un "Administrador" crea un grupo (natillera) y los "Miembros" reportan sus pagos. El Administrador los valida manualmente (revisando su cuenta bancaria personal) y marca el pago como "recibido" en la app, actualizando el estado para todos los miembros en tiempo real.

---

## 2. Roles de Usuario

La aplicación se estructura en dos roles principales:

### Administrador (Tesorero)

* **Puede** crear una "Natillera".
* **Define** las reglas del grupo: nombre, monto de la cuota, periodicidad (mensual/quincenal), fecha de inicio y fecha de fin.
* **Genera** un enlace de invitación único para su grupo.
* **Valida** los pagos reportados: Ve una lista de pagos "pendientes" y los puede marcar como "confirmados".
* **Ve** el dashboard completo del grupo (total ahorrado, pagos por miembro).

### Miembro (Aportante)

* **Puede** unirse a una Natillera existente usando un enlace de invitación.
* **No puede** crear natilleras (en el MVP).
* **Reporta** sus pagos (ej: "Pagué la cuota de Noviembre").
* **(Opcional v2)** Sube un comprobante (pantallazo) de la transferencia.
* **Ve** el dashboard del grupo (total ahorrado) y su propio historial de pagos (pendientes vs. confirmados).

---

## 3. Stack Técnico y Servicios de Firebase

* **Front-end:** React (con Vite)
* **Enrutador:** React Router
* **Back-end & DB:** Firebase

Utilizaremos los siguientes servicios de Firebase:

1.  **Firebase Authentication:**
    * Para el login y registro de usuarios.
    * Métodos: "Email/Contraseña" y "Google Sign-In".

2.  **Firestore (Base de Datos):**
    * El cerebro de la aplicación. Almacenará toda la información de usuarios, grupos y aportes.

3.  **Firebase Storage:**
    * (Opcional para el MVP, esencial para v2).
    * Para almacenar las imágenes de los comprobantes de pago subidos por los miembros.

4.  **Firebase Hosting:**
    * Para el despliegue y hosting de la aplicación de React.

---

## 4. Flujo Lógico Clave (User Stories)

### 1. Crear Natillera (Admin)
1.  El Admin llena un formulario (nombre, monto, etc.).
2.  **Acción:** Se crea el grupo en la base de datos y se genera un `codigoInvitacion` único.
3.  **Acción:** Se registra al Admin como el primer miembro (`rol: 'admin'`).
4.  El Admin es llevado al dashboard de su nueva natillera, donde ve el código para invitar.

### 2. Unirse a Natillera (Miembro)
1.  Un usuario (ya logueado) ingresa un `codigoInvitacion`.
2.  **Acción:** La app valida si ese código existe y si el usuario no pertenece ya al grupo.
3.  **Acción:** Se registra al usuario como nuevo miembro (`rol: 'miembro'`).
4.  El usuario es redirigido a su dashboard principal, donde ahora ve la nueva natillera en su lista.

### 3. Reportar Pago (Miembro)
1.  Un Miembro entra al detalle de su natillera.
2.  Da clic en "Reportar mi pago de [Mes Actual]".
3.  **Acción:** Se crea un nuevo registro de "aporte" en la base de datos con `estado: 'pendiente'`.
4.  La vista del miembro se actualiza a "Pago de [Mes] (Pendiente de confirmación)".

### 4. Validar Pago (Admin)
1.  El Admin entra al detalle de la natillera.
2.  Ve una sección o notificación de "Pagos Pendientes".
3.  Ve el aporte reportado por el Miembro.
4.  (El admin revisa su Nequi/Bancolombia en la vida real y confirma que recibió el dinero).
5.  Da clic en "Confirmar".
6.  **Acción:** Se actualiza el registro del "aporte" a `estado: 'confirmado'`.
7.  Automáticamente, el "Total Ahorrado" se actualiza para todos los miembros, y el estado de pago de ese miembro cambia a "Pagado".


## 5. Modelo de Datos (Arquitectura en Firestore)

La base de datos se compondrá de cuatro colecciones principales: `users`, `natilleras`, `miembros` y `aportes`.

### Colección: `users`

Almacena información pública y esencial del usuario. El ID de cada documento será el `uid` que provee Firebase Authentication.

*Documento (`[user.uid]`):*
```json
{
  "nombre": "Jaime Zapata",
  "email": "jaime@correo.com",
  "fotoURL": "http://.../foto.png"
}
```


### Colección: `natilleras`

Almacena la información de configuración de cada grupo o "natillera" creada.

*Documento ([natilleraId_autogenerado]):*
```json
{
  "nombre": "Natillera Familia Pérez 2025",
  "adminId": "[user.uid del creador]",
  "montoCuota": 50000,
  "periodicidad": "mensual",
  "fechaInicio": "Timestamp",
  "fechaFin": "Timestamp",
  "codigoInvitacion": "A4T8Y"
}
```


### Colección: `miembros`

Esta es una colección de "unión" (tabla intermedia) que vincula a los usuarios con las natilleras. Es fundamental para las relaciones de muchos-a-muchos y es mucho más escalable que guardar un array de miembros dentro del documento de la natillera.

*Documento ([miembroId_autogenerado]):*
```json
{
  "userId": "[user.uid]",
  "natilleraId": "[natilleraId]",
  "rol": "miembro" 
}
```

Nota: El creador del grupo (Admin) también tendrá un documento aquí, pero con "rol": "admin".


### Colección: `aportes`

Este es el libro contable. Cada documento representa un único pago reportado por un miembro. Esta es la colección más importante para la lógica de la aplicación.

*Documento ([aporteId_autogenerado]):*
```json
{
  "natilleraId": "[natilleraId]",
  "userId": "[user.uid del que paga]",
  "monto": 50000,
  "mesCuota": 11,
  "anioCuota": 2025,
  "fechaReporte": "Timestamp",
  "fechaConfirmacion": "Timestamp | null",
  "estado": "pendiente",
  "comprobanteURL": "http://.../storage.jpg | null"
}
```


## 6. Encarpetado

/NatiApp-Project/
├── public/               # Iconos, imágenes estáticas
├── src/
│   ├── assets/           # Fuentes, SVGs, imágenes (CSS)
│   │
│   ├── components/       # Componentes reutilizables (Botones, Inputs, Modals)
│   │   ├── ui/           # Componentes tontos (Presentacionales)
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Card.jsx
│   │   └── layout/       # Componentes de estructura
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       └── MainLayout.jsx  # Layout público (Navbar/Footer)
│   │
│   ├── context/          # Aquí irá tu AuthContext (useContext)
│   │   ├── AuthContext.jsx
│   │   └── AuthProvider.jsx
│   │
│   ├── hooks/            # Hooks personalizados
│   │   ├── useAuth.js      # Hook para consumir AuthContext (useContext(AuthContext))
│   │   └── useFirestore.js # (Opcional) Hook para queries de Firestore
│   │
│   ├── pages/            # Vistas principales (Ensamblan componentes)
│   │   ├── public/       # Vistas accesibles por todos
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── JoinPage.jsx      # (La de /unirse/:codigoInvitacion)
│   │   │
│   │   └── private/      # Vistas protegidas (Requieren Auth)
│   │       ├── DashboardPage.jsx
│   │       ├── CreateNatilleraPage.jsx
│   │       ├── NatilleraDetailPage/
│   │       │   ├── NatilleraDetailPage.jsx # Página principal
│   │       │   ├── AdminView.jsx         # Componente (lógica de admin)
│   │       │   └── MemberView.jsx        # Componente (lógica de miembro)
│   │       └── ProfilePage.jsx
│   │
│   ├── services/         # Lógica de negocio "pesada" (conexión a Firebase)
│   │   ├── firebase.config.js     # Configuración e inicialización de Firebase
│   │   ├── auth.service.js        # (login(), register(), logout())
│   │   ├── firestore.service.js   # (createNatillera(), getNatilleras(), addAporte())
│   │   └── storage.service.js     # (uploadComprobante())
│   │
│   ├── utils/            # Funciones helper (formatear fechas, validar)
│   │   └── formatters.js
│   │
│   ├── App.jsx           # Componente raíz (define el AuthProvider)
│   ├── main.jsx          # Punto de entrada (renderiza App)
│   └── router/
│       ├── AppRouter.jsx     # Contiene TODAS las rutas (BrowserRouter)
│       └── ProtectedRoute.jsx  # Componente que protege rutas privadas
│
├── .gitignore
├── firebase.json         # Configuración de hosting de Firebase
├── package.json
└── vite.config.js