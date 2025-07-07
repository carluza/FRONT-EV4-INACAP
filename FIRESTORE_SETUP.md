# Configuración de Firestore

## Reglas de Seguridad

Para que la aplicación funcione correctamente, necesitas configurar las reglas de seguridad en Firebase Console.

### Pasos para configurar las reglas:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Firestore Database
4. Haz clic en "Rules"
5. Reemplaza las reglas existentes con las siguientes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para productos
    match /productos/{productoId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.empresaId ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
         exists(/databases/$(database)/documents/empresas/$(request.auth.uid)));
    }

    // Reglas para empresas
    match /empresas/{empresaId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == empresaId ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }

    // Reglas para clientes
    match /clientes/{clienteId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == clienteId ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }

    // Reglas para admins
    match /admins/{adminId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == adminId;
    }
  }
}
```

6. Haz clic en "Publish"

### Índices necesarios

También necesitas crear los siguientes índices en Firestore:

1. Ve a la pestaña "Indexes"
2. Crea un índice compuesto para la colección "productos":
   - Fields: empresaId (Ascending), fechaCreacion (Descending)
   - Query scope: Collection

### Solución de problemas comunes

Si sigues teniendo problemas:

1. **Error de permisos**: Verifica que las reglas estén publicadas correctamente
2. **Error de índices**: Crea los índices necesarios o espera a que se construyan
3. **Error de autenticación**: Verifica que el usuario esté autenticado correctamente
4. **Error de datos**: Verifica que los documentos tengan la estructura correcta

### Estructura de datos esperada

Los productos deben tener esta estructura:

```javascript
{
  nombre: "Nombre del producto",
  descripcion: "Descripción del producto",
  cantidad: 10,
  precio: 100.50,
  fechaVencimiento: "2024-12-31",
  estado: "disponible",
  empresaId: "uid_de_la_empresa",
  fechaCreacion: Timestamp
}
```
