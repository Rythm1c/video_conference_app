FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=whiteboard_backend.settings

# System deps
RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy code
COPY . .

# Collect static (if you serve any)
RUN python manage.py collectstatic --noinput

EXPOSE 8000
# Start Daphne for ASGI (handles HTTP + WS)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "whiteboard_backend.asgi:application"]