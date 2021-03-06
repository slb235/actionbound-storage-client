const fs = require('fs')
const axios = require('axios')
const eos = require('end-of-stream')

const streamEnd = (stream) => new Promise((resolve, reject) => {
  eos(stream, (err) => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})

class ActionboundStorageClient {
  constructor (options) {
    this.url = options.url
    this.key = options.key

    this.client = axios.create({
      baseURL: this.url,
      timeout: 24 * 3600 * 100,
      headers: { 'x-api-key': options.key }
    })
  }

  async put (file, src) {
    const stream = fs.createReadStream(src)
    return await this.client.post(file, stream)
  }

  async get (file, dest) {
    const result = await this.client.get(file, { responseType: 'stream' })
    const ws = fs.createWriteStream(dest)
    result.data.pipe(ws)
    await streamEnd(result.data)
  }

  async createReadStream (file) {
    const result = await this.client.get(file, { responseType: 'stream' })
    return result.data
  }

  async writeStream (file, stream) {
    return await this.client.post(file, stream)
  }

  async delete (file) {
    return await this.client.delete(file)
  }
}

module.exports = ActionboundStorageClient
