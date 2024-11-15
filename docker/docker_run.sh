docker build -f Dockerfile -t calculator_frontend_image ../
docker rm -f calculator_frontend 2>/dev/null || true
docker run -d --name calculator_frontend -p 3000:3000 calculator_frontend_image