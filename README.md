# DailyJuggernaut

Full-stack app (Django REST API + React/Vite frontend).
to see the project : thedailyjuggernaut-1.onrender.com 

## Structure
- `backend/` — Django API (DRF, JWT, CORS, WhiteNoise)
- `frontend/` — React (Vite)

## Prerequisites
- Python 3.11+
- Node 18+
- PostgreSQL (for local DB) or credentials to a hosted Postgres

## Environment Variables
Create env files from the provided examples and fill values:
- Backend: copy `backend/.env.example` to `backend/.env`
- Frontend: copy `frontend/.env.example` to `frontend/.env`

### Backend `.env`
- SECRET_KEY — Django secret key
- DEBUG — `True` or `False`
- ALLOWED_HOSTS — comma-separated hosts
- CORS_ALLOWED_ORIGINS — comma-separated origins with scheme
- CSRF_TRUSTED_ORIGINS — comma-separated origins with scheme
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT — Postgres connection

### Frontend `.env`
- VITE_API_URL — base URL of the backend API (e.g. http://localhost:8000 or your Render URL)

## Local Development
### Backend
```
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
Static files are served by Django/WhiteNoise in dev; uploads go to `backend/media/`.

### Frontend
```
cd frontend
npm install
npm run dev
```

## Deployment (Render)
### Backend (Web Service)
- Root Directory: `backend/`
- Build Command:
  ```
  pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
  ```
- Start Command:
  ```
  gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --log-file -
  ```
- Set env vars in Render (at minimum): `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and DB vars.

### Frontend (Static Site)
- Root Directory: `frontend/`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_API_URL` pointing to the backend URL
- Add a rewrite rule `/* -> /index.html` for SPA routing

## Notes
- Media uploads in production require persistent storage (S3/Cloudinary). Local `media/` is not persistent on PaaS.
- Default DRF permissions are `IsAuthenticated`; public endpoints include register/login.
