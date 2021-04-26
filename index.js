const TeleBot = require("telebot");
const axios = require('axios');
const indicators = require('trading-indicator');

const TOKEN_TELEGRAM_BOT = '1741100476:AAES4QL8JQFpJo0bUiXI6xJDwO62YLuE5Pc';
const INDODAX_BASE_URL = 'https://indodax.com/api';

const bot = new TeleBot({
  token: TOKEN_TELEGRAM_BOT,
  polling: true,
});

const commandList = [
  "/checkmarketdepth",
  "/checktrades",
  "/macross",
]

bot.on(commandList, async (message) => {
  console.log(message);
  const command = message.text.split(' ')[0].toLowerCase();
  const pair = message.text.split(' ')[1];

  if (commandList.includes(command)) {
    if (command === "/checkmarketdepth") {
      axios.get(`${INDODAX_BASE_URL}/${pair}/depth`)
      .then(res => {
        if (res.data) {
          if (res.data.buy.length > 0 && res.data.sell.length > 0) {
            const buyPower = res.data.buy.reduce((acc, item) => {
              return acc + parseFloat(item[1]);
            }, 0)
            const sellPower = res.data.sell.reduce((acc, item) => {
              return acc + parseFloat(item[1]);
            }, 0);
            
            let extensionMsg = 'buy power greater than sell power';
            if (buyPower < sellPower) {
              extensionMsg = 'sell power greater than buy power';
            }
            bot.sendMessage(
              message.from.id,`buy power: ${buyPower}\nsell power: ${sellPower}\n${extensionMsg}`
            );
          }
        }
      })
      .catch(err => {
        bot.sendMessage(message.from.id, err.toString());
      })
    } else if (command === "/checktrades") {
      axios.get(`${INDODAX_BASE_URL}/${pair}/trades`)
        .then(res => {
          if (res.data) {
            const buyBook = res.data.filter(item => {
              return item.type === 'buy'
            });
            const sellBook = res.data.filter(item => {
              return item.type === 'sell'
            });
            
            const buyTotalAmount = buyBook.reduce((acc, item) => {
              return acc + parseFloat(item.amount);
            }, 0);
            const sellTotalAmount = sellBook.reduce((acc, item) => {
              return acc + parseFloat(item.amount);
            }, 0);

            let extensionMsg = 'buy order book greater than sell order book';
            if (buyTotalAmount < sellTotalAmount) {
              extensionMsg = 'sell order book greater than buy order book';
            }
              
            bot.sendMessage(
              message.from.id,`total data: ${res.data.length}\nbuy amount total: ${buyTotalAmount}\nsell total amount: ${sellTotalAmount}\n${extensionMsg}`
            );
          }
        })
        .catch(err => {
          bot.sendMessage(message.from.id, err.toString());
        })
    } else if (command === "/macross") {
      console.log("pair: ", pair);
      try {
        let data = await indicators.alerts.maCross(50, 200, "indodax", pair, '1d', false);
        bot.sendMessage(
          message.from.id, `MA cross(50, 200)\ngolden cross: ${data.goldenCross}\ndeath cross: ${data.deathCross}`
        );
      } catch(err) {
        bot.sendMessage(
          message.from.id, err.toString()
        );
      }
    }
  }
})

bot.start();

