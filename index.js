require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🧠 MEMORI BOT: Buat nyimpen event apa yang lagi dipilih sama tiap user
// Format: { chatId: 'id_event_di_supabase' }
const userSessions = new Map();

console.log("🚀 Nuanu Smart Bot: Multi-Event Edition is LIVE!");

// --- FUNGSI MENU UTAMA (ENGLISH UI) ---
const sendMainMenu = (chatId, eventName) => {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '❓ General Info (FAQ)', callback_data: 'menu_qna' }],
                [{ text: '📅 Event Schedule', callback_data: 'menu_rundown' }],
                [{ text: '📍 Venues', callback_data: 'menu_venue' }],
                [{ text: '🗺️ Event Map', callback_data: 'menu_map' }],
                [{ text: '🔄 Change Event', callback_data: 'menu_change_event' }] // Tombol buat ganti event
            ]
        }
    };
    bot.sendMessage(chatId, `✅ You are now exploring *${eventName}*.\n\nPlease choose an option below or directly type your question to our AI!`, { parse_mode: 'Markdown', ...options });
};

// --- HANDLE COMMAND /start ---
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Friend';

    bot.sendChatAction(chatId, 'typing');

    // Tarik daftar event dari Supabase
    const { data: events, error } = await supabase
        .from('events')
        .select('id, name')
        .order('created_at', { ascending: false });

    if (error || !events || events.length === 0) {
        return bot.sendMessage(chatId, "Sorry, there are no active events at the moment.");
    }

    // Bikin tombol dinamis sebanyak jumlah event
    const keyboard = events.map(ev => ([{ text: `🎪 ${ev.name}`, callback_data: `selectevent_${ev.id}` }]));

    bot.sendMessage(chatId, `Hello ${firstName}! 👋 Welcome to Nuanu Hub.\n\nWhich event are you attending?`, {
        reply_markup: { inline_keyboard: keyboard }
    });
});

// --- HANDLE KLIK TOMBOL MENU ---
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const action = query.data;
    
    bot.answerCallbackQuery(query.id);
    bot.sendChatAction(chatId, 'typing');

    try {
        // 1. Logic Kalau User Milih Event
        if (action.startsWith('selectevent_')) {
            const selectedEventId = action.split('_')[1];
            
            // Simpan pilihan user ke memori bot
            userSessions.set(chatId, selectedEventId);
            
            // Cari nama eventnya buat ditampilin di pesan sapaan
            const { data } = await supabase.from('events').select('name').eq('id', selectedEventId).single();
            sendMainMenu(chatId, data?.name || "the event");
            return;
        }

        // 2. Logic Kalau User Mau Ganti Event (Balik ke menu /start)
        if (action === 'menu_change_event') {
            userSessions.delete(chatId); // Hapus memori lama
            bot.sendMessage(chatId, "Redirecting to event list... Please type /start again.");
            return;
        }

        // ⚠️ CEK SATPAM: Pastiin user udah milih event sebelum klik menu lain
        const currentEventId = userSessions.get(chatId);
        if (!currentEventId) {
            return bot.sendMessage(chatId, "⚠️ Please select an event first by typing /start");
        }

        // 3. Logic Menu Dinamis (Difilter pakai .eq('event_id', currentEventId))
        if (action === 'menu_faq') {
            const { data } = await supabase.from('qna').select('*').eq('event_id', currentEventId);
            let reply = "📝 *General Information:*\n\n";
            if(data && data.length > 0) {
                data.forEach((item, i) => reply += `${i+1}. *Q:* ${item.question}\n*A:* ${item.answer}\n\n`);
            } else {
                reply += "No FAQs available for this event yet.";
            }
            bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
            
        } else if (action === 'menu_rundown') {
            const { data } = await supabase.from('rundown').select('title, start_time, venues(name)').eq('event_id', currentEventId);
            let msg = "📅 *Event Schedule:*\n\n";
            if(data && data.length > 0) {
                data.forEach(item => {
                    const jam = new Date(item.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    msg += `• ${jam} | *${item.title}*\n  (📍 ${item.venues?.name || 'Nuanu Area'})\n\n`;
                });
            } else {
                msg += "Schedule is not available yet.";
            }
            bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

        } else if (action === 'menu_venue') {
            const { data } = await supabase.from('venues').select('name, location').eq('event_id', currentEventId);
            let msg = "📍 *Venues & Stages:*\n\n";
            if(data && data.length > 0) {
                data.forEach(v => msg += `• *${v.name}*\n  ${v.location || ''}\n\n`);
            } else {
                msg += "Venue list is not available yet.";
            }
            bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });

        } else if (action === 'menu_map') {
            // Asumsi setting event disimpen per event
            const { data } = await supabase.from('event_settings').select('map_url').eq('event_id', currentEventId).single();
            if (data?.map_url) {
                bot.sendPhoto(chatId, data.map_url, { caption: "🗺️ Here is the event map!" });
            } else {
                bot.sendMessage(chatId, "The event map is not yet available. Please check back later!");
            }
        }
    } catch (e) {
        console.error("Button Error:", e.message);
        bot.sendMessage(chatId, "Oops, failed to fetch data. Please try again in a moment.");
    }
});

// --- HANDLE CHAT BEBAS DENGAN AI ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userText = msg.text;

    if (!userText || userText.startsWith('/')) return;

    // ⚠️ CEK SATPAM: Harus pilih event dulu sebelum nanya bot
    const currentEventId = userSessions.get(chatId);
    if (!currentEventId) {
        return bot.sendMessage(chatId, "⚠️ Please select an event first by typing /start");
    }

    bot.sendChatAction(chatId, 'typing');

    try {
        // AI Cuma narik data dari event yang dipilih
        const { data: qna } = await supabase.from('qna').select('question, answer').eq('event_id', currentEventId);
        const { data: rundown } = await supabase.from('rundown').select('title, start_time').eq('event_id', currentEventId);
        const { data: eventInfo } = await supabase.from('events').select('name').eq('id', currentEventId).single();
        
        let context = `--- EVENT DATA FOR ${eventInfo?.name?.toUpperCase()} ---\n`;
        if(qna) qna.forEach(d => context += `Q: ${d.question} A: ${d.answer}\n`);
        if(rundown) rundown.forEach(r => context += `Event: ${r.title} Time: ${r.start_time}\n`);

        const res = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `You are the official virtual assistant for ${eventInfo?.name || 'Nuanu Festival'} in Bali. 
                    
--- EVENT DATA (SOURCE MATERIAL) ---
${context}
--- END OF EVENT DATA ---

🚨 CRITICAL INSTRUCTIONS FOR YOUR NEXT RESPONSE:
1. DETECT the exact language of the user's message.
2. TRANSLATE your entire answer into that EXACT LANGUAGE.
3. STRICT MONOLINGUAL RULE: Do NOT mix languages. Do NOT use Indonesian greetings (like "Selamat datang", "Halo") if the user is speaking English, Russian, or any other language. Your response must be 100% in the user's detected language.
4. Answer based ONLY on the EVENT DATA above.
5. Maintain a friendly and energetic tone appropriate for the user's language.` 
                },
                { role: "user", content: userText }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3
        });

        bot.sendMessage(chatId, res.choices[0]?.message?.content || "System error...");
    } catch (e) {
        console.error("Groq Error:", e.message);
        bot.sendMessage(chatId, "The system is currently busy. Please try asking again in a few seconds!");
    }
});