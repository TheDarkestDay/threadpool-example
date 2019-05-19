const axios = require('axios');
const express = require('express');

const { ThreadPool } = require('./src/thread-pool');

const { habrahabrParser } = require('./src/habrahabr-parser');

const app = express();

const PORT = process.env.PORT || 3000;

const threadPool = new ThreadPool(3);

app.get('/articles', (request, response) => {
  const requestConfig = {
    method: 'get',
    url: 'https://habr.com/ru/',
    responseType: 'text'
  }

  axios(requestConfig)
    .then((resp) => {
      const firstArticleLinks = habrahabrParser.getFirstArticlesLinks(resp.data, 12);
      const parseArticleJobs = firstArticleLinks.map((link) => threadPool.parseArticle(link));

      return Promise.all(parseArticleJobs);
    })
    .then((articles) => response.json(articles));
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});