require('dotenv').config();
const publicSettings = require('./setting');

const settings = {
  // Get values from public settings
  botName: publicSettings.BOT_NAME,
  botOwner: publicSettings.OWNER_NAME,
  ownerNumber: publicSettings.OWNER_NUMBER,
  SESSION_ID: publicSettings.SESSION_ID,
  timezone: publicSettings.TIMEZONE,
  commandMode: publicSettings.MODE,
  
  // Your additional settings
  packname: 'DELTA MD',
  author: 'sir 𝕗𝕣𝕠𝕟𝕥𝕚𝕖𝕣',
  version: '2.1.1',
  prefix: '.',
  giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  maxStoreMessages: 20,
  storeWriteInterval: 10000,
  description: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ DELTA MD",
  updateZipUrl: "https://github.com/XdKing2/MALVIN-XD/archive/refs/heads/main.zip",
  imageUrl: "https://i.ibb.co/ymnnfp45/ca7403d30072.jpg",
  MENU_AUDIO_URL: "https://files.catbox.moe/jrhodx.mp3",
  ALIVE_AUDIO_URL: "https://files.catbox.moe/dy9z54.mp3",
  
};

global.SESSION_ID = settings.SESSION_ID;
module.exports = settings;
