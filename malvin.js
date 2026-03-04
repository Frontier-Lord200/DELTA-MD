var commands = [];
const { fakevCard } = require('./lib/fakevCard');

function malvin(info, func) {
    var data = info;
    
    // Store original function
    const originalFunction = func;
    
    // Wrap the function with automatic reaction
    data.function = async (frontier, mek, m, context) => {
        try {
            // Add automatic reaction if specified
            if (info.react && mek.key) {
                await frontier.sendMessage(context.from, {
                    react: { text: info.react, key: mek.key }
                });
            }
        } catch (e) {
            console.log('Auto-react failed:', e.message);
        }
        
        // Execute the original command function
        return originalFunction(frontier, mek, m, context);
    };
    
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    
    commands.push(data);
    return data;
}

// Import settings for prefix
const settings = require('./settings');
const prefix = settings.prefix || '.';

module.exports = {
    frontier,
    AddCommand: frontier,
    Function: frontier,
    Module: frontier,
    commands,
    fakevCard,
    prefix
};
