#!/bin/sh

cat >/app/dist/client/env.js <<EOL
window.VUE_APP_APIURL = "${APP_API_URL}";
window.VUE_APP_BASE = "${APP_BASE}";
window.VUE_APP_NAME = "${APP_NAME}";
window.VUE_APP_SOCKETURL = "${APP_SOCKETURL}";
window.VUE_APP_FILEURL = "${APP_FILEURL}";
EOL

cd /app
node --env-file=.env server.js