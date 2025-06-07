# ---------- Dockerfile ----------

# 1. Build React
FROM node:18-alpine AS react-build
WORKDIR /app/react
COPY whiteboard-frontend/package*.json ./
RUN npm install
COPY whiteboard-frontend/ .
RUN npm run build

# 2. Build Django
FROM python:3.11-slim AS django-build
WORKDIR /app/backend

# Install system deps for psycopg2, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy Django app code
COPY ./ ./

# Copy React build into Django static
RUN mkdir -p static/react
COPY --from=react-build /app/react/dist/ static/react/

# Expose port
EXPOSE 8000

# Environment variables (can override in host)
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=whiteboard_backend.settings

# Run migrations, collectstatic, and launch Daphne
CMD ["sh", "-c", "\
    python manage.py makemigrations && \
    python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    daphne -b 0.0.0.0 -p 8000 whiteboard_backend.asgi:application \
    "]
# --------------------------------
