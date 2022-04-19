#!/usr/bin/env bash

docker-compose up -d --build --force-recreate
docker image prune -f
