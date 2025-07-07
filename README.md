# EV-4-Front - Sistema de Gestión de Empresas

## Funcionalidades Implementadas para Empresas

### 1. Edición de Perfil de Empresa

- **Ubicación**: `/company/home`
- **Funcionalidades**:
  - Editar nombre de la empresa
  - Editar comuna
  - Editar dirección
  - Los campos de correo y RUT no son editables
  - Guardado automático en Firebase Firestore
  - Validación de formulario

### 2. Gestión de Productos

- **Ubicación**: `/company/add-product`
- **Funcionalidades**:
  - Agregar nuevos productos con:
    - Nombre del producto
    - Descripción (máximo 300 caracteres)
    - Cantidad
    - Precio
    - Fecha de vencimiento
    - Estado automático (disponible, por vencer, vencido)
  - Visualizar productos existentes
  - Filtros por:
    - Estado (disponible, por vencer, vencido)
    - Nombre del producto
  - Paginación (5, 10, 15 productos por página)
  - Botón para volver al perfil

### 3. Gestión de Solicitudes

- **Ubicación**: `/company/requests`
- **Funcionalidades**:
  - Ver solicitudes de productos de clientes
  - Información detallada de cada solicitud:
    - Datos del cliente
    - Producto solicitado
    - Cantidad solicitada
    - Fecha de solicitud
    - Estado actual
  - Aprobar o rechazar solicitudes pendientes
  - Filtros por estado (pendiente, aprobada, rechazada)
  - Paginación (5, 10, 15 solicitudes por página)
  - Botón para volver al perfil

### 4. Navegación y Autenticación Mejorada

- **Sidebars específicos por tipo de usuario**:
  - `CompanySidebar` - Solo para empresas
  - `ClientSidebar` - Solo para clientes
  - `AdminSidebar` - Solo para administradores
- **Protección de rutas mejorada**:
  - Verificación de tipo de usuario en cada ruta
  - Redirección automática según el rol del usuario
  - Prevención de acceso cruzado entre diferentes tipos de usuario
- **Login inteligente**:
  - Detección automática del tipo de usuario
  - Redirección a la página de login correcta
  - Mensajes informativos sobre el tipo de usuario

## Seguridad y Control de Acceso

### Sistema de Autenticación

- **Verificación de roles**: Cada usuario es verificado en su colección correspondiente
- **Redirección inteligente**: Los usuarios son redirigidos a su área correspondiente
- **Protección de rutas**: Cada ruta está protegida según el tipo de usuario

### Tipos de Usuario

1. **Administradores** (`/admin/*`)

   - Acceso a panel de administración
   - Gestión de empresas, clientes y productos
   - Dashboard administrativo

2. **Empresas** (`/company/*`)

   - Edición de perfil
   - Gestión de productos
   - Gestión de solicitudes de clientes

3. **Clientes** (`/client/*`)
   - Ver productos disponibles
   - Realizar solicitudes
   - Ver estado de sus solicitudes

## Estructura de Base de Datos

### Colección: `empresas`

```javascript
{
  uid: "string", // ID del usuario de Firebase Auth
  nombre: "string",
  comuna: "string",
  direccion: "string",
  email: "string",
  rut: "string"
}
```

### Colección: `productos`

```javascript
{
  empresaId: "string", // ID de la empresa
  nombre: "string",
  descripcion: "string", // máximo 300 caracteres
  cantidad: number,
  precio: number,
  fechaVencimiento: "date",
  estado: "string", // "disponible", "por vencer", "vencido"
  fechaCreacion: "timestamp"
}
```

### Colección: `solicitudes`

```javascript
{
  empresaId: "string", // ID de la empresa
  clienteId: "string", // ID del cliente
  productoId: "string", // ID del producto
  cantidadSolicitada: number,
  estado: "string", // "pendiente", "aprobada", "rechazada"
  fechaSolicitud: "timestamp",
  fechaRespuesta: "timestamp" // opcional
}
```

### Colección: `clientes`

```javascript
{
  uid: "string", // ID del usuario de Firebase Auth
  nombre: "string",
  email: "string",
  // otros campos del cliente
}
```

### Colección: `admins`

```javascript
{
  uid: "string", // ID del usuario de Firebase Auth
  email: "string",
  // otros campos del administrador
}
```

## Componentes de Navegación

### CompanySidebar

- Navegación específica para empresas
- Acceso a perfil, productos y solicitudes
- Cerrar sesión integrado

### ClientSidebar

- Navegación específica para clientes
- Acceso a productos y solicitudes
- Cerrar sesión integrado

### AdminSidebar

- Navegación específica para administradores
- Acceso a gestión de empresas, clientes y productos
- Cerrar sesión integrado

## Tecnologías Utilizadas

- React 18
- React Router DOM
- Firebase Authentication
- Firebase Firestore
- Bootstrap 5
- Vite

## Instalación y Ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar en modo desarrollo:

```bash
npm run dev
```

3. Abrir en el navegador:

```
http://localhost:5173
```

## Notas Importantes

- Todas las funcionalidades están integradas con Firebase
- La validación de estados de productos es automática basada en la fecha de vencimiento
- El sistema maneja errores y muestra mensajes informativos al usuario
- La interfaz es responsive y utiliza Bootstrap para el diseño
- **Seguridad mejorada**: Cada tipo de usuario solo puede acceder a sus páginas correspondientes
- **Navegación inteligente**: Los usuarios son redirigidos automáticamente según su rol
