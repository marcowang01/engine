#!/bin/bash

#! /bin/bash

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)"

cd $SCRIPT_PATH/../certificates

# Generate CA key and certificate
openssl genpkey -algorithm RSA -out ca-key.pem -pkeyopt rsa_keygen_bits:4096
openssl req -new -x509 -key ca-key.pem -sha256 -days 365 -out ca.pem -subj "/CN=ServerDockerCA"

# Generate server key and certificate signing request
openssl genpkey -algorithm RSA -out server-key.pem -pkeyopt rsa_keygen_bits:4096
openssl req -new -key server-key.pem -out server.csr -subj "/CN=go-server" -addext "subjectAltName=DNS:go-server,DNS:localhost"

# Sign server certificate with CA certificate and key
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -days 365 -sha256 -extfile <(echo "subjectAltName=DNS:go-server,DNS:localhost,IP:127.0.0.1,IP:0.0.0.0")

# remove the server certificate signing request
rm server.csr

# Generate client key and certificate signing request
openssl genpkey -algorithm RSA -out client-key.pem -pkeyopt rsa_keygen_bits:4096
openssl req -new -key client-key.pem -out client.csr -subj "/CN=DockerClient"

# Sign client certificate with CA certificate and key
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out client-cert.pem -days 365 -sha256

# remove the client certificate signing request
rm client.csr
