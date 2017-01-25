var fs = require('fs');
var ini = require('ini');
var web3 = require('./web3Provider');
var eth = web3.eth;

if(!fs.existsSync('./config.ini')) {
  console.log("No config.ini found!")
  process.exit(1);
}

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

var bank = config.bank;
var importer = config.importer;
var exporter = config.exporter;
var pass = config.pass;

var totalPrice = 100000;
var salesContract = 'SOME_SECRET';

var LcTemplate = require('./LC.js')
var LcContract = web3.eth.contract(LcTemplate.LC.info.abiDefinition);
web3.personal.unlockAccount(bank, pass);

var params = {
	from: bank, 
	data: LcTemplate.LC.code, 
	gas: 1000000
}

var lc = LcContract.new(importer, exporter, bank, totalPrice, salesContract, params, function(e, contract){
  if(!e) {

    if(!contract.address) {
      console.log("\n[ 將信用狀送到區塊鍊網路 ] \n 等待結算中... TransactionHash: " + contract.transactionHash + " ");

    } else {
      console.log("[ 信用狀已送達區塊鍊網路! ]\n Address: " + contract.address, "\n");
      // console.log(contract)
      var myLc = LcContract.at(contract.address)

      fs.writeFileSync('./demo.address', contract.address, {encoding: 'utf8'})
    }
  }
})
