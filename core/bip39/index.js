const fs = require('fs');

const getWords = () => {
  const words = fs.readFileSync(`${__dirname}/english.txt`, 'utf8').split('\n');
  return words;
}

module.exports = {
  getWords,
};