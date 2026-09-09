FROM python:3.12-slim
WORKDIR /app
COPY . .
ENV PORT=8080
ENV HELIXHOG_HOST=0.0.0.0
ENV DATA_DIR=/data
EXPOSE 8080
CMD ["python3", "helixhog/app.py"]
