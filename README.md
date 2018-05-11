# CSS-Minsk-JS Talk thoughts

## The idea

The idea of this talk is around the introduction of sugar syntax in the standard of
our languages and the impact that can have on the way we write code. ES standard has seen constant changes, some better than others, which have a huge impact on our understanding of the JavaScript language and the way we use it.

## The goal

At the end of this talk the audience should have:

1. A good understanding of the difference between using callbacks, promises and async/await
2. A good understanding of how promises and async/await works
3. Think of the implicit "side effects" some syntax brings, e.g. blocking the loop
4. Think of old browser support and resulted transpiled code
5. Think of the implications of sugar syntax and when does it make sense to use it 

## Some key content

Let's start with callbacks - promises - async/await

### Callbacks

The following code opens a file and appends some data using
the callback-based node fs API.

```JavaScript
fs.open('message.txt', 'a', (err, fd) => {
  if (err) throw err;
  fs.appendFile(fd, 'data to append', 'utf8', (err) => {
    fs.close(fd, (err) => {
      if (err) throw err;
    });
    if (err) throw err;
  });
});
```

Key points:

1. Positive: Using callbacks works on older versions of node or browsers (lamdas could be written as normal functions)
2. Negative: Even though the code is very explicit, the nesting makes it harder to read and one can easily end up having a so-called callback hell.

### Promises

Let's rewrite the above code using promises.

```JavaScript
let fd = -1;
fsPromise.open('message.txt', 'a')
  .then(fid => {
    fd = fid;
    return fsPromise.appendFile(fd, 'data to append', 'utf8');
  })
  .then(() => fsPromise.close(fd))
  .catch(err => {
    if (fd < 0) {
      // close the file if it is still open
      // if 'close' throws an error it will be automatically thrown
      // outside of this catch callback
      fsPromise.close(fd); 
    }
    throw err;
  });
```

Key points:

1. `then` and `catch` receive function(s) as arguments - so still using callbacks
but in a more compact and automatic way.
2. Positive: There's nothing magic about promices - you can find some 200+ lines of code implementations online, including comments, to give you a very good idea how they work.
3. The example above is flatter and easier to understand.
4. If you don't have `fsPromise` you can simply implement one yourself. The code bellow is an implementation for the API used in the example above.

(maybe you should mention https://www.npmjs.com/package/es6-promisify here?)

```JavaScript
function open(fileName, options) {
  return new Promise((resolve, reject) => {
    fs.open(fileName, options, (err, fd) => {
      if (err) {
        return reject(err);
      }
      return resolve(fd);
    });
  });
}

function appendFile(fd, data, options) {
  return new Promise((resolve, reject) => {
    fs.appendFile(fd, data, options, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    })
  });
}

function close(fd) {
  return new Promise((resolve, reject) => {
    fs.close(fd, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    })
  });
}

module.exports = {
  open,
  appendFile,
  close,
};
```

### Async/Await

Let's take the same example with async/await.

```JavaScript
let fd = -1;
try {
  fd = await fsPromise.open('message.txt', 'a');
  await fsPromise.appendFile(fd, 'data to append', 'utf8');
  await fsPromise.close(fd);
} catch (err) {
  if (fd < 0) {
    // close the file if it is still open
    // if 'close' throws an error it will be automatically thrown
    // outside of this catch block
    fsPromise.close(fd);
  }
  throw err;
}

/*
async.js:15
  fd = await fsPromise.open('message.txt', 'a');
             ^^^^^^^^^

SyntaxError: Unexpected identifier
    at createScript (vm.js:80:10)
    at Object.runInThisContext (vm.js:139:10)
    at Module._compile (module.js:607:28)
    at Object.Module._extensions..js (module.js:654:10)
    at Module.load (module.js:556:32)
    at tryModuleLoad (module.js:499:12)
    at Function.Module._load (module.js:491:3)
    at Function.Module.runMain (module.js:684:10)
    at startup (bootstrap_node.js:187:16)
    at bootstrap_node.js:608:3

*/
```

Oops, SyntaxError in node `v8.9.4`. Let's fix it:

```JavaScript
const appendData = async () => {
  let fd = -1;
  try {
    fd = await fsPromise.open('message.txt', 'a');
    await fsPromise.appendFile(fd, 'data to append', 'utf8');
    await fsPromise.close(fd);
  } catch (err) {
    if (fd < 0) {
      // close the file if it is still open
      // if 'close' throws an error it will be automatically thrown
      // outside of this catch block
      fsPromise.close(fd);
    }
    throw err;
  }
}

appendData().then(() => {
  console.log('done');
});

// output: done
```

you could also wrap it in anonymous self-executing function like 

(async() => {
  // beef
})();

- Wait, what? I got to wrap it in an async function?
- Seems like it.
- Wait again... you used the `fsPromise` implementation that was promisifying the `fs` API?
- Yeah, you use `await` to wait for the result returned by an async(hronous) function. An 
async function returns a promise that's why one could use `.then` with the `appendData()` result.
- Okay, okay. But how does the result of `fsPromise.open` end up in `fd`.
- Magic!

Key points:

1. Positive: The code is very flat and easy to read. Looks a lot like sync code.
2. Negative: Looks a lot like sync code. That `try/catch` is a bit weird.
3. If an async method returns a promise why not just use promises?!

### Diving deeper into async/await

Let's take another example of using async/await.

```JavaScript
// dummy implementation used to just illustrate the point
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

```

Here we have a method `makeRequest` which will populate an array of articles. We then print the array. What it is not obvious here is that the for loop will block at every await until that gets resolved meaning that the execution time of this code will be above 2.5 seconds (5 times 500 milliseconds + the rest of the execution time). This behaviour might not be what the programmer intended but it is hidden behind the implementation details of how `await` works.

If we don't care about the order of which the articles are inserted in the array, or we can sort them later if we want, we could rewrite the above example using promises as follows:

```JavaScript
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

```

Here all 5 requests to `getArticle` will be asynchronous and will happen in parallel.

If we want to implement the same parallel behavior using async/await we could do:

```js
// dummy implementation used to just illustrate the point
(async() => {
    const getArticle = id => {
      return new Promise(resolve =>
        setTimeout(() => {
          resolve({
            id: id,
            name: 'Article #' + id
          });
        }, 500)
      );
    };

    const getArticles = async () => Promise.all([1, 2, 3, 4, 5].map(async id => await getArticle(id)));

    const articles = await getArticles();
     
    console.log(articles);
})();
```


### Shipping the code to older browsers.

Now that we understand that the async/await version of `makeRequest` is actually a
_serial array map_ we can go on and try to generalise it.

```JavaScript
async function serialAsyncMap(collection, fn) {
  let result = [];
  
  for (let item of collection) {
    result.push(await fn(item));
  }
  
  return result;
}
```

Then we can simply have:

```JavaScript
let articles = [];

const makeRequest = async () => {
  articles = await serialAsyncMap([1, 2, 3, 4, 5], getArticle);
}


makeRequest()
  .then(() => {
    console.log(articles);
  });
```

arguably a little more flat and simple without the need of declaring variables outside the scope (articles)

```js
(async() => {

    async function serialAsyncMap(collection, fn) {
      return Promise.all(collection.map(async item => fn(item)));
    }

    const makeRequest = async () => await serialAsyncMap([1, 2, 3, 4, 5], getArticle);

    const articles = await makeRequest();

    console.log(articles);

})();
```

If you want to ship this code to the browser you can compile it using Babel/Regenerator.
A harmless-looking function like `serialAsyncMap` compiles into **56** lines of code.

### Conclusion on async/await

1. Mixing async/await code with sync code might look a bit weird
2. Untill we have full browser support or we stop carrying about older browsers, shipping transpiled async/await code should be done with some considerations
3. Your code will be less functional and you wont be able to chain execution the same way as with promisses. 
 (maybe you can elaborate what less functional means also how you can't chain the execution)
4. Keep in mind that `await` blocks a loop so
```JavaScript
const makeRequest = async () => {
  for (const id of [1, 2, 3, 4, 5]) {
    const res = await getArticle(id);
    articles.push(res);
  }
}
```

is not the same with

```JavaScript
const makeRequest = () => {
  let promises = [];
  for (const id of [1, 2, 3, 4, 5]) {
    promises.push(getArticle(id));
  }
  return Promise.all(promises).then(res => articles = res);
}
```

but can be achieved by

```js
const getArticles = async () => Promise.all([1, 2, 3, 4, 5].map(async id => await getArticle(id)));

const articles = await getArticles();
```

## More on the talk

Depending on how I will be organising the slides with the above information or if I will change some of them and how much time there is left in the talk I might give an example about `interface`, `class` and `abstract class` in TypeScript.
