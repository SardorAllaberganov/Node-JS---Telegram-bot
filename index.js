const TelegramApi = require("node-telegram-bot-api");
const cron = require("node-cron");

// env file fetch
require("dotenv").config();

//env variables
const token = process.env.TOKEN;
const apiKey = process.env.API_KEY;

const bot = new TelegramApi(token, { polling: true });

const sequelize = require("./db");
const Quotes = require("./quotes_model"); 

const categories = require("./categories");

// keyboard buttons
const options = {
    reply_markup: JSON.stringify({
        resize_keyboard: true,
        keyboard: [
            [
                { text: "Get quote", callback_data: "get_quote" },
                { text: "My favorite quotes", callback_data: "get_favs" },
            ],
        ],
    }),
    parse_mode: "Markdown",
};

const printQuote = async (chatId, quote) => {
    if (quote) {
        return await bot.sendMessage(
            chatId,
            `Quote: \n\n "*${quote.quote}*" \n\n© Author: _${quote.author}_`,
            {
                reply_markup: JSON.stringify({
                    resize_keyboard: true,
                    inline_keyboard: [
                        [
                            {
                                text: "Save to favorites",
                                callback_data: `save_to_fav`,
                            },
                        ],
                    ],
                }),
                parse_mode: "Markdown",
            }
        );
    }
};

//get quote request function
const getQuote = async () => {
    const response = await fetch(
        `https://api.api-ninjas.com/v1/quotes?category=${categories.randomCategory()}`,
        {
            method: "GET",
            headers: {
                "X-Api-Key": apiKey,
            },
        }
    );
    return response.json();
};

bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const text = msg.message.text;
    const messageId = msg.message.message_id;
    const userId = msg.from.id;
    const chatId = msg.message.chat.id;

    if (data === "save_to_fav") {
        saveToFav(text, chatId, userId, messageId);
    }
});

const saveToFav = async (text, chatId, userId, messageId) => {
    return await Quotes.findOrCreate({
        where: { messageId: messageId },
        defaults: {
            quote: text,
            userId: userId,
            messageId: messageId,
        },
    }).then((result) => {
        if (!result[0]._options.isNewRecord) {
            bot.sendMessage(chatId, "Quote already saved");
        } else {
            bot.sendMessage(chatId, "Quote successfully saved to favorites!!!");
        }
    });
};

const start = () => {
    bot.setMyCommands([
        { command: "/start", description: "Start the bot" },
        { command: "/info", description: "Gives info about bot" },
    ]);

    bot.on("message", async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const userId = msg.from.id;

        if (text === "/start") {
            cron.schedule("00 00 08 * * *", async () => {
                // cron.schedule("*/10 * * * * *", async () => {
                return await getQuote().then((quote) => {
                    printQuote(chatId, quote[0]);
                });
            });
            bot.deleteMessage(chatId, messageId);
            await bot.sendMessage(
                chatId,
                "Welcome to Daily Quotes Bot🥳 \n\nGet your quote:",
                options
            );
            return await getQuote().then((quote) => {
                printQuote(chatId, quote[0]);
            });
        }
        if (text === "/info") {
            return bot.sendMessage(
                chatId,
                "🌟Welcome to QuoteCanvas, your daily source of inspiration and wisdom!🌟 \n\nQuoteCanvas is your personal oasis of daily quotes that inspire, motivate, and uplift. Our mission is to brighten your day, one thought-provoking quote at a time. \n\n📜 Daily Wisdom: Start your day with a fresh perspective. Receive a handpicked, thoughtfully curated quote every day. Whether you're seeking motivation, a moment of reflection, or just a daily dose of inspiration, we've got you covered. \n\n💡 Quotes for Every Occasion: Explore a wide range of quotes, from famous authors to timeless classics. Find the perfect quote to fit any situation, mood, or challenge you're facing. \n\n🌐 Share the Inspiration: Spread the wisdom by easily sharing your favorite quotes with friends and family. Touch their hearts and brighten their day. \n\nIf you have questions Contact Us @info"
            );
        }
        if (text === "Get quote") {
            getQuote().then((quote) => {
                printQuote(chatId, quote[0]);
            });
        }
        if (text === "My favorite quotes") {
            const quotes = await Quotes.findAll({
                where: { userId: userId.toString() },
            });
            let allQuotes = "📖 _My favorite quotes:_ 📖\n\n";

            if (quotes.length !== 0) {
                quotes.map((quote) => {
                    bot.sendMessage(
                        chatId,
                        allQuotes + `🖊${quote.dataValues.quote}\n\n`,
                        {
                            parse_mode: "Markdown",
                        }
                    );
                });
            } else {
                allQuotes += "You do not have any saved quotes yet 🙃";
            }
        } else {
            bot.deleteMessage(chatId, messageId);
        }
    });
};

(async () => {
    await sequelize.sync();
})();

start();
