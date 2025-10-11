FROM node:24-alpine3.22 as build
WORKDIR /app
COPY ./package.json /app/
RUN npm install -a --legacy-peer-deps
COPY . /app/
ARG CONFIG_ARG
ARG NG_BUILD_CONFIGURATION
ENV CONFIG_ENV=$CONFIG_ARG
RUN set -euo pipefail; \
    EFFECTIVE_CONFIG="${NG_BUILD_CONFIGURATION:-${CONFIG_ENV:-production}}"; \
    echo "Angular build configuration: ${EFFECTIVE_CONFIG}"; \
    case ",production,development,no-budgets," in \
      *,"${EFFECTIVE_CONFIG}",*) ;; \
      *) echo "Unknown configuration: ${EFFECTIVE_CONFIG}" >&2; exit 2 ;; \
    esac; \
    npm run build -- --configuration "${EFFECTIVE_CONFIG}"

