#!/usr/bin/env sh

set -x
npm install
set +x

set -x
cp ./react-scripts/config/* ./node_modules/react-scripts/config/
set +x
