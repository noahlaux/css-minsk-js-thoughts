const fs = require('fs');

// fs.open('message.txt', 'a', (err, fd) => {
//   if (err) throw err;
//   fs.appendFile(fd, 'data to append', 'utf8', (err) => {
//     fs.close(fd, (err) => {
//       if (err) throw err;
//     });
//     if (err) throw err;
//   });
// });

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