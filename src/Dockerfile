# Use Python 3.13 slim image for smaller size
FROM python:3.13-slim

# Set working directory
WORKDIR /workdir
COPY server/ server/
RUN pip install --no-cache-dir -r server/requirements.txt
COPY static/ static/


# Expose port (adjust if your server uses a different port)
EXPOSE 8000

# Run the Python server
CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "8000"]