var config = require('./config.js').cfg;

module.exports = {
  facebook: {
    id: config.facebook_id,
    secret: config.facebook_secret,
    callback: config.facebook_callback
  },

  twitter: {
    consumerkey: config.twitter_key,
    consumersecret: config.twitter_secret,
    callback: config.twitter_callback
  }
}