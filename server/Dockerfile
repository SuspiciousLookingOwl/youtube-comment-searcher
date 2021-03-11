FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apk --no-cache add curl

COPY . .

ENV PORT=3030

EXPOSE 3030

RUN npm run build

CMD ["./wait-for-es.sh", "es:9200", "npm", "start"]