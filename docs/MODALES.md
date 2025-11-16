# Sistema de Modales y Notificaciones - NatiApp

Este documento describe cómo usar el sistema de modales y notificaciones personalizadas en NatiApp.

## Componentes Disponibles

### 1. Modal Base (`Modal.jsx`)

Componente modal reutilizable para crear ventanas modales personalizadas.

**Props:**
- `isOpen` (boolean): Controla si el modal está visible
- `onClose` (function): Función a ejecutar al cerrar
- `title` (string): Título del modal
- `children` (node): Contenido del modal
- `size` ('sm' | 'md' | 'lg' | 'xl' | 'full'): Tamaño del modal
- `showCloseButton` (boolean): Mostrar botón X
- `closeOnOverlay` (boolean): Cerrar al hacer clic fuera
- `footer` (node): Contenido del footer

**Ejemplo:**
```jsx
import Modal from '../components/ui/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Mi Modal"
        size="md"
      >
        <p>Contenido del modal</p>
      </Modal>
    </>
  );
}
```

### 2. Hook useAlert

Hook para mostrar alertas con iconos y estilos personalizados.

**Tipos disponibles:**
- `success`: Éxito (verde)
- `error`: Error (rojo)
- `warning`: Advertencia (amarillo)
- `info`: Información (azul)

**Ejemplo:**
```jsx
import { useAlert } from '../hooks/useModal';

function MyComponent() {
  const { showAlert, AlertComponent } = useAlert();

  const handleAction = async () => {
    try {
      // Tu lógica aquí
      showAlert({
        title: '¡Éxito!',
        message: 'La operación se completó correctamente',
        type: 'success'
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'No se pudo completar la operación',
        type: 'error'
      });
    }
  };

  return (
    <>
      <button onClick={handleAction}>Ejecutar Acción</button>
      {AlertComponent}
    </>
  );
}
```

### 3. Hook useConfirm

Hook para mostrar diálogos de confirmación.

**Ejemplo:**
```jsx
import { useConfirm } from '../hooks/useModal';

function MyComponent() {
  const { showConfirm, ConfirmComponent } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: '¿Estás seguro?',
      message: 'Esta acción no se puede deshacer',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmed) {
      // Proceder con la eliminación
    }
  };

  return (
    <>
      <button onClick={handleDelete}>Eliminar</button>
      {ConfirmComponent}
    </>
  );
}
```

### 4. Hook useToast

Hook para mostrar notificaciones tipo toast (ligeras, temporales).

**Ejemplo:**
```jsx
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const { showToast, ToastContainer } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText('Texto copiado');
    showToast({
      message: 'Texto copiado al portapapeles',
      type: 'success',
      duration: 3000
    });
  };

  return (
    <>
      <button onClick={handleCopy}>Copiar</button>
      <ToastContainer />
    </>
  );
}
```

## Migración de alert() nativo

### Antes:
```jsx
alert('Operación exitosa');
alert('Error al guardar');
```

### Después:
```jsx
import { useAlert } from '../hooks/useModal';

function MyComponent() {
  const { showAlert, AlertComponent } = useAlert();

  const handleSave = async () => {
    try {
      // guardar...
      showAlert({
        title: '¡Guardado!',
        message: 'Los cambios se guardaron correctamente',
        type: 'success'
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'No se pudieron guardar los cambios',
        type: 'error'
      });
    }
  };

  return (
    <>
      {/* Tu componente */}
      {AlertComponent}
    </>
  );
}
```

## Migración de confirm() nativo

### Antes:
```jsx
if (confirm('¿Estás seguro?')) {
  // hacer algo
}
```

### Después:
```jsx
import { useConfirm } from '../hooks/useModal';

function MyComponent() {
  const { showConfirm, ConfirmComponent } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este elemento?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (confirmed) {
      // eliminar
    }
  };

  return (
    <>
      {/* Tu componente */}
      {ConfirmComponent}
    </>
  );
}
```

## Buenas Prácticas

1. **Siempre renderiza el componente de alerta/confirmación:**
   ```jsx
   return (
     <>
       {/* Tu JSX */}
       {AlertComponent}
       {ConfirmComponent}
     </>
   );
   ```

2. **Usa el tipo apropiado:**
   - `success`: Para acciones completadas exitosamente
   - `error`: Para errores que requieren atención
   - `warning`: Para advertencias importantes
   - `info`: Para información general

3. **Mensajes claros y concisos:**
   - Título: Breve y descriptivo
   - Mensaje: Explica qué pasó y qué hacer (si aplica)

4. **Toast vs Alert:**
   - Toast: Notificaciones ligeras, no críticas (ej: "Copiado")
   - Alert: Información importante que requiere reconocimiento

5. **Confirm vs Alert:**
   - Confirm: Cuando necesitas que el usuario tome una decisión
   - Alert: Solo para informar, sin requerir decisión

## Componentes ya migrados

- ✅ ReportsPage
- ✅ AdminView
- ✅ Exportación de reportes (PDF, Excel, CSV)

## Pendientes de migración

Si encuentras `alert()` o `confirm()` nativos en el código, reemplázalos usando los hooks documentados aquí.
