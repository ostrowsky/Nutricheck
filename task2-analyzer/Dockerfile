# ============================================================
# Dockerfile для NutriCheck Analyzer
# Позволяет запускать скрипт в изолированном контейнере.
# ============================================================

# Используем официальный легковесный образ Python
FROM python:3.12-slim

# Настройки окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Рабочая директория в контейнере
WORKDIR /app

# Устанавливаем системные зависимости для работы сетевых запросов
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем Python-зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код и демонстрационные данные
COPY src/ ./src/
COPY main.py .
COPY data/ ./data/

# Создаем папку для вывода результатов работы
RUN mkdir -p output

# Настраиваем точку входа
ENTRYPOINT ["python", "main.py"]

# По умолчанию выводим справку (help)
CMD ["--help"]
