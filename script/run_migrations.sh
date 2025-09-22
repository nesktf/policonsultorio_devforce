#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PSQL_SCRIPT="${SCRIPT_DIR}/psql_exec.sh"

${PSQL_SCRIPT} ${SCRIPT_DIR}/reset_database.sql

npm install
npx prisma migrate dev
npx prisma generate

${PSQL_SCRIPT} ${SCRIPT_DIR}/test_rows.sql
