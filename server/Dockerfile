FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .

FROM node:20-slim
RUN useradd --system --user-group app
WORKDIR /app
COPY --from=builder /app .
USER app
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "server.js"]