FROM node:12.16.3-alpine as build

WORKDIR /app

COPY . .

# Build your application (if required)

# ---

FROM fholzer/nginx-brotli:v1.12.2

WORKDIR /etc/nginx
ADD nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app /usr/share/nginx/html

EXPOSE 8082

CMD ["nginx", "-g", "daemon off;"]
