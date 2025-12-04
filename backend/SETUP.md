# Guía Paso a Paso: Configuración de PostgreSQL con TypeScript

Esta guía te ayudará a configurar la conexión a PostgreSQL paso a paso.

## Paso 1: Instalar PostgreSQL

Si aún no tienes PostgreSQL instalado:

1. **Windows**: Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Durante la instalación, anota la contraseña del usuario `postgres`
3. Asegúrate de que el servicio de PostgreSQL esté corriendo

## Paso 2: Crear la Base de Datos

Abre una terminal o el cliente de PostgreSQL (pgAdmin) y ejecuta:

```sql
CREATE DATABASE my_store_db;
```

O desde la línea de comandos:

```bash
psql -U postgres
CREATE DATABASE my_store_db;
\q
```

## Paso 3: Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y actualiza los valores:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=my_store_db
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_real_aqui
   DB_SSL=false
   PORT=3000
   ```

## Paso 4: Crear las Tablas

Ejecuta el script SQL para crear las tablas:

**Opción 1: Desde psql**
```bash
psql -U postgres -d my_store_db -f backend/database/schema.sql
```

**Opción 2: Desde pgAdmin**
- Abre pgAdmin
- Conéctate a tu servidor
- Selecciona la base de datos `my_store_db`
- Abre la herramienta de Query
- Copia y pega el contenido de `backend/database/schema.sql`
- Ejecuta el script

## Paso 5: Instalar Dependencias (si no lo has hecho)

```bash
npm install
```

## Paso 6: Ejecutar el Servidor

En modo desarrollo (con hot reload):

```bash
npm run dev:server
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📊 Verificando conexión a PostgreSQL...
✅ Conexión a PostgreSQL exitosa: [fecha y hora]
```

## Paso 7: Probar la API

Abre otra terminal y prueba los endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Obtener productos
curl http://localhost:3000/api/products

# Crear un producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Product\",\"price\":29.99,\"stock\":10}"
```

## Solución de Problemas

### Error: "password authentication failed"
- Verifica que la contraseña en `.env` sea correcta
- Asegúrate de que el usuario `postgres` existe

### Error: "database does not exist"
- Crea la base de datos siguiendo el Paso 2

### Error: "relation 'products' does not exist"
- Ejecuta el script SQL del Paso 4

### Error de conexión desde React Native
- En lugar de `localhost`, usa la IP de tu máquina
- Ejemplo: `http://192.168.1.100:3000`
- Asegúrate de que el firewall permita conexiones en el puerto 3000

## Próximos Pasos

1. Implementar autenticación con Firebase Auth
2. Agregar más tablas según tus necesidades
3. Implementar validación más robusta
4. Agregar tests unitarios e integración

