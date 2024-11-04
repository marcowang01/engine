# use docker itself as the base image
# allows us to use docker commands in the outer container
# needed for running docker in docker method
FROM docker:27.3-dind

# install go
# docker image is based on alpine
RUN apk add --no-cache go=1.22.8-r0

# set working directory
WORKDIR /usr/src/app

# copy the needed files into the image
COPY go.mod go.sum .env.docker ./*.go ./

# build the application
RUN go mod download
RUN go build -o main ./*.go

# copy the certificates
COPY certificates/ca.pem /etc/docker/ca.pem
COPY certificates/server-cert.pem /etc/docker/server-cert.pem
COPY certificates/server-key.pem /etc/docker/server-key.pem

# copy the client certificates
COPY certificates/client-cert.pem /etc/docker/cert.pem
COPY certificates/client-key.pem /etc/docker/key.pem

# Set permissions (optional but recommended)
RUN chmod 0400 /etc/docker/server-key.pem /etc/docker/key.pem
RUN chmod 0444 /etc/docker/ca.pem /etc/docker/server-cert.pem /etc/docker/cert.pem

# expose server and docker daemon ports
EXPOSE 8080
EXPOSE 2376

# start docker daemon and the application
CMD ["sh", "-c", "dockerd --host=tcp://0.0.0.0:2376 --tlsverify --tlscacert=/etc/docker/ca.pem --tlscert=/etc/docker/server-cert.pem --tlskey=/etc/docker/server-key.pem & sleep 10 && ./main"]
