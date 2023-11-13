#!/bin/sh
cat <<EOF > /usr/share/nginx/html/env.js
window.VUE_APP_APIURL = "$API_URL";
window.VUE_APP_BASE = "$APP_BASE";
window.VUE_APP_NAME = "$APP_NAME";
window.VUE_APP_SOCKETURL = "$APP_SOCKETURL";
window.VUE_APP_FILEURL = "$APP_FILEURL";
window.VUE_APP_BUILD = "$APP_BUILD";
EOF

nginx -g "daemon off;"