# B2BitcoinBootik

P2P Bootik for merch, subscribers and crowdfunding

## Requirements

- A S3-compatible object storage. There are hundreds of solutions, including https://min.io/, an open source solution that can be run inside docker, or paid services like AWS, Scaleway, ...
- SMTP credentials, for sending emails
- A BTCPayServer instance. You can run it inside docker, or use paid services like Nodl.it, LunaNode or Voltage.cloud.
- A MongoDB replica set. You can run it inside docker or use MongoDB Atlas.
- A bitcoin node
- Node version 18+, corepack enabled with `corepack enable`

### S3 configuration

The app will automatically configure the S3 bucket to accept CORS PUT calls.

## Environment variables

Add `.env.local` or `.env.{development,test,production}.local` files for secrets not committed to git and to override the `.env`

- `BITCOIN_RPC_URL` - The RPC url for the bitcoin node, defaults to http://127.0.0.1:8332
- `BITCOIN_RPC_USER` - The RPC user
- `BITCOIN_RPC_PASSWORD` - The RPC password
- `MONGODB_URL` - The connection URL to the MongoDB replicaset
- `MONGODB_DB` - The DB name, defaulting to "bootik"
- `S3_BUCKET` - The name of the bucket for the S3-compatible object storage
- `S3_ENDPOINT` - The endpoint for the S3-compatible object storage - eg http://s3-website.us-east-1.amazonaws.com or http://s3.fr-par.scw.cloud
- `S3_KEY_ID` - Credentials for the S3-compatible object storage
- `S3_KEY_SECRET` - Credentials for the S3-compatible object storage
- `S3_REGION` - Region from the S3-compatible object storage
