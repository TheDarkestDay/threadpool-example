const { parentPort, threadId } = require('worker_threads');
const axios = require('axios');

const { MessageType } = require('./message-type');
const { habrahabrParser } = require('./habrahabr-parser');

parentPort.on('message', (input) => {
  console.log(`Worker with id ${threadId} started processing input`);

  const requestConfig = {
    method: 'get',
    url: input,
    responseType: 'text'
  };

  return axios(requestConfig)
    .then((resp) => {
      const parsedArticle = habrahabrParser.parseArticle(resp.data);

      parentPort.postMessage({
        type: MessageType.JOB_DONE,
        payload: parsedArticle
      });
    });
});