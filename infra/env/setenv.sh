# This should go to /etc/profile.d/ on the EC2 instance running the webserver

# All folder paths are relative to the site root folder
########################################################################################################################
# Folder where we save the candidate match and files related to atelier
export ATELIER_UPLOAD_PATH='__FILL_ME__'
# Folder with the http certificate
export CERTIFICATE_PATH='__FILL_ME__'
export SERVER_BASE_ADDRESS='__FILL_ME__'
export SALTY_PORT=3000
########################################################################################################################
# DB parameters
########################################################################################################################
export DB_HOST='__FILL_ME__'
export DB_PORT='__FILL_ME__'
export DB_NAME='__FILL_ME__'
export DB_USER='__FILL_ME__'
export DB_PASS='__FILL_ME__'
########################################################################################################################
# REDIS parameters
########################################################################################################################
export REDIS_HOST='__FILL_ME__'
export REDIS_PORT='__FILL_ME__'
########################################################################################################################
# NODE cfg
########################################################################################################################
export NODE_ENV='__FILL_ME__'
########################################################################################################################
# HOVER
########################################################################################################################
export HOVER_USER='__FILL_ME__'
export HOVER_PASS='__FILL_ME__'
########################################################################################################################
# PASSPORT
########################################################################################################################
export GOOGLE_OAUTH_ID='__FILL_ME__'
export GOOGLE_OAUTH_SECRET='__FILL_ME__'
export STRIPE_OAUTH_ID='__FILL_ME__'
export STRIPE_OAUTH_SECRET='__FILL_ME__'
export TWITCH_OAUTH_ID='__FILL_ME__'
export TWITCH_OAUTH_SECRET='__FILL_ME__'
export TWITTER_OAUTH_ID='__FILL_ME__'
export TWITTER_OAUTH_SECRET='__FILL_ME__'
export JWT_SECRET='__FILL_ME__'
########################################################################################################################
# Stripe
########################################################################################################################
export STRIPE_WEBHOOK_SIGNATURE='__FILL_ME__'
export STRIPE_WEBHOOK_CONNECT_SIGNATURE='__FILL_ME__'
########################################################################################################################
# AWS
########################################################################################################################
export AWS_CREDENTIAL_PROFILE='__FILL_ME__'
export AWS_REGION='__FILL_ME__'

