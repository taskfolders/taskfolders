# SOURCES
# https://dev.to/srshifu/how-to-build-typescript-project-conditionally-the-same-tech-481n
set -ex
rm -rf dist
npx tsc -P tsconfig--build.json --outDir dist/esm --module esnext 
npx tsc -P tsconfig--build.json --outDir dist/cjs --module commonjs 
npx tsc -P tsconfig--build.json --outDir dist/types \
  --declaration --emitDeclarationOnly
