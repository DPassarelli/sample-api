/* eslint-env mocha */

const ProcRunner = require('procmonrest')
const request = require('got')

/**
 * [port description]
 * @type {String}
 */
const port = 3000

describe('GET /ping', () => {
  let server = null

  before(() => {
    server = new ProcRunner({
      waitFor: /READY FOR TEST/
    })

    return server.start()
  })

  after(() => {
    if (server && server.isRunning) {
      return server.stop()
    }
  })

  describe('the expected response', () => {
    let response = null

    before(() => {
      return request(`http://localhost:${port}/ping`)
        .then((res) => {
          response = res
        })
    })

    it('must have the correct status code', () => {
      const expected = 200
      const actual = response.statusCode

      expect(actual).to.equal(expected)
    })

    it('must have the correct content type', () => {
      const pattern = /^text\/plain/i
      const actual = response.headers['content-type']

      expect(actual).to.match(pattern)
    })

    it('must have the correct response body', () => {
      const expected = 'pong\n'
      const actual = response.body

      expect(actual).to.equal(expected)
    })
  })
})
