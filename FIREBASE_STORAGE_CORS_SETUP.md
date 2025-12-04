# Configuración de CORS para Firebase Storage

## Problema

Estás viendo errores `CORS Preflight Did Not Succeed` cuando intentas subir imágenes a Firebase Storage desde tu app React Native.

## Solución: Configurar CORS en Firebase Storage

### Opción 1: Usando gsutil (Recomendado)

1. **Instala Google Cloud SDK** (si no lo tienes):
   - Descarga desde: https://cloud.google.com/sdk/docs/install
   - O instala con: `npm install -g @google-cloud/storage`

2. **Autentícate con Google Cloud**:
   ```bash
   gcloud auth login
   ```

3. **Configura tu proyecto**:
   ```bash
   gcloud config set project miyayita-store
   ```

4. **Aplica la configuración CORS**:
   ```bash
   gsutil cors set firebase-storage-cors.json gs://miyayita-store.appspot.com
   ```

5. **Verifica la configuración**:
   ```bash
   gsutil cors get gs://miyayita-store.appspot.com
   ```

### Opción 2: Usando la Consola de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `miyayita-store`
3. Ve a **Storage** en el menú lateral
4. Haz clic en la pestaña **Rules**
5. En la parte superior, busca la opción de **CORS** (puede estar en configuración avanzada)
6. O usa la consola de Google Cloud:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Selecciona tu proyecto
   - Ve a **Cloud Storage** > **Buckets**
   - Selecciona `miyayita-store.appspot.com`
   - Ve a la pestaña **Configuration**
   - Busca **CORS** y configura manualmente

### Opción 3: Configuración Manual en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/storage/browser)
2. Selecciona tu bucket: `miyayita-store.appspot.com`
3. Haz clic en **Edit bucket CORS configuration**
4. Pega el siguiente JSON:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
```

5. Guarda los cambios

## Nota de Seguridad

⚠️ **Importante**: La configuración con `"origin": ["*"]` permite requests desde cualquier origen. Para producción, deberías especificar solo los orígenes permitidos:

```json
[
  {
    "origin": [
      "http://localhost:8081",
      "http://localhost:19006",
      "exp://localhost:19000",
      "https://tu-dominio.com"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
```

## Verificar que Funciona

Después de aplicar la configuración:

1. Espera unos minutos para que los cambios se propaguen
2. Intenta subir una imagen desde tu app
3. Los errores de CORS deberían desaparecer

## Alternativa: Subir Imágenes a través del Backend

Si prefieres una solución más segura, puedes subir las imágenes a través de tu backend Express en lugar de directamente desde el cliente. Esto requiere:

1. Crear un endpoint en tu backend para recibir imágenes
2. El backend sube la imagen a Firebase Storage usando las credenciales del servidor
3. El backend devuelve la URL de la imagen

¿Quieres que implemente esta solución alternativa?

