import ipfsAPI from 'ipfs-api'

class IpfsService {
  constructor () {
    this.ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
  }

  get (hash) {
    return new Promise((resolve, reject) => {
      this.ipfs.files.get(hash, (err, files) => {
        if (err) {
          reject(err)
        } else {
          resolve(files[0].content.toString('utf8'))
        }
      })
    })
  }

  add (str) {
    return new Promise((resolve, reject) => {
      this.ipfs.files.add(Buffer.from(str), (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res[0].hash)
        }
      })
    })
  }
}

export default new IpfsService()
