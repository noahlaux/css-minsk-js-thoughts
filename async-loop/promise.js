const getArticle = (id) => {
  return new Promise(resolve => setTimeout(() => {
    resolve({
      id: id,
      name: 'Article #' + id
    });
  }, 500));
}

let articles = [];;

const makeRequest = () => {
  let promises = [];
  for (const id of [1, 2, 3, 4, 5]) {
    promises.push(getArticle(id));
  }
  return Promise.all(promises).then(res => articles = res);
}

makeRequest()
  .then(() => {
    console.log(articles);
  });