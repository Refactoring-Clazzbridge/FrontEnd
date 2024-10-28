FROM node:18

WORKDIR /FrontEnd

COPY package.json package-lock.json ./


RUN npm install
RUN npm install --save-dev @babel/plugin-syntax-dynamic-import

COPY ./ ./

RUN npm run build

WORKDIR /FrontEnd/build

EXPOSE 3000

CMD ["npx", "serve", "-s", "."] 
