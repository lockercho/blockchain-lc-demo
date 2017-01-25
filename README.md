# Letters of Credit - A Smart Contract Implementation
This is a VERY SIMPLE demo to implement Letter of Credit using smart contract (Solidity)

# Usage
###### WARNING: Please try this demo in a private blockchain network
- Install nodejs and npm
- Install geth
- Create the roles in this demo: Bank, Importer, Exporter
- Set up `config.ini`
```
$ npm install
$ node ./create_LC.js
$ node ./demo.js
```

--


# 智慧合約信用狀
這是一個簡單的 demo，使用智慧合約來實現最簡單的即期信用狀交易流程。

###### WARNING: 這只是一個簡單且沒有驗證過安全性的 demo，請使用私有區塊鍊來執行。

#  用法
- 安裝 nodejs 及 npm
- 安裝 geth
- 在私鍊中創建合約所需要的角色：Bank、Importer、Exporter
- 參考 `config.template.ini`，將所需資料寫入 `config.ini`
```
$ npm install
$ node ./create_LC.js
$ node ./demo.js
```