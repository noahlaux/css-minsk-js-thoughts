const getArticle = (id) => {
  return new Promise(resolve => setTimeout(() => {
    resolve({
      id: id,
      name: 'Article #' + id
    });
  }, 500));
}

const articles = [];

const makeRequest = async () => {
  for (const id of [1, 2, 3, 4, 5]) {
    const res = await getArticle(id);
    articles.push(res);
  }
}

makeRequest()
  .then(() => {
    console.log(articles);
  });