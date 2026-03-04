const { malvin, fakevCard } = require("../malvin");
const { addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');
const fetch = require('node-fetch');

// Goodbye command using Malvin XD framework
malvin({
    pattern: "goodbye",
    alias: ["goodbyesetup"],
    desc: "Configure goodbye messages for this group",
    category: "group",
    react: "👋",
    use: ".goodbye [on/off/set]",
    filename: __filename,
}, async (sock, mek, m, { from, q, reply, isGroup, isAdmin }) => {
    try {
        // Check if it's a group
        if (!isGroup) {
            return reply("❌ This command can only be used in groups.", { quoted: fakevCard });
        }

        // Check admin permissions
        const adminCheck = await isAdmin(sock, from, mek.key.participant || from);
        if (!adminCheck.isSenderAdmin) {
            return reply("🚫 Only group admins can configure goodbye messages.", { quoted: fakevCard });
        }

        if (!q) {
            return reply(`📤 *Goodbye Message Setup*\n\n✅ *.goodbye on* — Enable goodbye messages\n🛠️ *.goodbye set Your custom message* — Set a custom goodbye message\n🚫 *.goodbye off* — Disable goodbye messages\n\n*Current Status:* ${await isGoodByeOn(from) ? '✅ Enabled' : '❌ Disabled'}`, { quoted: fakevCard });
        }

        const [command, ...args] = q.split(' ');
        const lowerCommand = command.toLowerCase();
        const customMessage = args.join(' ');

        if (lowerCommand === 'on') {
            if (await isGoodByeOn(from)) {
                return reply('⚠️ Goodbye messages are *already enabled*.', { quoted: fakevCard });
            }
            await addGoodbye(from, true, 'Goodbye {user} 👋');
            return reply('✅ Goodbye messages *enabled*!', { quoted: fakevCard });
        }

        if (lowerCommand === 'off') {
            if (!(await isGoodByeOn(from))) {
                return reply('⚠️ Goodbye messages are *already disabled*.', { quoted: fakevCard });
            }
            await delGoodBye(from);
            return reply('✅ Goodbye messages *disabled* for this group.', { quoted: fakevCard });
        }

        if (lowerCommand === 'set') {
            if (!customMessage) {
                return reply('⚠️ Please provide a custom goodbye message. Example: *.goodbye set Goodbye!*', { quoted: fakevCard });
            }
            await addGoodbye(from, true, customMessage);
            return reply('✅ Custom goodbye message *set successfully*.', { quoted: fakevCard });
        }

        return reply('❌ Invalid command. Use: *.goodbye on/set/off*', { quoted: fakevCard });

    } catch (error) {
        console.error('Error in goodbye command:', error);
        await reply("❌ Error configuring goodbye messages!", { quoted: fakevCard });
    }
});

// Function to handle leave events
async function handleLeaveEvent(sock, groupId, participants) {
    try {
        console.log(`🔍 Checking goodbye for group: ${groupId}`);
        console.log(`👋 Participants data:`, JSON.stringify(participants, null, 2));
        
        // Check if goodbye is enabled for this group
        const isGoodbyeEnabled = await isGoodByeOn(groupId);
        console.log(`📋 Goodbye enabled for ${groupId}: ${isGoodbyeEnabled}`);
        
        if (!isGoodbyeEnabled) {
            console.log('❌ Goodbye disabled for this group, skipping');
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(groupId);
        const groupName = groupMetadata.subject;

        console.log(`👋 Sending goodbye for ${participants.length} leaving member(s) from ${groupName}`);

        // Send goodbye message for each leaving participant
        for (const participant of participants) {
            try {
                // Extract participant ID correctly (handle both string and object formats)
                let participantId;
                let displayName = 'User';
                
                if (typeof participant === 'string') {
                    // Old format: string like "123456789@s.whatsapp.net"
                    participantId = participant;
                    displayName = participant.split('@')[0];
                } else if (participant && typeof participant === 'object') {
                    // New format: object with id or phoneNumber
                    participantId = participant.id || participant.phoneNumber;
                    if (participant.phoneNumber) {
                        displayName = participant.phoneNumber.split('@')[0];
                    } else if (participant.id) {
                        displayName = participant.id.split('@')[0];
                    }
                    
                    // Try to get name from participant object
                    if (participant.name) {
                        displayName = participant.name;
                    }
                } else {
                    console.log('❌ Unknown participant format:', participant);
                    continue;
                }

                if (!participantId) {
                    console.log('❌ Could not determine participant ID:', participant);
                    continue;
                }

                console.log(`👋 Processing goodbye for: ${participantId}`);

                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });

                const goodbyeMessage = `
╭╼━≪• ᴍᴇᴍʙᴇʀ ʟᴇғᴛ •≫━╾
│𝙶𝙾𝙾𝙳𝙱𝚈𝙴: @${displayName} 👋
│ᴍᴇᴍʙᴇʀs : #${groupMetadata.participants.length}
│ʟᴇғᴛ ᴀᴛ: ${timeString}⏰
 ╰━❍
                
*@${displayName}* has left  *${groupName}*.
We'll miss you buddy! 😢
                
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ delta ᴛᴇᴄʜ
`;
                
                await sock.sendMessage(groupId, {
                    text: goodbyeMessage,
                    mentions: [participantId],
                    ...channelInfo
                });
                
                console.log(`✅ Goodbye sent for ${displayName} from ${groupName}`);
            } catch (error) {
                console.error(`❌ Error sending goodbye for participant:`, error);
                
                // Fallback to simple goodbye message without mention
                const simpleGoodbye = `👋 A member has left *${groupName}*. We'll miss them! 😢\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ delta ᴛᴇᴄʜ`;
                
                await sock.sendMessage(groupId, {
                    text: simpleGoodbye,
                    ...channelInfo
                });
            }
        }
    } catch (error) {
        console.error('❌ Fatal error in handleLeaveEvent:', error);
    }
}

// Export function for use in main bot file
module.exports = {
    handleLeaveEvent
};