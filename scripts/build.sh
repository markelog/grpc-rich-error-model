#!/usr/bin/env sh

# cspell:ignore mkdir, oneofs, pbjs

set -e

rm -fr ./src/protos
mkdir -p ./src/protos
include=./node_modules/google-proto-files

npx --no-install pbjs \
  --out ./src/protos/bundle.json \
  --path $include \
  --target json \
  ./protos/root.proto

npx --no-install proto-loader-gen-types \
  --grpcLib @grpc/grpc-js \
  --includeComments \
  --includeDirs $include \
  --longs Number \
  --outDir ./src/protos \
  $(find ./protos -type f -print -regex ".*\.protos")
