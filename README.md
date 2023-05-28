# B2BitcoinBootik

P2P Bootik for merch, subscribers and crowdfunding

## Requirements

- A S3-compatible object storage. There are hundreds of solutions, including https://min.io/, an open source solution that can be run inside docker, or paid services like AWS, Scaleway, ...
- SMTP credentials, for sending emails
- A BTCPayServer instance. You can run it inside docker, or use paid services like Nodl.it, LunaNode or Voltage.cloud.
- A MongoDB replica set. You can run it inside docker or use MongoDB Atlas.
- A bitcoin node, and lnd
- Node version 18+, corepack enabled with `corepack enable`

### S3 configuration

The app will automatically configure the S3 bucket to accept CORS PUT calls.

## Environment variables

Add `.env.local` or `.env.{development,test,production}.local` files for secrets not committed to git and to override the `.env`

- `BITCOIN_RPC_URL` - The RPC url for the bitcoin node. Set to http://127.0.0.1:8332 if you run a bitcoin node locally with default configuration
- `BITCOIN_RPC_USER` - The RPC user
- `BITCOIN_RPC_PASSWORD` - The RPC password
- `LND_REST_URL` - The LND Rest interface URL. Set to http://127.0.0.1:8080 if you run a lnd node locally with default configuration
- `LND_MACAROON_PATH` - Where the credentials for lnd are located. For example, `~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon`. Leave empty if lnd runs with `--no-macaroons`, or if you're using `LND_MACAROON_VALUE`
- `LND_MACAROON_VALUE` - Upper-case hex-encoded represenetation of the LND macaroon. Leave empty if lnd runs with `--no-macaroons`, or if you're using `LND_MACAROON_PATH`
- `MONGODB_URL` - The connection URL to the MongoDB replicaset
- `MONGODB_DB` - The DB name, defaulting to "bootik"
- `NOSTR_PRIVATE_KEY` - To send notifications
- `ORIGIN` - The url of the bootik. For example, https://dev-bootik.pvh-labs.ch
- `S3_BUCKET` - The name of the bucket for the S3-compatible object storage
- `S3_ENDPOINT` - The endpoint for the S3-compatible object storage - eg http://s3-website.us-east-1.amazonaws.com or http://s3.fr-par.scw.cloud
- `S3_KEY_ID` - Credentials for the S3-compatible object storage
- `S3_KEY_SECRET` - Credentials for the S3-compatible object storage
- `S3_REGION` - Region from the S3-compatible object storage

## Local development

### Running the app

Install pnpm, for example with `sudo corepack enable` if you're on linux/mac.

Then:

```
pnpm install
pnpm dev
```

### Configuring the Object Storage

Many cloud-hosted object storages like AWS S3 or Scaleway have free tiers that are more than enough for local development.

You can also use [MinIO](https://min.io/docs/minio/container/index.html):

```
mkdir -p ${HOME}/minio/data

docker run \
   -p 9000:9000 \
   -p 9090:9090 \
   --user $(id -u):$(id -g) \
   --name minio1 \
   -e "MINIO_ROOT_USER=ROOTUSER" \
   -e "MINIO_ROOT_PASSWORD=CHANGEME123" \
   -v ${HOME}/minio/data:/data \
   quay.io/minio/minio server /data --console-address ":9090"
```

Then, go on http://127.0.0.1:9090 , login with the user/password above, and create a "bootik" S3 bucket.

Then go on http://127.0.0.1:9090/access-keys and create an access key. Copy the "Access Key" and "Secret Key" safely.

In your `.env.local` file, add the following:

```dotenv
S3_BUCKET="bootik"
S3_KEY_ID=<Access key> #for example: uY2vtFFX7vBVucEs
S3_KEY_SECRET=<Secret Key> #for example: GhNSZXUMiZsJl6LTvSCWPW0ZbCwHVL17
S3_ENDPOINT_URL=http://127.0.0.1:9000
S3_REGION="localhost"
```

Then restart `pnpm dev`.

### Configuring MongoDB

The simplest way is to get a free tier on [MongoDB Atlas](https://www.mongodb.com/atlas/database).

Alternatively, you need to configure a local MongoDB with ReplicaSet enabled. ReplicaSet is needed for change streams and ACID transactions.
