'use strict'
const { MClient } = require('mhub')
const MsLogger = require('@first-lego-league/ms-logger').Logger()
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const MHUB_NODES = {
  PUBLIC: 'public',
  PROTECTED: 'protected'
}

const MHUB_CLIENT_ID = 'cl-schedule'

const mhubClient = new MClient(process.env.MHUB_URI)

mhubClient.on('error', msg => {
  MsLogger.error('Unable to connect to mhub, other modules won\'t be notified changes \n ' + msg)
})

mhubClient.subscribe('protected')

function publishUpdateMsg (nameSpace, data = '') {
  const connectedNode = loginToMhub(MHUB_NODES.PROTECTED)

  publishMsg(connectedNode, `${nameSpace}:reload`, data)
}

function publishMsg (node, topic, data = '') {
  const connectedNode = loginToMhub(node)

  mhubClient.connect().then(() => {
    MsLogger.debug(`Publishing message to mhub: ${connectedNode}, ${topic}, With data ${data}`)
    mhubClient.publish(connectedNode, topic, data, {
      'client-id': MHUB_CLIENT_ID,
      'correlation-id': getCorrelationId()
    })
  })
}

function subscribe (topic, handle) {
  mhubClient.on('message', message => {
    if (message.topic == topic) {
      handle(message)
    }
  })
}

function loginToMhub (node) {
  if (process.env.DEV) {
    mhubClient.login('default', '')
    return 'default'
  }

  if (node == MHUB_NODES.PROTECTED) {
    mhubClient.login('protected-client', process.env.PROTECTED_MHUB_PASSWORD)
    return MHUB_NODES.PROTECTED
  }
}

module.exports = {
  publishUpdateMsg,
  publishMsg,
  subscribe,
  MHUB_NODES
}
