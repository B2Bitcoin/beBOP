# If behind a reverse proxy, set the following environment variables to get the correct IP address:
# - ADDRESS_HEADER=X-Forwarded-For 
# - XFF_DEPTH=1
FROM node:20-slim

ARG VERSION
ENV PUBLIC_VERSION=$VERSION

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY --link --chown=1000 .npmrc .
COPY --link --chown=1000 package.json .
COPY --link --chown=1000 pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

COPY --link --chown=1000 . .

EXPOSE 3000

RUN chmod +x /app/entrypoint.sh

CMD ["/bin/bash", "-c", "/app/entrypoint.sh"]