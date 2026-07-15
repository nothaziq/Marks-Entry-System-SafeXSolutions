FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Render (and similar PaaS platforms) inject a PORT env var and expect the
# container to bind to it. docker-compose.yml/.prod.yml override this CMD
# entirely with their own `command:`, so this default only takes effect on
# platforms that run the image as-is (e.g. Render) - PORT falls back to
# 8000 there too unless the platform sets it.
ENV PORT=8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
