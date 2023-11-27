# Delete old image
docker rmi cardanoservice

# Build new image
docker build --pull -t cardanoservice .