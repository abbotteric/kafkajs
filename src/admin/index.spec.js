const createAdmin = require('./index')
const {
  secureRandom,
  sslConnectionOpts,
  saslConnectionOpts,
  saslSCRAM256ConnectionOpts,
  saslSCRAM512ConnectionOpts,
  createCluster,
  sslBrokers,
  saslBrokers,
  newLogger,
} = require('testHelpers')

describe('Admin', () => {
  let topicName, admin

  beforeEach(() => {
    topicName = `test-topic-${secureRandom()}`
  })

  afterEach(async () => {
    await admin.disconnect()
  })

  test('support SSL connections', async () => {
    const cluster = createCluster(sslConnectionOpts(), sslBrokers())
    admin = createAdmin({ cluster, logger: newLogger() })

    await admin.connect()
  })

  test('support SASL PLAIN connections', async () => {
    const cluster = createCluster(saslConnectionOpts(), saslBrokers())
    admin = createAdmin({ cluster, logger: newLogger() })
    await admin.connect()
  })

  test('support SASL SCRAM 256 connections', async () => {
    const cluster = createCluster(saslSCRAM256ConnectionOpts(), saslBrokers())
    admin = createAdmin({ cluster, logger: newLogger() })
    await admin.connect()
  })

  test('support SASL SCRAM 512 connections', async () => {
    const cluster = createCluster(saslSCRAM512ConnectionOpts(), saslBrokers())
    admin = createAdmin({ cluster, logger: newLogger() })
    await admin.connect()
  })

  test('throws an error if the topics array is invalid', async () => {
    admin = createAdmin({ cluster: createCluster(), logger: newLogger() })
    await expect(admin.createTopics({ topics: null })).rejects.toHaveProperty(
      'message',
      'Invalid topics array null'
    )

    await expect(admin.createTopics({ topics: 'this-is-not-an-array' })).rejects.toHaveProperty(
      'message',
      'Invalid topics array this-is-not-an-array'
    )
  })

  test('throws an error if the topic name is not a valid string', async () => {
    admin = createAdmin({ cluster: createCluster(), logger: newLogger() })
    await expect(admin.createTopics({ topics: [{ topic: 123 }] })).rejects.toHaveProperty(
      'message',
      'Invalid topics array, the topic names have to be a valid string'
    )
  })

  test('throws an error if there are multiple entries for the same topic', async () => {
    admin = createAdmin({ cluster: createCluster(), logger: newLogger() })
    const topics = [{ topic: 'topic-123' }, { topic: 'topic-123' }]
    await expect(admin.createTopics({ topics })).rejects.toHaveProperty(
      'message',
      'Invalid topics array, it cannot have multiple entries for the same topic'
    )
  })

  test('create topics', async () => {
    admin = createAdmin({ cluster: createCluster(), logger: newLogger() })

    await admin.connect()
    await expect(admin.createTopics({ topics: [{ topic: topicName }] })).resolves.toEqual({
      topicErrors: [
        {
          errorCode: 0,
          topic: topicName,
        },
      ],
    })
  })
})
