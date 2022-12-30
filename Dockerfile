FROM node:18.12.0 AS Builder

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn

COPY src/ ./src/
COPY typings/ ./typings/
COPY tsconfig.json .

RUN yarn build

FROM node:18.12.0-alpine AS Runner

WORKDIR /app

COPY --from=Builder /app/node_modules/ ./node_modules/
COPY --from=Builder /app/dist/ ./dist/

EXPOSE 3000

CMD ["node", "./dist/"]