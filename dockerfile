FROM node:18

WORKDIR /FrontEnd

COPY package.json package-lock.json ./

RUN npm install

COPY ./ ./

RUN npm run build

WORKDIR /FrontEnd/build

EXPOSE 3000

CMD ["npx", "serve", "-s", "build"]
