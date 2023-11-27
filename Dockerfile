FROM oven/bun:1 as base
WORKDIR /home/app

LABEL maintainer="Quoc-Khang Tran <tqkhang@fuixlabs.com>"

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM install AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=development

ENTRYPOINT [ "bun", "run", "index.ts" ]