const packageInfo = require('../package.json')
const pubsub = require('@dpassarelli/topico')

const dataStore = require('@api/data-store')()
const HttpListener = require('@api/server')

let config = null

/**
 * This handler is important, because we don't want to silently ignore potential
 * landmines lurking around in asynchronous code blocks.
 */
process.once('unhandledRejection', (err) => {
  pubsub.say(
    pubsub.topics.INFO,
    'unhandled REJECTION detected, stopping immediately...'
  )

  pubsub.say(pubsub.topics.ERROR, err)

  process.exit(1)
})

/**
 * This handler is important, because we don't want to silently ignore potential
 * landmines lurking around in synchronous code blocks, either.
 */
process.once('unhandledException', (err) => {
  pubsub.say(
    pubsub.topics.INFO,
    'unhandled EXCEPTION detected, stopping immediately...'
  )

  pubsub.say(pubsub.topics.ERROR, err)

  process.exit(1)
})

/**
 * Here we go...
 */
require('./logger.js') // this does not currently export a value

pubsub.say(
  pubsub.topics.INFO,
  `starting API Server v${packageInfo.version}, running on Node.js ${process.version}...`
)

/**
 * Check app configuration (environment variables).
 */
pubsub.say(
  pubsub.topics.INFO,
  ['verifying app configuration']
)

config = require('@api/app-config')

const variables = Object.keys(config.rawVariables)

if (variables.length > 0) {
  pubsub.say(
    pubsub.topics.INFO,
    'listing API environment variables:'
  )

  pubsub.say(
    pubsub.topics.INFO,
    variables.map((name) => { return `${name} = ${config.rawVariables[name]}` })
  )
} else {
  pubsub.say(
    pubsub.topics.INFO,
    'none are set'
  )
}

/**
 * An instance of the http listener (a.k.a. web server).
 * @type {Object}
 */
let httpListener = null

pubsub.say(pubsub.topics.INFO, 'initializing data store')

dataStore.init()
  .then(() => {
    return new Promise((resolve) => {
      pubsub.say(pubsub.topics.INFO, 'starting HTTP server')

      httpListener = new HttpListener()
      httpListener.start({ port: config.port })

      /**
       * Once the HTTP listener is ready to accept incoming messages, then the
       * next step can be taken.
       */
      pubsub.listenFor(pubsub.topics.SERVER, /^listening for messages/, resolve)
    })
  })
  .then(() => {
    /**
     * This is the signal to let the functional tests know that the server is
     * ready to be exercised (so to speak).
     */
    if (config.isTestEnvironment) {
      pubsub.say(pubsub.topics.INFO, '***READY FOR TEST***')
    }
  })
