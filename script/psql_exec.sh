#!/usr/bin/env bash

if [[ -n "${1}" ]]; then
  cat "${1}" | docker exec -i postgres_policonsultorio psql -U funny_user -d policonsultorio
else
  docker exec -it postgres_policonsultorio psql -U funny_user -d policonsultorio
fi

