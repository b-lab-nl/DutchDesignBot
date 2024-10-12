# Use the official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --no-dev

# Copy your application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Copy the .env
COPY .env .
# Run the application
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8080", "--log-level", "debug"]
