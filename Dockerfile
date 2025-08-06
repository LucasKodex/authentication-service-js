FROM node:alpine AS build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

FROM node:alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.env.example ./.env.example
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/yarn.lock ./yarn.lock
COPY --from=build /app/openapi.yml ./openapi.yml
RUN yarn install --production
RUN yarn prisma generate
EXPOSE 80
CMD [ "yarn", "start" ]
