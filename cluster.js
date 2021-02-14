const cluster = require('cluster');
const os = require('os');
const { init: initializeTasks } = require('@tasks/init');
const { init: app } = require('./app');

if (cluster.isMaster) {
  const cpus = os.cpus().length;

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(
        `Worker ${worker.process.pid} crashed. Starting a new worker.`
      );
      const nw = cluster.fork();
      console.log(
        `Worker ${nw.process.pid} will replace worker ${worker.process.pid}`
      );
    }
  });

  console.log(`Master PID: ${process.pid} Workers: ${cpus}`);
  initializeTasks();
} else {
  app();
}