const { DateTime } = require('luxon')
const pubsub = require('@dpassarelli/topico')

const localTimeFormat = require('@api/local-time-format')

/**
 * The template used by `console.log` to format messages:
 *
 * 1. Current date + time
 * 2. Message
 *
 * @type {String}
 */
const template = '[%s] %s'

/**
 * Write the published message to STDOUT with a timestamp.
 *
 * The exception to this rule is if `info` is an array of lines, in that case,
 * each one is displayed as subordinate to the last timestamped message.
 *
 * If `info` is neither an array nor a string, then it is ignored altogether.
 *
 * @param  {any}      info   The potential message to output. Only {Array} and
 *                           {String} values are relevant.
 *
 * @param  {String?}  src    An optional value indicating which channel this
 *                           message is originating from.
 *
 * @return {undefined}
 */
function logMessage (info, src) {
  if (Array.isArray(info)) {
    info.forEach((line) => {
      console.log('\t*', line)
    })
    return
  }

  if (typeof info !== 'string') {
    return
  }

  const timestamp = DateTime.local().toLocaleString(localTimeFormat)

  if (src) {
    console.log(template, timestamp, `${src}: ${info}`)
  } else {
    console.log(template, timestamp, info)
  }
}

pubsub.listen(pubsub.topics.INFO, logMessage)

pubsub.listen(pubsub.topics.ERROR, (err) => {
  const details = global.JSON.stringify(
    Object.keys(err).map((key) => {
      const value = err[key]

      if (typeof value === 'object') {
        return `${key}: ${global.JSON.stringify(value)}`
      }

      return `${key}: ${value}`
    })
  )

  logMessage(details, `${err.requestId} ERROR`)
})

pubsub.listen(pubsub.topics.DATA_STORE, (info) => {
  logMessage(info, 'DATA STORE')
})

pubsub.listen(pubsub.topics.SERVER, (info) => {
  logMessage(info, 'SERVER')
})

module.exports = null
