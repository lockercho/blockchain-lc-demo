var fs = require('fs');
var ini = require('ini');
var web3 = require('./web3Provider');
var eth = web3.eth;
var LcTemplate = require('./LC.js')
var LcContract = web3.eth.contract(LcTemplate.LC.info.abiDefinition);

if(!fs.existsSync('./config.ini')) {
  console.log("No config.ini found!")
  process.exit(1);
}

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

var bank = config.bank;
var importer = config.importer;
var exporter = config.exporter;
var pass = config.pass;
var totalPrice = config.totalPrice;
var salesContract = config.salesContract;

var LCStatus = {
	APPLIED: 0, 
	FOUNDED: 1, 
	REVEWING: 2, 
	DOC_OK: 3, 
	DOC_DEFECT: 4, 
	DONE_SUCCESS: 5, 
	DONE_FAILURE: 6 
}
var statusName = [
	'已申請', '已成立', '審查文件中', '文件無誤', '文件瑕疵', '信用狀成功', '信用狀失敗'
];

function getStatus(LC) {
	var status = myLc.getStatus.call().toString();
	return status;
}

function waitStatus(LC, status, callback) {
	console.log('等待結算.... ')
	if(getStatus(LC) == status) {
		if(typeof callback == 'function') {
			console.log('結算完成！ 目前狀態：', statusName[status])
			return callback();
		}
	}
	setTimeout(waitStatus.bind(null, LC, status, callback), 1500);
}

var LCAddr = fs.readFileSync('./demo.address', {encoding: 'utf8'})

console.log('[ 智慧合約：', LCAddr, ']', "\n")

var myLc = LcContract.at(LCAddr)
var waitFounded = waitStatus.bind(null, myLc, LCStatus.FOUNDED);
var waitReviewing = waitStatus.bind(null, myLc, LCStatus.REVEWING);
var waitDocDefect = waitStatus.bind(null, myLc, LCStatus.DOC_DEFECT);
var waitSuccess = waitStatus.bind(null, myLc, LCStatus.DONE_SUCCESS);

function printBalance() {

	var line = "==================================================\n"
	console.log(line)
	var importInfo = '  開狀行餘額： '+ eth.getBalance(bank).toString();
	importInfo = 
	console.log('       開狀行餘額： '+ eth.getBalance(bank).toString() + "\n")
	console.log('       進口商餘額： '+ eth.getBalance(importer).toString() + "\n")
	console.log('       出口商餘額： '+ eth.getBalance(exporter).toString() + "\n")
	console.log(line)
}

printBalance();

web3.personal.unlockAccount(bank, pass);


myLc.signFound.sendTransaction('123', {
	from: bank, gas: 400000, 
	to: LCAddr,
	value: 100000})

console.log("\n [ 開狀銀行簽署信用狀 ]\n")

waitFounded(function() {
	// send other transaction
	web3.personal.unlockAccount(exporter, pass);

	myLc.sendDocuments.sendTransaction('documents', {from: exporter, gasLimit:5000000, gas: 4000000, to: LCAddr});
	console.log("\n [ 出口商提交審查單據 ]\n [ 銀行開始審查單據 ]\n")

	waitReviewing(function() {
		web3.personal.unlockAccount(bank, pass);
		myLc.sendReviewResult.sendTransaction(false, 100, {from: bank, gasLimit:5000000, gas: 4000000, to: LCAddr})
		console.log("\n [ 開狀銀行審查完畢，結果為：文件瑕疵 ]\n [ 設定瑕疵費用 ] \n")

		waitDocDefect(function() {
			web3.personal.unlockAccount(importer, pass);
			myLc.acceptOrNot.sendTransaction(true, {from: importer, gasLimit:5000000, gas: 4000000, to: LCAddr})
			console.log("\n [ 進口商確認接受瑕疵 ]\n [ 等待交易結算及付款 ] \n")

			waitSuccess(function() {
				console.log("\n [ 交易結算完成，智慧合約結束 ] \n\n")
				printBalance();
			})
		})
	});
})
