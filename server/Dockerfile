# use docker itself as the base image
# allows us to use docker commands in the outer container
# needed for running docker in docker method
FROM docker:27.3-dind

# install go and python3
# docker image is based on alpine
RUN apk add --no-cache go python3

# set working directory
WORKDIR /usr/src/app

# copy the needed files into the image
COPY go.mod go.sum ./*.go ./

# build the application
RUN go mod download
RUN go build -o main ./*.go

EXPOSE 8080
EXPOSE 2375

# set the docker host to the exposed port
ENV DOCKER_HOST=tcp://0.0.0.0:2375

# start docker daemon and the application
CMD ["sh", "-c", "dockerd --host=tcp://0.0.0.0:2375 & sleep 5 && ./main --port 8080"]
