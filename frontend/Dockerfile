FROM node:20-alpine

WORKDIR /app

# Install deps first so this layer is cached unless package*.json changes
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# --host 0.0.0.0 is required: Vite's dev server only binds to localhost by
# default, which is unreachable from outside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
