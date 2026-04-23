# Full Application Example

Proyecto full stack con:

1. Backend Django
2. Frontend React (CRA + TypeScript)
3. PostgreSQL
4. Orquestación con Docker Compose

## Requisitos

1. Docker
2. Docker Compose (plugin `docker compose`)
3. Make (opcional, para atajos)

## Levantar el proyecto con Docker Compose

### Opción 1: usando Makefile (recomendado)

```bash
make build
make up
```

Servicios disponibles:

1. Frontend: http://localhost:3000
2. Backend API: http://localhost:8000/api
3. PostgreSQL: localhost:5432

## Endpoints del Frontend y Backend

### Frontend (rutas de la app)

Base URL frontend: `http://localhost:3000`

1. `GET /login` - pantalla de inicio de sesión
2. `GET /dashboard` - panel principal (protegido)
3. `GET /courses` - gestión/listado de cursos (protegido)
4. `GET /grades` - gestión/listado de notas (protegido)
5. `GET /admin` - panel de administración (solo rol admin)

### Backend (API)

Base URL backend: `http://localhost:8000/api`

Auth (`/api/auth`):

1. `POST /auth/login/` - iniciar sesión
2. `POST /auth/logout/` - cerrar sesión
3. `GET /auth/me/` - usuario autenticado actual
4. `GET /auth/users/?role=student|teacher|admin` - listar usuarios por rol

Courses (`/api/courses`):

1. `GET /courses/` - listar cursos según permisos
2. `POST /courses/` - crear curso (admin)
3. `GET /courses/<course_id>/` - detalle de curso
4. `PUT /courses/<course_id>/` - actualizar curso (admin/profesor asignado)
5. `DELETE /courses/<course_id>/` - eliminar curso (admin/profesor asignado)
6. `POST /courses/<course_id>/enroll/` - matricular alumno en curso
7. `GET /courses/my-courses/` - cursos del usuario actual

Grades (`/api/grades`):

1. `GET /grades/` - listar notas según rol
2. `POST /grades/` - crear/actualizar nota de alumno en curso
3. `GET /grades/<grade_id>/` - detalle de nota
4. `PUT /grades/<grade_id>/` - actualizar nota
5. `DELETE /grades/<grade_id>/` - eliminar nota
6. `GET /grades/course/<course_id>/` - notas por curso

### Opción 2: usando Docker Compose directamente

```bash
docker compose build
docker compose up
```

Para correr en segundo plano:

```bash
docker compose up -d
```

## Comandos útiles del Makefile

```bash
make help
make build
make up
make down
make logs
make backend-shell
make frontend-shell
make test
make lint
```

Qué hace cada comando:

1. `make build`: construye imágenes
2. `make up`: levanta servicios
3. `make down`: detiene y elimina contenedores
4. `make logs`: muestra logs en tiempo real
5. `make backend-shell`: abre shell en backend
6. `make frontend-shell`: abre shell en frontend
7. `make test`: ejecuta tests del backend
8. `make lint`: ejecuta Ruff en backend

## Flujo recomendado de desarrollo

1. Construir y levantar:

```bash
make build
make up
```

2. Ver logs si algo falla:

```bash
make logs
```

3. Ejecutar validaciones:

```bash
make lint
make test
```

4. Apagar servicios:

```bash
make down
```

## Levantar el proyecto sin Docker

### 1) Backend (Django + uv)

Desde la carpeta `backend`:

```bash
cd backend
uv sync --dev
```

Configura variables de entorno (por ejemplo en un archivo `.env` dentro de `backend/`):

```env
DEBUG=True
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=gradesdb
DB_USER=your_user
DB_PASSWORD=your_db_pass
```

Ejecuta migraciones y levanta el servidor:

```bash
uv run python manage.py migrate
uv run python manage.py runserver 0.0.0.0:8000
```

### 2) Base de datos PostgreSQL

Puedes usar PostgreSQL local ya instalado o levantar solo la base con Docker:

```bash
docker compose up -d db
```

### 3) Frontend (React)

Desde la carpeta `frontend`:

```bash
cd frontend
npm install
```

Configura la URL del backend (archivo `.env` en `frontend/`):

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Levanta el frontend:

```bash
npm start
```

### 4) Validaciones locales

Backend:

```bash
cd backend
uv run ruff check .
uv run python manage.py test
```

Frontend:

```bash
cd frontend
npm run lint
CI=true npm run test:ci
```

## Notas de configuración actual

1. El backend en Docker usa `uv` para ejecutar migraciones y servidor.
2. El frontend usa `npm start` (Create React App).
3. La variable del frontend para API es `REACT_APP_API_URL`.
4. La base de datos en Docker se conecta por `DB_HOST=db`.

## Variables de entorno del backend

Si levantas todo con `docker compose`, usa:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=gradesdb
DB_USER=postgres
DB_PASSWORD=postgres
```

Si ejecutas el backend sin Docker (PostgreSQL local), usa:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=gradesdb
DB_USER=your_user
DB_PASSWORD=your_db_pass
```
