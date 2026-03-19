import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27018,
    dbName: 'cooking',
  },
  binary: {
    version: '7.0.15',
    os: {
      os: 'linux',
      dist: 'Ubuntu',
      release: '22.04',
    },
  },
});

console.log(`MongoDB Memory Server started: ${mongod.getUri()}`);
console.log('Press Ctrl+C to stop');

process.on('SIGINT', async () => {
  await mongod.stop();
  process.exit(0);
});

// Keep the process alive
setInterval(() => {}, 1 << 30);
