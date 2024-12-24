FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

COPY next.config.mjs .env tsconfig.json ./
COPY tailwind.config.ts  postcss.config.mjs ./

RUN npm install

COPY . .

RUN npx prisma db push

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]