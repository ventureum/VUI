#!/usr/bin/env sh

set -x
truffle migrate --reset
cp -r ./build/contracts ../../contracts
set +x
