#!/bin/bash

USER=jenkins
DESTIP=russell
SRCDIR=_book
DESTDIR=/var/www/html/userguide-vnext

# exit on command failure
set -e
set -o pipefail

# build
npm install
npm run build
#gulp clean
#gulp all --glcom_url "https://dato.com" --glbeta_url "https://beta.graphlab.com" --debug 0 --stripe_public_key pk_live_3zXqRhn4dHaA4Dsj0wpN0EFN

# deploy to russell
rsync -az --delete $SRCDIR/ $USER@$DESTIP:$DESTDIR

echo "Files deployed from $SRCDIR/ to $DESTIP:$DESTDIR."
