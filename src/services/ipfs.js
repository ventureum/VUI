import ipfsAPI from 'ipfs-api'

class IpfsService {
  constructor () {
    this.ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
  }

  getAPI (hash) {
    return new Promise(async (resolve, reject) => {
      this.ipfs.files.get(hash, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}

export default new IpfsService()
