FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

# Use ASCII-only CMD to avoid shell parse issues
CMD ["npm", "run", "start:dev"]