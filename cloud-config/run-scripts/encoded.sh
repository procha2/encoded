#!/bin/bash
# Setup encoded app
echo -e "$(basename $0) Running"

# Check remote postgres uri
PG_URI='postgresql:///encoded'
PG_URI="postgresql://$ENCD_PG_IP/encoded"

# Install App
cd "$ENCD_HOME"

# Run bootstrap
sudo -H -u encoded "$ENCD_HOME/.pyvenv/bin/buildout" bootstrap
bin_build_path="$ENCD_HOME/bin/buildout"

# Run bin/buildout
bin_build_cmd="$ENCD_HOME/bin/buildout -c $ENCD_ROLE.cfg buildout:es-ip=$ENCD_ES_IP buildout:es-port=$ENCD_ES_PORT buildout:pg-uri=$PG_URI buildout:fe-ip=$ENCD_FE_IP buildout:remote_indexing=$ENCD_REMOTE_INDEXING buildout:index_procs=$ENCD_INDEX_PROCS buildout:index_chunk_size=$ENCD_INDEX_CHUNK_SIZE"
echo -e "$(basename $0) CMD: $bin_build_cmd"
sudo -H -u encoded LANG=en_US.UTF-8 $bin_build_cmd

# Downlaod encoded demo aws keys
encd_keys_dir=/home/ubuntu/encd-aws-keys
mkdir "$encd_keys_dir"
aws s3 cp --region=us-west-2 --recursive s3://encoded-conf-prod/encd-aws-keys "$encd_keys_dir"
# Add aws keys to encoded user
sudo -u encoded mkdir /srv/encoded/.aws
sudo -u root cp /home/ubuntu/encd-aws-keys/* /srv/encoded/.aws/
sudo -u root chown -R encoded:encoded ~encoded/.aws

# Finished running post pg scripts
sudo -H -u encoded sh -c 'cat /dev/urandom | head -c 256 | base64 > session-secret.b64'
sudo -H -u encoded "$ENCD_HOME/bin/create-mapping" "$ENCD_HOME/production.ini" --app-name app
sudo -H -u encoded "$ENCD_HOME/bin/index-annotations" "$ENCD_HOME/production.ini" --app-name app
sudo -u root cp /srv/encoded/etc/logging-apache.conf /etc/apache2/conf-available/logging.conf

# Create encoded apache conf
a2conf_src_dir="$ENCD_HOME/cloud-config/configs/apache"
a2conf_dest_file='/etc/apache2/sites-available/encoded.conf'
sudo -u root "$a2conf_src_dir/build-conf.sh" "$a2conf_src_dir" "$a2conf_dest_file"

sudo -u root a2en.sh
if [ "$ENCD_BATCHUPGRADE" == "true" ]; then
    batchupgrade.sh production.ini "$batchupgrade_vars"
fi

sudo apt --fix-broken install
sudo DEBIAN_FRONTEND=noninteractive apt install -y postfix
sudo sed -i -e 's/inet_interfaces = all/inet_interfaces = loopback-only/g' /etc/postfix/main.cf
PUBLIC_DNS_NAME="$(curl http://169.254.169.254/latest/meta-data/public-hostname)"
sudo sed -i "/myhostname/c\myhostname = $PUBLIC_DNS_NAME" /etc/postfix/main.cf
sudo echo "127.0.0.0 $PUBLIC_DNS_NAME" | sudo tee --append /etc/hosts
sudo mv /etc/mailname /etc/mailname.OLD
sudo echo "$PUBLIC_DNS_NAME" | sudo tee --append /etc/mailname
sudo service postfix restart
