FROM node:12.16.3-alpine as build

WORKDIR /app

# Build your application (if required)

COPY ./ /app/
RUN npm install
RUN ls
RUN npm run build
RUN ls
FROM fholzer/nginx-brotli:v1.12.2

WORKDIR /etc/nginx
ADD nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist/ /usr/share/nginx/html
EXPOSE 8082

CMD ["nginx", "-g", "daemon off;"]
