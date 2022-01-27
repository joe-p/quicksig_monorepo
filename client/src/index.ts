import algosdk from 'algosdk'
import crypto from 'crypto'
import MyAlgoConnect from '@randlabs/myalgo-connect'

namespace QuickSig {
  interface AlgodData {
    send: boolean,
    algodServer: string,
    algodToken: string,
    algodPort: string,
  }

  interface AuthData {
    isAuth: boolean,
    user: string,
    service: string,
    description: string,
  }

  interface PostData {
    onSigned?: string,
    onComplete?: string,
  }

  interface MetaData {
    algod?: AlgodData,
    auth?: AuthData,
    post?: PostData,
    b64Txn: string,
    sigAddress: string,
    userAddress: string
  }

  interface Data {
    metadata: MetaData,
    sig: string,
    hash: string
  }

  export class ClientSession {
    private myAlgoConnect: MyAlgoConnect
    private data: Data
    private txn: algosdk.Transaction

    constructor (rawData: string) {
      this.myAlgoConnect = new MyAlgoConnect()

      this.data = JSON.parse(rawData)
      this.txn = algosdk.decodeUnsignedTransaction(Buffer.from(this.data.metadata.b64Txn, 'base64'))

      this.generateTxnTable()

      if (this.verifySig() && this.verifyHash()) {
        const myAlgoConnectBtn = document.getElementById('my-algo-connect') as HTMLButtonElement
        myAlgoConnectBtn.addEventListener('click', () => { this.connectMyAlgo() })
        myAlgoConnectBtn.disabled = false

        const myAlgoSignBtn = document.getElementById('my-algo-sign') as HTMLButtonElement
        myAlgoSignBtn.addEventListener('click', () => { this.signMyAlgo() })
        myAlgoSignBtn.disabled = false
      }
    }

    generateTxnTable () {
      let tableString = '<table class="table table-striped">'
      for (const [key, value] of Object.entries(JSON.parse(this.txn.toString()))) {
        tableString += '<tr>'
        tableString += `<td>${key}</td>`
        tableString += `<td>${value}</td>`.replace('[object Object]', '')
        tableString += '</tr>'
      }
      tableString += '</table>'

      document.getElementById('txn').innerHTML = tableString
    }

    verifySig () {
      const hashBuffer = Buffer.from(this.data.hash, 'hex')
      const sigBuffer = Buffer.from(this.data.sig, 'base64')

      if (algosdk.verifyBytes(hashBuffer, sigBuffer, this.data.metadata.sigAddress)) {
        document.getElementById('sig-verification').innerHTML = 'Verified!'
        document.getElementById('sig-value').innerHTML = this.data.metadata.sigAddress
        return true
      } else {
        document.getElementById('sig-verification').innerHTML = 'Verification FAILED!'
        document.getElementById('sig-value').innerHTML = 'Unknown'
        return false
      }
    }

    verifyHash () {
      const pathHash = window.location.pathname.substring(1)
      const realHash = crypto.createHash('sha256').update(JSON.stringify(this.data.metadata)).digest('hex')

      document.getElementById('hash-value').innerHTML = realHash

      if (pathHash === realHash) {
        document.getElementById('hash-verification').innerHTML = 'Verified!'
        return true
      } else {
        console.log(pathHash, realHash)
        return false
      }
    }

    async postData (url: string, data: any) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      return response.json()
    }

    txnSigned (signedTxn: Uint8Array) {
      const post = this.data.metadata.post

      const b64SignedTxn = Buffer.from(signedTxn).toString('base64')
      const postData = { b64SignedTxn: b64SignedTxn, data: this.data }

      if (post && post.onSigned) {
        this.postData(post.onSigned, postData).then(data => {
          // TODO: Show this response to the user somewhere
          console.log(data)
        })
      }
    }

    async connectMyAlgo () {
      const settings = {
        shouldSelectOneAccount: true,
        openManager: false
      }

      // TODO: verify address connected is address in metadata
      await this.myAlgoConnect.connect(settings)
    }

    async signMyAlgo () {
      const signedTxn = (await this.myAlgoConnect.signTransaction(this.txn.toByte())).blob

      this.txnSigned(signedTxn)
    }
  }
}

// eslint-disable-next-line no-new
new QuickSig.ClientSession(document.getElementById('raw').innerHTML)
