#!/bin/bash
# Setup encoded app environment
echo -e "\n$(basename $0) Running"

standby_mode='off'

# Script Below
# Create encoded user home
sudo mkdir "$ENCD_HOME"
sudo chown encoded:encoded "$ENCD_HOME"

# Checkout encoded repo
cd "$ENCD_HOME"
sudo -H -u encoded git clone "$ENCD_GIT_REPO" "$ENCD_HOME"
sudo -H -u encoded git checkout -b "$ENCD_GIT_BRANCH" "$ENCD_GIT_REMOTE/$ENCD_GIT_BRANCH"

# Create pyenv
encd_venv="$ENCD_HOME/.pyvenv"
sudo -H -u encoded "$ENCD_PY3_PATH" -m venv "$encd_venv"

# Install pre-reqs
source "$encd_venv/bin/activate"
sudo -H -u encoded "$encd_venv/bin/pip" install --upgrade pip setuptools
sudo -H -u encoded "$encd_venv/bin/pip" install -r requirements.txt

cd $ENCD_SCRIPTS_DIR
java.sh
elasticsearch.sh
wait-es-status.sh
postgres-wale.sh "$standby_mode"
wait-pg-status.sh
