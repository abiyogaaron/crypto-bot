const TeleBot = require("telebot");
const axios = require('axios');

const TOKEN_TELEGRAM_BOT = '1741100476:AAES4QL8JQFpJo0bUiXI6xJDwO62YLuE5Pc';
const INDODAX_BASE_URL = 'https://indodax.com/api';

const bot = new TeleBot({
  token: TOKEN_TELEGRAM_BOT,
  polling: true,
});

const commandList = [
  "/checkmarketdepth"
]

bot.on(commandList, (message) => {
  console.log(message);
  const command = message.text.split(' ')[0];
  const pair = message.text.split(' ')[1];

  if (commandList.includes(command)) {
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
        bot.sendMessage(message.from.id, `pair coin not found ! please try again broh`);
      })
  } else {
    bot.sendMessage(message.from.id, `command not registered in command list !`);
  }
})

bot.start();

