const os = require('os');
const { Worker } = require('worker_threads');

const { MessageType } = require('./message-type');

class ThreadPool {
  constructor(count = os.cpus().length) {
    this.workers = [];
    this.isWorkerAvailable = {};
    this.pendingTasksQueue = [];

    for (let i = 0; i < count; i++) {
      const newWorker = new Worker('./src/habrahabr-parser-worker.js');
      this.isWorkerAvailable[newWorker.threadId] = true;

      newWorker.on('message', (message) => {
        if (message.type === MessageType.JOB_DONE && this.pendingTasksQueue.length !== 0) {
          const [firstPendingTask] = this.pendingTasksQueue;
          this.pendingTasksQueue.splice(0, 1);
          console.log('Task drained from queue');

          this.sendTaskToWorker(newWorker, firstPendingTask);
        } 
      });

      newWorker.on('error', (error) => {
        console.log(`Worker with id ${newWorker.threadId} failed with: `, error);
      });

      newWorker.on('exit', () => {
        console.log(`Worker with id ${newWorker.threadId} exited`);
      });

      this.workers.push(newWorker);
    }
  }

  parseArticle(link) {
    return new Promise((resolve, reject) => {
      const freeWorker = this.workers.find((worker) => this.isWorkerAvailable[worker.threadId]);

      const task = {
        link, 
        resolve
      };

      if (!freeWorker) {
        console.log('Task sent to queue');
        this.pendingTasksQueue.push(task);
      } else {
        this.sendTaskToWorker(freeWorker, task);
      }
    });
  }

  sendTaskToWorker(worker, {link, resolve}) {
    this.isWorkerAvailable[worker.threadId] = false;
    worker.postMessage(link);

    const handleWorkerMessage = (message) => {
      switch (message.type) {
        case MessageType.JOB_DONE:
          resolve(message.payload);
          this.isWorkerAvailable[worker.threadId] = true;

          console.log(`Worker with id ${worker.threadId} finished processing`);
          worker.off('message', handleWorkerMessage);
      }
    };

    worker.on('message', handleWorkerMessage);
  }
}

module.exports = {
  ThreadPool
};