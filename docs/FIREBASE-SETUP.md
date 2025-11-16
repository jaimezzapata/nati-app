# Configuración de Firebase - Pasos Completados

## ✅ Pasos Realizados

1. **Proyecto creado en Firebase Console:** `nati-app`
2. **Firebase SDK instalado:** `npm install firebase`
3. **Archivo de configuración creado:** `src/services/firebase.config.js`
4. **Variables de entorno creadas:** `.env.local` (protegido en .gitignore)
5. **Servicios inicializados:** Authentication, Firestore, Storage

---

## 🔧 Pasos Pendientes en Firebase Console

### 1. Habilitar Authentication

Ve a **Firebase Console → Authentication → Sign-in method** y habilita:

- ✅ **Email/Password**
  - Clic en "Email/Password"
  - Activar el switch
  - Guardar

- ✅ **Google Sign-In**
  - Clic en "Google"
  - Activar el switch
  - Seleccionar un email de soporte del proyecto
  - Guardar

### 2. Configurar Firestore Database

Ya está creada, pero verifica las reglas iniciales:

Ve a **Firestore Database → Rules** y asegúrate de tener modo de prueba (temporalmente):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 16);
    }
  }
}
```

> ⚠️ **IMPORTANTE:** Estas reglas son temporales para desarrollo. Más adelante configuraremos reglas de seguridad apropiadas.

### 3. Habilitar Storage

Ve a **Storage → Get Started** y activa el servicio con las reglas por defecto.

---

## 📂 Estructura Creada

```
src/
  services/
    firebase.config.js    ✅ Configuración e inicialización de Firebase
.env.local                ✅ Variables de entorno (NO se sube a GitHub)
```

---

## 🚀 Siguiente Paso

Una vez hayas habilitado Authentication (Email/Password y Google) en la consola de Firebase, podemos continuar con:

- **Tarea 2:** Crear estructura de carpetas base
- **Tarea 3:** Implementar AuthContext y AuthProvider

---

## 📝 Notas Importantes

- El archivo `.env.local` está protegido por `.gitignore` (*.local)
- Las API Keys de Firebase son seguras para uso público en el frontend
- La seguridad real se maneja con Firebase Security Rules (configuraremos más adelante)
- Si trabajas en equipo, cada desarrollador debe crear su propio `.env.local`
