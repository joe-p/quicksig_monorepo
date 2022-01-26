const algosdk = require('algosdk')
const crypto = require('crypto')
const axios = require('axios')

const server = 'http://localhost'
const token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const algodClient = new algosdk.Algodv2(token, server, 4001)

const account = algosdk.generateAccount()
const userAccount = algosdk.generateAccount()

async function generate() {
  const suggestedParams = await algodClient.getTransactionParams().do()

  const payObj = {
    suggestedParams: { ...suggestedParams, lastRound: 1, firstRound: 2 },
    from: userAccount.addr,
    to: userAccount.addr,
    amount: 0
  }

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(payObj)
  const b64Txn = Buffer.from(txn.toByte()).toString('base64')

  const metadata = {
    algod: {
      send: false,
      algodServer: null,
      algodToken: null,
      algodPort: null,
    },

    auth: {
      isAuth: true,
      user: 'MonopolyMan#1876',
      service: 'https://discord.gg/algorand',
      description: 'Proof of wallet ownership is needed for tipping functionality on the official Algorand discord server.',
    },

    post: {
      onSigned: 'https://httpbin.org/post', 
      onComplete: null,
    },

    b64Txn: b64Txn,
    sigAddress: account.addr,
    userAddress: userAccount.addr,
  }

  const hash = crypto.createHash('sha256').update(JSON.stringify(metadata)).digest('hex')
  const sig = algosdk.signBytes(Buffer.from(hash, 'hex'), account.sk)

  const data = {
    metadata: metadata, 
    hash: hash, 
    sig: Buffer.from(sig).toString('base64')
  }

  axios
    .post('http://localhost:3000/generate', data)
    .then(res => {
      console.log(`http://localhost:3000/${res.data}`)
    })
    .catch(error => {
      console.error(error)
    })

}

generate()
