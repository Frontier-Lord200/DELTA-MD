const { malvin, commands, fakevCard } = require("../delta");
const os = require('os');
const settings = require('../settings');
const { channelInfo } = require('../lib/messageConfig');
const axios = require('axios');
const moment = require('moment-timezone');
const { getPrefix } = require('../lib/prefix');
const { loadSettings } = require('../lib/settingsManager'); // Add this

const toTinyCaps = (text) => {
    const tinyCapsMap = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
        j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
        s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
    };
    return text.toLowerCase().split('').map(c => tinyCapsMap[c] || c).join('');
};

// Function to fetch GitHub repository forks
const fetchGitHubForks = async () => {
    try {
        const repo = 'XdKing2/MALVIN-XD';
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        return response.data.forks_count || 'ɴ/ᴀ';
    } catch (e) {
        console.error('ᴇʀʀᴏʀ ғᴇᴛᴄʜɪɴɢ ɢɪᴛʜᴜʙ ғᴏʀᴋs:', e);
        return 'ɴ/ᴀ';
    }
};

// Get current prefix
function getCurrentPrefix() {
    try {
        const prefix = getPrefix();
        return prefix || '.';
    } catch (error) {
        return '.';
    }
}

// Category menus - UPDATED WITH ALL COMMANDS
const getCategoryMenus = (prefix) => ({
'1': `\`🧊 *AI & CHAT TOOLS*\`

┌─・❥
│🐬 ᴄʜᴀᴛ ʙᴏᴛs
├─・❥
│ • gcbot
│ • gemini
│ • gpt
│ • gpt5
│ • venice
│ • think
│ • copilot
└─・❥
│🐬 ᴀɪ ɢᴇɴᴇʀᴀᴛᴏʀs
├─・❥
│ • sora
│ • tofigure
│ • creart
└─・❥
│🧊 ᴅᴏᴄᴜᴍᴇɴᴛ ᴀɪ
├─・❥
│ • docanalyze
└─・❥

🍀 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'2': `\`🧊 *DOWNLOAD MANAGER*\`

┌─・❥
│🎵 ᴍᴜsɪᴄ & ᴀᴜᴅɪᴏ
├─・❥
│ • play
│ • song
│ • spotify
└─・❥
│🎬 ᴠɪᴅᴇᴏ & ᴍᴇᴅɪᴀ
├─・❥
│ • video
│ • instagram
│ • facebook
│ • tiktok
│ • twitter
└─・❥
│📱 ᴏᴛʜᴇʀ ᴘʟᴀᴛғᴏʀᴍs
├─・❥
│ • telegram
│ • mega
│ • mediafire
│ • gdrive
│ • gitclone
│ • githubdl
└─・❥
│🖼️ ᴡᴀʟʟᴘᴀᴘᴇʀs & ᴀᴘᴘs
├─・❥
│ • 4kwallpaper
│ • apk
│ • npm
│ • npminfo
└─・❥
│❓ ʜᴇʟᴘ ɢᴜɪᴅᴇs
├─・❥
│ • fbhelp
│ • ighelp
│ • spotifyhelp
│ • videohelp
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'3': `\`🎮 *FUN & GAMES*\`
 
┌─・❥
│🎭 ʀᴇᴀᴄᴛɪᴏɴs
├─・❥
│ • cry 😢
│ • hug 🤗  
│ • kiss 💋
│ • pat 🫂
│ • poke 👉
│ • nom 🍖
│ • facepalm 🤦
│ • wink 😉
│ • slap 👋
│ • highfive ✋
└─・❥
│🤪 ᴊᴏᴋᴇs & ᴛᴇxᴛ
├─・❥
│ • meme 
│ • joke 
│ • fact 
│ • quote 
│ • shayari 
│ • compliment 
│ • insult 
│ • flirt 
│ • imawesome 
│ • stupid 
└─・❥
│🎯 ɢᴀᴍᴇs
├─・❥
│ • tictactoe
│ • tod 
│ • truth
│ • dare 
│ • wyr 
│ • surrender
│ • ship
│ • simp
└─・❥
│🌸 ᴀɴɪᴍᴇ
├─・❥
│ • animu 
│ • character
│ • chartest 
│ • mychar 
└─・❥
│✨ sᴘᴇᴄɪᴀʟ
├─・❥
│ • emojimix 
│ • goodnight 
│ • roseday 
│ • nice 
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'4': `\`💬 *GROUP MANAGEMENT*\`

┌─・❥
│👑 ᴀᴅᴍɪɴ ᴄᴏɴᴛʀᴏʟ
├─・❥
│ • promote
│ • demote
│ • kick
│ • groupadd
│ • gcban
│ • gcunban
│ • leave
└─・❥
│🔇 ᴄʜᴀᴛ ᴄᴏɴᴛʀᴏʟ
├─・❥
│ • mute
│ • unmute
│ • warn
│ • warnings
│ • closetime
└─・❥
│📢 ᴛᴀɢɢɪɴɢ
├─・❥
│ • tag
│ • tagall
│ • hidetag
│ • tagnotadmin
└─・❥
│🛡️ ᴀɴᴛɪ sʏsᴛᴇᴍ
├─・❥
│ • antilink
│ • antibadword
│ • antitag
└─・❥
│🏠 ɢʀᴏᴜᴘ sᴇᴛᴜᴘ
├─・❥
│ • welcome
│ • goodbye
│ • groupinfo
│ • groupstats
│ • staff
│ • top
│ • invite
│ • resetlink
│ • join
│ • poll
│ • pin
└─・❥
│⚙️ ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs
├─・❥
│ • setgname
│ • setgdesc
│ • setgpp
│ • groupsettings
│ • acceptall
│ • rejectall
│ • requestlist
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'5': `\`🛠️ *UTILITIES & TOOLS*\`

┌─・❥
│⚡ ʙᴏᴛ ɪɴғᴏ
├─・❥
│ • ping
│ • menu
│ • prefix
│ • help
│ • repo
│ • alive
│ • owner
└─・❥
│🌐 ᴡᴇʙ ᴛᴏᴏʟs
├─・❥
│ • ss
│ • translate
│ • detectlang
│ • langcodes
│ • webzip
│ • abellashort
└─・❥
│🔍 sᴇᴀʀᴄʜ
├─・❥
│ • img
└─・❥
│👤 sᴛᴀʟᴋ
├─・❥
│ • githubstalk
│ • tiktokstalk
│ • wastalk
│ • xstalk
│ • ytstalk
└─・❥
│🗑️ ᴄʟᴇᴀɴᴜᴘ
├─・❥
│ • clear
│ • clearall
│ • del
│ • delete
└─・❥
│📱 ᴡʜᴀᴛsᴀᴘᴘ
├─・❥
│ • newsletter
│ • newsletter2
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'6': `\`🎨 *MEDIA & STICKERS*\`

┌─・❥
│🖼️ sᴛɪᴄᴋᴇʀ ᴛᴏᴏʟs
├─・❥
│ • sticker
│ • simage
│ • take
│ • crop
│ • tg
└─・❥
│✨ sᴘᴇᴄɪᴀʟ ᴇғғᴇᴄᴛs
├─・❥
│ • emojimix
│ • attp
│ • gif
│ • brat
│ • brat2
│ • bratvid
└─・❥
│📱 sᴏᴄɪᴀʟ sᴛɪᴄᴋᴇʀs
├─・❥
│ • igs
│ • igshelp
│ • takehelp
└─・❥
│👀 ᴠɪᴇᴡ ᴏɴᴄᴇ & ᴄᴏɴᴠᴇʀᴛ
├─・❥
│ • viewonce
│ • toaudio
│ • tomp3
│ • tovideo
│ • tovn
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'7': `\`🍀 *BOT SETTINGS*\`

┌─・❥
│🌍 ʙᴏᴛ ᴍᴏᴅᴇ
├─・❥
│ • mode
│ • setprefix
│ • resetprefix
└─・❥
│🔧 ʙᴏᴛ sᴇᴛᴛɪɴɢs
├─・❥
│ • setpp
│ • setowner
│ • setownername
│ • setbotname
│ • setbotimage
│ • setbotaudio
│ • settings
│ • update
└─・❥
│🤖 ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ
├─・❥
│ • autoreact
│ • autostatus
│ • autotyping
│ • autoread
└─・❥
│🛡️ sᴇᴄᴜʀɪᴛʏ
├─・❥
│ • anticall
│ • antidelete
└─・❥
│🔔 ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs
├─・❥
│ • mention
│ • setmention
└─・❥
│💾 ᴜᴛɪʟɪᴛɪᴇs
├─・❥
│ • save
│ • tourl
│ • tourl2
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'8': `\`👑 *OWNER COMMANDS*\`

┌─・❥
│🔧 ʙᴏᴛ sᴇᴛᴛɪɴɢs
├─・❥
│ • setpp
│ • setowner
│ • setownername
│ • setbotname
│ • setbotimage
│ • setbotaudio
│ • settings
│ • env
│ • resetsettings 
│ • update
└─・❥
│🗂️ sᴇssɪᴏɴ ᴍɢᴍᴛ
├─・❥
│ • clearsession
│ • backupsession
│ • sessioninfo
└─・❥
│🧹 ᴄʟᴇᴀɴᴜᴘ
├─・❥
│ • cleartmp
│ • purge
│ • clearstore
│ • checkstore
└─・❥
│👥 sᴜᴅᴏ ᴍɢᴍᴛ
├─・❥
│ • addsudo
│ • delsudo
│ • sudolist
│ • sudohelp
└─・❥
│🚫 ᴜsᴇʀ ᴄᴏɴᴛʀᴏʟ
├─・❥
│ • ban
│ • unban
│ • banlist
└─・❥
│👤 ᴘʀᴏғɪʟᴇ & ᴍᴇᴅɪᴀ
├─・❥
│ • getpp
│ • vv2
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "menu"*`,

'9': `\`📝 *TEXT & EFFECTS*\`

┌─・❥
│✨ ᴛᴇxᴛ ᴇғғᴇᴄᴛs
├─・❥
│ • textmaker
│ • metallic
│ • neon
│ • fire
│ • ice
│ • glitch
│ • matrix
│ • hacker
│ • blackpink
│ • thunder
│ • snow
│ • devil
│ • 1917
│ • arena
│ • impressive
│ • leaves
│ • light
│ • purple
│ • sand
└─・❥
│🎨 ᴛᴇxᴛ ᴍᴀᴋᴇʀs
├─・❥
│ • brat
│ • brat2
│ • bratvid
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`,

'10': `\`🖼️ *IMAGE & FILTERS*\`

┌─・❥
│🎭 ᴇᴍᴏᴊɪ ғɪʟᴛᴇʀs
├─・❥
│ • heart
│ • horny
│ • lgbt
│ • lolice
│ • jail
│ • triggered
│ • passed
│ • gay
│ • glass
│ • comrade
└─・❥
│🖼️ ɪᴍᴀɢᴇ ᴇғғᴇᴄᴛs
├─・❥
│ • circle
│ • wasted
│ • simpcard
│ • its-so-stupid
│ • blur
│ • grey
│ • invert
│ • blurimg
└─・❥
│📱 sᴏᴄɪᴀʟ ᴍᴏᴄᴋᴜᴘs
├─・❥
│ • tweet
│ • ytcomment
│ • namecard
│ • ad
│ • imgjoke
│ • nokia
│ • wanted
└─・❥
│🗿 ᴍᴇᴍᴇ ᴛᴇᴍᴘʟᴀᴛᴇs
├─・❥
│ • oogway
│ • oogway2
│ • tonikawa
│ • lied
└─・❥

💡 *Usage: ${prefix}command*
↩️ *Back: Send "0" for main menu*`
});

// Store active listeners to prevent duplicates
const activeListeners = new Map();

malvin({
    pattern: "menu",
    alias: ["m", "allmenu",],
    desc: "Show all bot commands in organized categories",
    category: "general",
    react: "🐬",
    use: ".menu",
    filename: __filename,
}, async (malvin, mek, m, { from, reply, prefix, sender }) => {
    try {
        // Load current settings
        const currentSettings = loadSettings();
         
        // Count total commands (excluding hidden ones)
        const totalCommands = commands.filter(cmd => 
            cmd.category && cmd.pattern && !cmd.dontAdd
        ).length;
        
        // Use current settings with fallbacks
        const timezone = currentSettings.timezone || settings.timezone || 'Africa/Harare';
        const time = moment().tz(timezone).format('HH:mm:ss');
        const date = moment().tz(timezone).format('DD/MM/YYYY');
        const forks = await fetchGitHubForks();
        const currentPrefix = getCurrentPrefix();
        
        const mainMenu = `
\`🤖 ${toTinyCaps(currentSettings.botName || settings.botName || 'delta-md')}\`
╭─────────➣
│↠👤 ᴏᴡɴᴇʀ : ${toTinyCaps(currentSettings.botOwner || settings.botOwner || 'sir 𝕗𝕣𝕠𝕟𝕥𝕚𝕖𝕣')}
│↠🧊 ᴛɪᴍᴇ: ${time}
│↠🐬 ᴅᴀᴛᴇ: ${date}
│↠🍀 ᴍᴏᴅᴇ: ${toTinyCaps(currentSettings.commandMode || settings.commandMode || 'ᴘᴜʙʟɪᴄ')}
│↠✒️ ᴘʀᴇғɪx: [ ${currentPrefix} ]
│↠🧩 ᴄᴍᴅs: ${totalCommands}
│↠👽 ᴠᴇʀsɪᴏɴ: ${currentSettings.version || settings.version || 'ʟᴀᴛᴇsᴛ'}
│↠👥 ᴜsᴇʀs: ${forks}
│↠✍️ ᴀᴜᴛʜᴏʀ: ${toTinyCaps(currentSettings.author || settings.author || 'Sir Frontier')}
╰──────────➣

╭─「 \`📁 ᴄᴀᴛᴇɢᴏʀʏ ʟɪsᴛ\` 」
│ ➊  👽 ᴀɪ & ᴄʜᴀᴛ ᴛᴏᴏʟs
│ ➋  📥 ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴀɴᴀɢᴇʀ
│ ➌  🐬 ғᴜɴ & ɢᴀᴍᴇs
│ ➍  💬 ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ
│ ➎  🧊 ᴜᴛɪʟɪᴛɪᴇs & ᴛᴏᴏʟs
│ ➏  🧉 ᴍᴇᴅɪᴀ & sᴛɪᴄᴋᴇʀs
│ ➐  ⚙️ ʙᴏᴛ sᴇᴛᴛɪɴɢs
│ ➑  🌹 ᴏᴡɴᴇʀ ᴄᴍᴅs
│ ➒  🍀 ᴛᴇxᴛ & ᴇғғᴇᴄᴛs
│ ➓  🧉 ɪᴍᴀɢᴇ & ғɪʟᴛᴇʀs
╰──────➣➣

💡 ʀᴇᴘʟʏ ᴡɪᴛʜ ɴᴜᴍʙᴇʀ (1-10) ᴛᴏ sᴇᴇ ᴄᴍᴅs

> ${currentSettings.description || settings.description || 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ delta ᴛᴇᴄʜ'}
`;

        // Remove any existing listener for this user
        if (activeListeners.has(sender)) {
            const oldListener = activeListeners.get(sender);
            malvin.ev.off('messages.upsert', oldListener.listener);
            clearTimeout(oldListener.timeout);
            activeListeners.delete(sender);
        }

        // Send main menu with image - Use current settings first
        const imageUrl = currentSettings.imageUrl || currentSettings.MENU_IMAGE_URL || settings.imageUrl || settings.MENU_IMAGE_URL;
        let sentMsg;
        
        if (imageUrl) {
            try {
                sentMsg = await delta.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: mainMenu,
                    ...channelInfo
                }, { quoted: fakevCard });
            } catch (imageError) {
                console.error('ᴇʀʀᴏʀ ʟᴏᴀᴅɪɴɢ ɪᴍᴀɢᴇ:', imageError);
                sentMsg = await malvin.sendMessage(from, { 
                    text: mainMenu,
                    ...channelInfo 
                }, { quoted: fakevCard });
            }
        } else {
            sentMsg = await malvin.sendMessage(from, { 
                text: mainMenu,
                ...channelInfo 
            }, { quoted: fakevCard });
        }

        // Set up reply listener with 5-minute timeout
        const timeout = setTimeout(async () => {
            if (activeListeners.has(sender)) {
                const listenerInfo = activeListeners.get(sender);
                malvin.ev.off('messages.upsert', listenerInfo.listener);
                activeListeners.delete(sender);
                await reply("⏰ *Menu session expired!*\n\nUse .menu again to restart menu category.");
            }
        }, 300000); // 5 minutes

        const messageListener = async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message || mekInfo.key.remoteJid !== from) return;

                const message = mekInfo.message;
                const messageType = message.conversation || message.extendedTextMessage?.text;
                
                // Check if this is a direct message (not necessarily a reply)
                // This allows multiple replies without needing to quote
                if (messageType && /^[0-9]+$/.test(messageType.trim())) {
                    const userInput = messageType.trim();
                    const categoryMenus = getCategoryMenus(currentPrefix);
                    
                    // Handle category numbers 1-10
                    if (/^[1-9]|10$/.test(userInput)) {
                        if (categoryMenus[userInput]) {
                            // Send the category menu
                            await malvin.sendMessage(from, {
                                text: categoryMenus[userInput],
                                ...channelInfo
                            }, { quoted: fakevCard });

                            // Send success reaction
                            try {
                                if (mekInfo?.key?.id) {
                                    await delta.sendMessage(from, { react: { text: "✅", key: mekInfo.key } });
                                }
                            } catch (reactError) {
                                console.error('Success reaction failed:', reactError);
                            }
                            
                            // DON'T remove the listener - allow more replies!
                            return;
                        }
                    }
                    
                    // Handle "0" to show main menu again
                    if (userInput === '0') {
                        await malvin.sendMessage(from, {
                            text: "🔄 Returning to main menu...",
                            ...channelInfo
                        }, { quoted: fakevCard });

                        // Re-send the main menu after short delay
                        setTimeout(async () => {
                            if (imageUrl) {
                                try {
                                    await malvin.sendMessage(from, {
                                        image: { url: imageUrl },
                                        caption: mainMenu,
                                        ...channelInfo
                                    }, { quoted: fakevCard });
                                } catch (imageError) {
                                    await malvin.sendMessage(from, { 
                                        text: mainMenu,
                                        ...channelInfo 
                                    }, { quoted: fakevCard });
                                }
                            } else {
                                await malvin.sendMessage(from, { 
                                    text: mainMenu,
                                    ...channelInfo 
                                }, { quoted: fakevCard });
                            }
                        }, 1000);
                        return;
                    }
                }

            } catch (error) {
                console.error('Menu reply error:', error);
            }
        };

        // Register the listener
        malvin.ev.on('messages.upsert', messageListener);
        
        // Store listener info for cleanup
        activeListeners.set(sender, {
            listener: messageListener,
            timeout: timeout,
            startTime: Date.now()
        });

        // Send audio if available - Use current settings first
        const audioUrl = currentSettings.MENU_AUDIO_URL || settings.MENU_AUDIO_URL;
        if (audioUrl) {
            try {
                await malvin.sendMessage(from, {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false
                });
            } catch (audioError) {
                console.error('ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ᴀᴜᴅɪᴏ:', audioError);
            }
        }

    } catch (error) {
        console.error('ᴇʀʀᴏʀ ɪɴ ᴍᴇɴᴜ ᴄᴏᴍᴍᴀɴᴅ:', error);
        await reply("❌ Failed to load menu. Please try again.");
    }
});