// Malvin King 🤴 
require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// ========== TEMP CLEANUP SYSTEM ==========
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Redirect temp storage away from system /tmp
process.env.TMPDIR = tempDir;
process.env.TEMP = tempDir;
process.env.TMP = tempDir;

// Auto-cleaner every hour
setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err) return;
        let cleaned = 0;
        const now = Date.now();
        
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && now - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => {
                        cleaned++;
                        console.log(`🧹 Cleaned temp file: ${file}`);
                    });
                }
            });
        });
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} temp files`);
        }
    });
}, 60 * 60 * 1000);

console.log('🔧 Temp cleanup system initialized');

// ========= TINYCAP SETTING ================

// Tiny caps mapping
const tinyCapsMap = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
    j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'q', r: 'ʀ',
    s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
};

const toTinyCaps = (str) => {
    return str.split('').map((char) => tinyCapsMap[char.toLowerCase()] || char).join('');
};

// ========== IMPORT SETTINGS MANAGER ==========
const { loadSettings } = require('./lib/settingsManager');

// Import DELTA MD framework
const { delta, commands } = require('./delta')
// ========== CHANNEL INFO CONFIG =======
const { channelInfo } = require('./lib/messageConfig')
// Import lightweight store
const store = require('./lib/lightweight_store')

// ========== IMPORT FROM LIB FILES ==========
const isAdmin = require('./lib/isAdmin');
const { isBanned } = require('./lib/isBanned');
const isOwnerOrSudo = require('./lib/isOwner');

// ========== IMPORT PREFIX SYSTEM ==========
const { getPrefix, setPrefix, resetPrefix } = require('./lib/prefix');

// ========== IMPORT NEW ANTIDELETE ==========
const { AntiDelete, storeMessage: storeAntideleteMessage, loadAntideleteConfig } = require('./plugins/antidelete');

// ========== IMPORT ANTILINK SYSTEM ==========
const { Antilink } = require('./lib/antilink');

// ========== IMPORT AUTO STATUS SYSTEM ==========
const { handleStatusUpdate } = require('./plugins/autostatus');

// Initialize store
store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// ========== FIX: INITIALIZE GLOBAL.SETTINGS BEFORE USE ==========
// Initialize global.settings if it doesn't exist
if (!global.settings) {
    global.settings = {};
}
console.log('🔧 Global settings initialized');

// ========== LOAD PERSISTENT SETTINGS ==========
const persistentSettings = loadSettings();
// Update global settings with persistent values - WITH SAFETY CHECK
if (persistentSettings && typeof persistentSettings === 'object') {
    Object.assign(global.settings, persistentSettings);
   // console.log('⚙️ Persistent settings loaded');
} else {
    console.log('⚠️ No persistent settings found, using defaults');
}
// ========== PREFIX HANDLING ==========
// Use dynamic prefix from prefix module
//const PREFIX = getPrefix();

// ========== ESSENTIAL FUNCTIONS ==========

// Message count functions
function incrementMessageCount(chatId, senderId) {
    try {
        const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
        if (!data.messages) data.messages = {};
        if (!data.messages[chatId]) data.messages[chatId] = {};
        data.messages[chatId][senderId] = (data.messages[chatId][senderId] || 0) + 1;
        fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
    } catch (error) {
        //console.error('Error incrementing message count:', error);
    }
}

function topMembers(sock, chatId, isGroup) {
    try {
        if (!isGroup) return;
        const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
        const chatData = data.messages?.[chatId];
        if (!chatData) {
            sock.sendMessage(chatId, { text: 'No message data available for this group.' });
            return;
        }
        
        const sorted = Object.entries(chatData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        let text = '🏆 *TOP MEMBERS*\n\n';
        sorted.forEach(([jid, count], index) => {
            text += `${index + 1}. @${jid.split('@')[0]} - ${count} messages\n`;
        });
        
        sock.sendMessage(chatId, { 
            text, 
            mentions: sorted.map(([jid]) => jid) 
        });
    } catch (error) {
        //console.error('Error in topMembers:', error);
    }
}

// Game state management
const gameStates = {
    tictactoe: new Map(),
    hangman: new Map(),
    trivia: new Map()
};

// Anti-call state
function readAnticallState() {
    try {
        return JSON.parse(fs.readFileSync('./data/anticall.json', 'utf-8'));
    } catch {
        return { enabled: false };
    }
}

// PM blocker state
function readPmBlockerState() {
    try {
        return JSON.parse(fs.readFileSync('./data/pmblocker.json', 'utf-8'));
    } catch {
        return { enabled: false, message: 'Private messages are blocked.' };
    }
}

// ========== ADDITIONAL ESSENTIAL FUNCTIONS ==========

// Autotyping functionality
async function handleAutotypingForMessage(sock, chatId, userMessage) {
    try {
        const { isAutotypingEnabled } = require('./plugins/autotyping');
        if (await isAutotypingEnabled(chatId)) {
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await sock.sendPresenceUpdate('paused', chatId);
        }
    } catch (error) {
        //console.error('Error in autotyping:', error);
    }
}

async function showTypingAfterCommand(sock, chatId) {
    try {
        const { isAutotypingEnabled } = require('./plugins/autotyping');
        if (await isAutotypingEnabled(chatId)) {
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.sendPresenceUpdate('paused', chatId);
        }
    } catch (error) {
        //console.error('Error in post-command typing:', error);
    }
}

// Autoread functionality
async function handleAutoread(sock, message) {
    try {
        const { isAutoreadEnabled } = require('./plugins/autoread');
        const chatId = message.key.remoteJid;
        if (await isAutoreadEnabled(chatId)) {
            await sock.readMessages([message.key]);
        }
    } catch (error) {
      //  console.error('Error in autoread:', error);
    }
}

// Chatbot response
async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    try {
        const { handleChatbotResponse } = require('./plugins/chatbot');
        await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
    } catch (error) {
       // console.error('Error in chatbot response:', error);
    }
}

// Mention detection
async function handleMentionDetection(sock, chatId, message) {
    try {
        const { handleMentionDetection } = require('./plugins/mention');
        await handleMentionDetection(sock, chatId, message);
    } catch (error) {
        console.error('Error in mention detection:', error);
    }
}

// Command reactions
async function addCommandReaction(sock, message) {
    try {
        const { addCommandReaction } = require('./lib/reactions');
        await addCommandReaction(sock, message);
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// ========== GLOBAL SETTINGS ==========

global.botname = "🧊 DELTA MD 🐬";
global.themeemoji = "👌";

// ========== BOT CONFIGURATION ==========
const SESSION_DIR = path.join(__dirname, 'session');
const CREDS_PATH = path.join(SESSION_DIR, 'creds.json');
const NEWSLETTER_IDS =[
    "120363402507750390@newsletter",
    "120363405304938881@newsletter",
    "120363420989526190@newsletter", 
    "120363419136706156@newsletter"
];

const newsletterJids = [
    "120363402507750390@newsletter",
    "120363405304938881@newsletter",
    "120363420989526190@newsletter", 
    "120363419136706156@newsletter"
];
const emojis = ["🎉", "🪀", "🎀","💫"];

let phoneNumber = "263786166039"
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// Memory optimization
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 Garbage collection completed')
    }
}, 60_000)

// Memory monitoring
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...')
        process.exit(1)
    }
}, 30_000)

// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}

// ========== ENHANCED MEGA SESSION SYSTEM ==========
async function downloadSessionData() {
    try {
        await fs.promises.mkdir(SESSION_DIR, { recursive: true });
        
        if (!existsSync(CREDS_PATH)) {
            if (!global.SESSION_ID) {
                console.log(chalk.red('Session ID not found and creds.json missing! Falling back to pairing code...'));
                return false;
            }

            // Parse session ID type
            if (global.SESSION_ID.startsWith("starcore~")) {
                // Base64 session
                console.log(chalk.green('[ ⏳ ] Decoding base64 session'));
                const base64Data = global.SESSION_ID.replace("starcore~", "");
                if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                    throw new Error("Invalid base64 format in SESSION_ID");
                }
                const decodedData = Buffer.from(base64Data, "base64");
                let sessionData;
                try {
                    sessionData = JSON.parse(decodedData.toString("utf-8"));
                } catch (error) {
                    throw new Error("Failed to parse decoded base64 session data: " + error.message);
                }
                await fs.promises.writeFile(CREDS_PATH, decodedData);
                console.log(chalk.green('[ ✅ ] Base64 session decoded and saved successfully'));
                return true;
                
            } else if (global.SESSION_ID.startsWith("malvin~")) {
                // MEGA.nz session
                console.log(chalk.bold.yellow('[ 📥 ] Downloading MEGA.nz session'));
                const { File } = require('megajs');
                const megaFileId = global.SESSION_ID.replace("malvin~", "");
                const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
                
                const data = await new Promise((resolve, reject) => {
                    filer.loadAttributes((err, attributes) => {
                        if (err) {
                            reject(new Error(`Failed to load file attributes: ${err.message}`));
                            return;
                        }
                        console.log(chalk.blue(`[ 📦 ] File found: ${attributes.name}`));
                        
                        filer.download((err, data) => {
                            if (err) {
                                reject(new Error(`Download failed: ${err.message}`));
                                return;
                            }
                            console.log(chalk.green(`[ ✅ ] MEGA session downloaded successfully`));
                            resolve(data);
                        });
                    });
                });
                
                await fs.promises.writeFile(CREDS_PATH, data);
                console.log(chalk.bold.green('[ ✅ ] MEGA session downloaded and saved successfully'));
                return true;
                
            } else {
                throw new Error("Invalid SESSION_ID format. Use 'starcore~' for base64 or 'malvin~' for MEGA.nz");
            }
        }
        console.log('creds.json already exists');
        return true;
    } catch (error) {
        console.error(chalk.red('Error downloading session data:', error.message));
        
        // Fallback to cached session if available
        if (existsSync(CREDS_PATH)) {
            console.log(chalk.yellow('[ 🔄 ] Falling back to cached session'));
            return true;
        }
        
        return false;
    }
}

// Enhanced session loader with multiple format support
async function loadSession() {
    try {
        if (!global.SESSION_ID) {
            console.log(chalk.yellow('[ ⏳ ] No SESSION_ID provided - Using QR/Pairing code'));
            return null;
        }

        console.log(chalk.blue(`[ 🔍 ] Processing session ID: ${global.SESSION_ID.substring(0, 20)}...`));

        let sessionData;

        if (global.SESSION_ID.startsWith("starcore~")) {
            // Base64 session
            console.log(chalk.green('[ ⏳ ] Decoding base64 session'));
            const base64Data = global.SESSION_ID.replace("starcore~", "");
            if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
                throw new Error("Invalid base64 format in SESSION_ID");
            }
            const decodedData = Buffer.from(base64Data, "base64");
            try {
                sessionData = JSON.parse(decodedData.toString("utf-8"));
            } catch (error) {
                throw new Error("Failed to parse decoded base64 session data: " + error.message);
            }
            await fs.promises.writeFile(CREDS_PATH, decodedData);
            console.log(chalk.green('[ ✅ ] Base64 session decoded and saved successfully'));
            
        } else if (global.SESSION_ID.startsWith("malvin~")) {
            // MEGA.nz session
            console.log(chalk.bold.yellow('[ 📥 ] Downloading MEGA.nz session'));
            const { File } = require('megajs');
            const megaFileId = global.SESSION_ID.replace("malvin~", "");
            const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
            
            const data = await new Promise((resolve, reject) => {
                filer.loadAttributes((err, attributes) => {
                    if (err) {
                        reject(new Error(`Failed to load file attributes: ${err.message}`));
                        return;
                    }
                    console.log(chalk.blue(`[ 📦 ] File found: ${attributes.name}`));
                    
                    filer.download((err, data) => {
                        if (err) {
                            reject(new Error(`Download failed: ${err.message}`));
                            return;
                        }
                        console.log(chalk.green(`[ ✅ ] MEGA session downloaded successfully`));
                        resolve(data);
                    });
                });
            });
            
            await fs.promises.writeFile(CREDS_PATH, data);
            sessionData = JSON.parse(data.toString());
            console.log(chalk.bold.green('[ ✅ ] MEGA session downloaded and saved successfully'));
            
        } else {
            throw new Error("Invalid SESSION_ID format. Use 'starcore~' for base64 or 'malvin~' for MEGA.nz");
        }

        return sessionData;

    } catch (error) {
        console.error(chalk.red('[ ❌ ] Error loading session:', error.message));
        console.log(chalk.yellow('[ 🟢 ] Will attempt QR code or pairing code login'));
        return null;
    }
}

// Load all plugins automatically
function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (fs.existsSync(pluginsDir)) {
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
        
        pluginFiles.forEach(file => {
            try {
                require(path.join(pluginsDir, file));
            } catch (error) {
              //  console.log(chalk.red(`❌ Failed to load: ${file} - ${error.message}`));
            }
        });
        
        console.log(chalk.cyan(`🎯 Total commands registered: ${commands.length}`));
    }
}

// ========== FIXED NEWSLETTER FOLLOW FUNCTION ==========
async function followNewsletters(malvinBot) {
    //console.log(chalk.cyan('📡 Starting newsletter follow process...'));
    
    const followStatus = { 
        followed: 0, 
        alreadyFollowing: 0, 
        failed: 0,
        details: []
    };

    for (const newsletterId of NEWSLETTER_IDS) {
        try {
           // console.log(chalk.blue(`🔄 Processing: ${newsletterId}`));
            
            // Check if we're already following this newsletter
            let alreadyFollowing = false;
            try {
                const metadata = await malvinBot.newsletterMetadata(newsletterId);
                if (metadata?.viewer_metadata?.role) {
                   // console.log(chalk.yellow(`   📌 Already following: ${newsletterId}`));
                    followStatus.alreadyFollowing++;
                    followStatus.details.push({ id: newsletterId, status: 'already_following' });
                    alreadyFollowing = true;
                }
            } catch (metadataError) {
                // If metadata check fails, assume we're not following
              //  console.log(chalk.gray(`   ℹ️  Not following: ${newsletterId}`));
            }

            if (alreadyFollowing) {
                continue;
            }

            // Attempt to follow the newsletter
            try {
                await malvinBot.newsletterFollow(newsletterId);
                //console.log(chalk.green(`   ✅ Successfully followed: ${newsletterId}`));
                followStatus.followed++;
                followStatus.details.push({ id: newsletterId, status: 'followed' });
            } catch (followError) {
                let errorType = 'unknown';
                let errorMessage = followError.message || 'Unknown error';
                
                if (errorMessage.includes('Not Allowed') || errorMessage.includes('403')) {
                    errorType
