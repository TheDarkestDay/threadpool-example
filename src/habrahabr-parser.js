const cheerio = require('cheerio');

class HabrahabrParser {
  getFirstArticlesLinks(mainPageMarkup, count) {
    const $ = cheerio.load(mainPageMarkup);

    return $('.post__title_link')
      .slice(0, count)
      .map((_, postTitleElement) => $(postTitleElement).attr('href'))
      .get();
  }

  parseArticle(articleMarkup) {
    const $ = cheerio.load(articleMarkup);

    return {
      title: $('.post__title-text').text(),
      author: {
        username: $('header.post__meta .user-info__nickname').text(),
        profile: $('a.post__user-info.user-info').attr('href')
      }
    }
  }
}

const habrahabrParser = new HabrahabrParser();

module.exports = {
  habrahabrParser
};