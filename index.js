const axios = require('axios');
const express = require('express');

const { habrahabrParser } = require('./habrahabr-parser');

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/articles', (request, response) => {
  const requestConfig = {
    method: 'get',
    url: 'https://habr.com/ru/',
    responseType: 'text'
  }

  axios(requestConfig)
    .then((resp) => {
      const firstArticleLinks = habrahabrParser.getFirstArticlesLinks(resp.data, 4);
      const getFullArticleRequests = firstArticleLinks.map((link) => {
        const requestConfig = {
          method: 'get',
          url: link,
          responseType: 'text'
        };

        return axios(requestConfig)
          .then((resp) => habrahabrParser.parseArticle(resp.data));
      });

      return Promise.all(getFullArticleRequests);
    })
    .then((articles) => response.json(articles));
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});