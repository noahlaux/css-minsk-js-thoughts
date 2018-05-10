const fsPromise = require('./fsPromise.js');

// fs.open('message.txt', 'a', (err, fd) => {
//   if (err) throw err;
//   fs.appendFile(fd, 'data to append', 'utf8', (err) => {
//     fs.close(fd, (err) => {
//       if (err) throw err;
//     });
//     if (err) throw err;
//   });
// });
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
