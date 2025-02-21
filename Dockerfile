FROM node:18 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:18-alpine
WORKDIR /app

RUN yarn global add serve

COPY --from=builder /app/build /app/build

ENV PORT=8080

EXPOSE 8080

CMD ["serve", "-s", "build", "-l", "8080"]

