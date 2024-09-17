#!/usr/bin/env sh

# cspell:ignore mkdir, oneofs, pbjs

set -e

PROTOS_OUT_DIRECTORY="./src/protos"

rm -fr ./src/protos
mkdir -p ./src/protos
include=./node_modules/google-proto-files

npx --no-install pbjs \
  --out ./src/protos/bundle.json \
  --path $include \
  --target json \
  ./protos/root.proto

./scripts/hack.cjs

npx --no-install proto-loader-gen-types \
  --grpcLib @grpc/grpc-js \
  --includeComments \
  --includeDirs $include \
  --longs Number \
  --outDir ./src/protos \
  $(find ./protos -type f -print -regex ".*\.protos")


# Look for all relative import paths and append ".js" to the end of the import path.
# Fixes ESM build which requires explicit extensions for imports (TS2835).
find $PROTOS_OUT_DIRECTORY -name "*.ts" | while read filename; do
    # Use sed to replace import paths
    sed -i.bak -E "s/(import .* '\.+\/.*)';/\1.js';/g" "$filename"
    # Remove backup file created by sed
    rm "${filename}.bak"
done
