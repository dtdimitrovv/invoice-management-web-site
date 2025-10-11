FROM node:24-alpine3.22 as build
WORKDIR /app
COPY ./package.json /app/
RUN npm install -a --legacy-peer-deps
COPY . /app/
ARG CONFIG_ARG
ARG NG_BUILD_CONFIGURATION
ENV CONFIG_ENV=$CONFIG_ARG
# 4) Build (compat with /bin/sh on Alpine, no bash-only flags)
#    If your repo already has "build": "ng build" in package.json, either of these works:
#    - npm run build -- --configuration "${EFFECTIVE_CONFIG}"  (needs CLI in dev deps)
#    - npx -y @angular/cli ng build --configuration "${EFFECTIVE_CONFIG}"  (bootstraps CLI if missing)
RUN EFFECTIVE_CONFIG="${NG_BUILD_CONFIGURATION:-${CONFIG_ENV:-production}}"; \
    echo "Angular build configuration: ${EFFECTIVE_CONFIG}"; \
    # Use 'npm run build' if CLI is in devDependencies; else fallback to npx CLI:
    if npm run -s env >/dev/null 2>&1 && grep -q '"build"' package.json; then \
      # Try local script first
      (npm run build -- --configuration "${EFFECTIVE_CONFIG}") \
      || (echo "Local build script failed or CLI missing; falling back to npx @angular/cli" >&2 \
          && npx -y @angular/cli ng build --configuration "${EFFECTIVE_CONFIG}"); \
    else \
      npx -y @angular/cli ng build --configuration "${EFFECTIVE_CONFIG}"; \
    fi

# 5) Verify dist path (adjust if your output path differs)
# Angular v15+ defaults to /app/dist/<project-name>/
# If you know the project name, replace the wildcard for a tiny perf win.
RUN test -d /app/dist || (echo "dist/ not found after build" >&2; ls -la /app; exit 1)


