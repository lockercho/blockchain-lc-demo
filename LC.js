var fs = require('fs')
var web3 = require('./web3Provider');
var content = fs.readFileSync('./LC.sol', {encoding: 'utf8'})

module.exports = web3.eth.compile.solidity(content);