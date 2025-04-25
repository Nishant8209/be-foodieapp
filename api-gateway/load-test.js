const autocannon = require('autocannon');

const routes = [
  '/api/restaurant',
  '/api/user',
];

const baseUrl = 'http://localhost:3000';

const runTest = (url) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Starting load test for: ${url}`);

    const start = Date.now();

    autocannon({
      url,
      connections: 100,
      duration: 30,
      method: 'GET',
    }, (err, result) => {
      const end = Date.now();
      const timeTakenSec = ((end - start) / 1000).toFixed(2);

      if (err) {
        console.error(`❌ Error testing ${url}:`, err);
        return reject(err);
      }

      console.log(`\n✅ Finished test for: ${url}`);
      autocannon.printResult(result); // Full table format

      console.log(`\n📊 Summary for ${url}`);
      console.log(`---------------------------------`);
      console.log(`🕒 Duration: ${timeTakenSec} seconds`);
      console.log(`📦 Total Requests: ${result.requests.total}`);
      console.log(`✅ Successful Requests/sec: ${result.requests.average}`);
      console.log(`📈 Max Requests/sec: ${result.requests.max}`);
      console.log(`📉 Min Requests/sec: ${result.requests.min}`);
      console.log(`---------------------------------\n`);

      resolve();
    });
  });
};

const runAllParallel = async () => {
  try {
    await Promise.all(routes.map(route => runTest(baseUrl + route)));
    console.log('\n🎉 All tests completed!');
  } catch (err) {
    console.error('Some tests failed:', err);
  }
};

runAllParallel();
