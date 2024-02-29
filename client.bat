@echo off
npx swagger-typescript-api -p http://localhost:3000/swagger/doc.json -o .\src\services -n StreamSinkClient.ts --api-class-name StreamSinkClient --sort-types