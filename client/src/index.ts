import algosdk from 'algosdk'
import crypto from 'crypto'
import MyAlgoConnect from '@randlabs/myalgo-connect'

interface QuickSigData {
  metadata: {
    algod?: {
      send: boolean,
      algodServer: string,
      algodToken: string,
      algodPort: string,
    },

    auth?: {
      isAuth: boolean,
      user: string,
      service: string,
      description: string,
    },

    post?: {
      onSigned?: string,
      onComplete?: string,
    },

    b64Txn: string,
    sigAddress: string,
    userAddress: string
  },

  sig: string,
  hash: string,
}

function generateTable (obj: Object) {
  let tableString = '<table class="table table-striped">'
  for (const [key, value] of Object.entries(obj)) {
    tableString += '<tr>'
    tableString += `<td>${key}</td>`
    tableString += `<td>${value}</td>`.replace('[object Object]', '')
    tableString += '</tr>'
  }
  tableString += '</table>'

  return tableString
}

function verifySig (hash: string, sig: string) {
  const hashBuffer = Buffer.from(hash, 'hex')
  const sigBuffer = Buffer.from(sig, 'base64')

  if (algosdk.verifyBytes(hashBuffer, sigBuffer, data.metadata.sigAddress)) {
    document.getElementById('sig-verification').innerHTML = 'Verified!'
    document.getElementById('sig-value').innerHTML = data.metadata.sigAddress
    return true
  } else {
    document.getElementById('sig-verification').innerHTML = 'Verification FAILED!'
    document.getElementById('sig-value').innerHTML = 'Unknown'
    return false
  }
}

function verifyHash (metadata: Object, hash: string) {
  const pathHash = window.location.pathname.substring(1)
  const realHash = crypto.createHash('sha256').update(JSON.stringify(data.metadata)).digest('hex')

  document.getElementById('hash-value').innerHTML = realHash

  if (pathHash === realHash) {
    document.getElementById('hash-verification').innerHTML = 'Verified!'
    return true
  } else {
    console.log(pathHash, realHash)
    return false
  }
}

async function postData (url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })

  return response.json()
}

function txnSigned (signedTxn: Uint8Array) {
  const post = data.metadata.post

  const b64SignedTxn = Buffer.from(signedTxn).toString('base64')

  if (post && post.onSigned) {
    postData(post.onSigned, { b64SignedTxn: b64SignedTxn }).then(data => {
      console.log(data)
    })
  }
}

async function connectMyAlgo () {
  const settings = {
    shouldSelectOneAccount: true,
    openManager: false
  }

  // TODO: verify address connected is address in metadata
  await myAlgoConnect.connect(settings)
}

async function signMyAlgo () {
  const signedTxn = (await myAlgoConnect.signTransaction(txn.toByte())).blob

  txnSigned(signedTxn)
}

function init () {
  document.getElementById('txn').innerHTML = generateTable(JSON.parse(txn.toString()))

  if (verifySig(data.hash, data.sig) && verifyHash(data.metadata, data.hash)) {
    const myAlgoConnectBtn = document.getElementById('my-algo-connect') as HTMLButtonElement
    myAlgoConnectBtn.addEventListener('click', connectMyAlgo)
    myAlgoConnectBtn.disabled = false

    const myAlgoSignBtn = document.getElementById('my-algo-sign') as HTMLButtonElement
    myAlgoSignBtn.addEventListener('click', signMyAlgo)
    myAlgoSignBtn.disabled = false
  }
}

const myAlgoConnect = new MyAlgoConnect()

const rawData = document.getElementById('raw').innerHTML
const data = JSON.parse(rawData) as QuickSigData
const txn = algosdk.decodeUnsignedTransaction(Buffer.from(data.metadata.b64Txn, 'base64'))

init()
