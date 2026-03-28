FROM node:20-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

ENV API_UPSTREAM_URL=http://api:8080

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist ./

EXPOSE 80
