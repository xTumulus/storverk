#!/bin/sh
set -e

cd /app

# Build once from whatever's actually in the mounted content/ volume right
# now (it may differ from the snapshot baked into the image) before nginx
# ever starts serving. If this fails, the seed release built into the image
# stays live — see scripts/rebuild-site.ts.
node scripts/rebuild-site.ts --initial

# Backgrounded, not supervised: if it dies, the last successful build just
# keeps serving. Docker tears down the whole container's process tree on
# stop/restart, so no explicit signal handling is needed here.
node scripts/watch-content.ts &

exec nginx -g "daemon off;"
