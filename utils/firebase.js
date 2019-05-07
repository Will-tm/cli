const { firebase } = require('../config')
const request = require('superagent')

require('superagent-proxy')(request);

module.exports = {
  config: firebase,
  getAdminToken(ddToken, eventId, extension) {
    // TODO: Installing extension to an event should be done in the CMS/Studio for an event in the correct region.
    // TODO: Once `install` is removed from `bz`, give the bazaar server a set of IS service creds and have it read tokens, since it can simply look for the developer role.
    return new Promise((resolve, reject) => {
      request.get(`${firebase.functions}/adminToken?event=${eventId}&region=us&extension=${extension}`)
      .proxy(process.env.http_proxy)
      .set('authorization', `Bearer ${ddToken}`)
      .end((err, res) => {
        if (err && err.status === 401) return reject('Unauthorized')
        if (err) return reject(err)
        resolve(res.text)
      })
    })
  },
  getDeveloperToken(ddToken) {
    return new Promise((resolve, reject) => {
      request.get(`${firebase.functions}/developerToken`)
      .proxy(process.env.http_proxy)
      .set('authorization', `Bearer ${ddToken}`)
      .end((err, res) => {
        if (err) return reject(err)
        if (res.status === 401) return reject('Unauthorized')
        resolve(res.text)        
      })
    })
  }
}