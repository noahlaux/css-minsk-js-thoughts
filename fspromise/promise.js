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