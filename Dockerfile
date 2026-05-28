# Budowanie
FROM node:20-alpine AS builder

WORKDIR /app

# kopia potrzebnych plikow do instalacji zaleznosci (docker cache'uje warstwe instalacji zaleznosci)
COPY package*.json ./
# npm ci szybszy od npm install; only production pomija devDependencies
RUN npm ci

# kopia reszty kodu po instalacji zaleznosci, aby nie popsuc cache'a przy zmianie kodu
COPY . .


FROM node:20-alpine

# metadane OCI
LABEL org.opencontainers.image.authors="Twoje Imię Nazwisko"
LABEL org.opencontainers.image.title="Weather App Docker"
LABEL org.opencontainers.image.description="Prosta aplikacja pogodowa w kontenerze"
LABEL org.opencontainers.image.version="1.0.0"

# bezpieszenstwo, aby appka nie byla rootem
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

WORKDIR /app

# kopia potrzebnych rzeczy z etapu buildera
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app.js ./
COPY --from=builder /app/package.json ./

# non root
USER 1001
#port 3000
EXPOSE 3000

# healthcheck. jesli kod jest inny niz 0, to kontener oznacza sie jako unhealthy 
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
#co ma byc uruchomione po starcie kontenera
CMD ["node", "app.js"]
