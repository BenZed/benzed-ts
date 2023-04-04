
# clear public
shx rm -rf public/

# create public 
shx mkdir public
shx mkdir public/assets

# copy assets
shx cp ./src/client/assets/* ./public/assets

# remove assets that are not required or will be created by webpack
shx rm ./public/assets/*.ts
shx rm ./public/assets/*.html