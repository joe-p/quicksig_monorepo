import algosdk from 'algosdk'
import crypto from 'crypto'

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
  } else {
    document.getElementById('sig-verification').innerHTML = 'Verification FAILED!'
    document.getElementById('sig-value').innerHTML = 'Unknown'
  }
}

function verifyHash (metadata: Object, hash: string) {
  const pathHash = window.location.pathname.substring(1)
  const realHash = crypto.createHash('sha256').update(JSON.stringify(data.metadata)).digest('hex')

  document.getElementById('hash-value').innerHTML = realHash

  if (pathHash === realHash) {
    document.getElementById('hash-verification').innerHTML = 'Verified!'
  } else {
    console.log(pathHash, realHash)
  }
}

const rawData = document.getElementById('raw').innerHTML
const data = JSON.parse(rawData) as QuickSigData
const txn = algosdk.decodeUnsignedTransaction(Buffer.from(data.metadata.b64Txn, 'base64'))

document.getElementById('txn').innerHTML = generateTable(JSON.parse(txn.toString()))

verifySig(data.hash, data.sig)
verifyHash(data.metadata, data.hash)
