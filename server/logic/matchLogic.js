'use strict'
const db = require('../Utils/mongoConnection');
const MsLogger = require('@first-lego-league/ms-logger').Logger()

function getMatch (matchNumber, stage) {
  return db.connect().then(connection => {
    return connection.db().collection('matches').findOne({ 'stage': stage, 'matchId': matchNumber }).then(match => {
      return match
    })
  }).catch(err => {
    MsLogger.error(err)
    return null
  })
}

function isLastMatchInStage (matchNumber, stage) {
  getMatch(matchNumber + 1, stage).then(match => {
    if (match) {
      return true
    }
    return false
  })
}

module.exports = {
  getMatch,
  isLastMatchInStage
}
