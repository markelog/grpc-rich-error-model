#!/usr/bin/env sh

# cspell:ignore mkdir, oneofs, pbjs

set -e

PROTOS_OUT_DIRECTORY="./src/protos"

rm -fr $PROTOS_OUT_DIRECTORY
mkdir -p $PROTOS_OUT_DIRECTORY
INCLUDE=./node_modules/google-proto-files

npx --no-install pbjs \
  --out $PROTOS_OUT_DIRECTORY/bundle.json \
  --path $INCLUDE \
  --target json \
  ./protos/root.proto

./scripts/hack.cjs

npx --no-install proto-loader-gen-types \
  --grpcLib @grpc/grpc-js \
  --includeComments \
  --includeDirs $INCLUDE \
  --longs Number \
  --outDir $PROTOS_OUT_DIRECTORY \
  $(find ./protos -type f -print -regex ".*\.protos")
