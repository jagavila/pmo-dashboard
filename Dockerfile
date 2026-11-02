FROM node:22-alpine
WORKDIR /app
COPY index.html serve.mjs ./
USER node
EXPOSE 8080
CMD ["node", "serve.mjs"]
