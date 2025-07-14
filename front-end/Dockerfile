FROM node:18.18.0

WORKDIR /app

COPY package*.json ./

# RUN npm install -g npm@9.8.1

RUN npm install
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

# FROM node:18

# WORKDIR /app

# # Copy only package.json and package-lock.json first

# # Install dependencies
# RUN npm install

# # THEN copy the rest of the app
# COPY . .

# # Start Vite or your app
# CMD ["yes"]