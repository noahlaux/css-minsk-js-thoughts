const getArticle = (id) => {
  return new Promise(resolve => setTimeout(() => {
    resolve({
      id: id,
      name: 'Article #' + id
    });
  }, 500));
}

async function serialAsyncMap(collection, fn) {
  let result = [];

  for (let item of collection) {
    result.push(await fn(item));
  }

  return result;
}

let articles = [];

const makeRequest = async () => {
  articles = await serialAsyncMap([1, 2, 3, 4, 5], getArticle);
}


makeRequest()
  .then(() => {
    console.log(articles);
  });