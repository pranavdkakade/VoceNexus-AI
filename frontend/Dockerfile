# Multi-stage Dockerfile for React Frontend
FROM node:22-alpine as build-stage

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Nginx production stage for static frontend
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
