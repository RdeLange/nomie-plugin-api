CA Certificate

The node uses the Certificate Authority to verify the signature on the certificates. As such, you need this key and cert file to generate the server and client certificates.

To create the CA key and cert, complete the following steps:

    Generate the CA key.

    openssl genrsa 2048 > ca-key.pem

    Using the CA key, generate the CA certificate.

    openssl req -new -x509 -nodes -days 365000 \
          -key ca-key.pem -out ca-cert.pem

This creates a key and certificate file for the Certificate Authority. They are in the current working directory as ca-key.pem and ca-cert.pem. You need both to generate the server and client certificates. Additionally, each node requires ca-cert.pem to verify certificate signatures.

Place these 2 files in root folder

Change start script in package.json to:
 "start": "sirv public --cors --host --http2 --cert ca-cert.pem --key ca-key.pem --port 1234",