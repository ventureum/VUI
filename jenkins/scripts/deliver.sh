#!/usr/bin/env sh

set -x
aws s3 sync --delete ./build  s3://alpha.ventureum.io
set +x
