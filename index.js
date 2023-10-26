const request = require("request");
const TelegramApi = require("node-telegram-bot-api");

require("dotenv").config();

const token = process.env.TOKEN;
const apiKey = process.env.API_KEY;

const bot = new TelegramApi(token, { polling: true });

const sequelize = require("./db");
const Quotes = require("./quotes_model");

let bodyData = [];

const categories = [
    "age",
    "alone",
    "amazing",
    "anger",
    "architecture",
    "art",
    "attitude",
    "beauty",
    "best",
    "birthday",
    "business",
    "car",
    "change",
    "communications",
    "computers",
    "cool",
    "courage",
    "dad",
    "dating",
    "death",
    "design",
    "dreams",
    "education",
    "environmental",
    "equality",
    "experience",
    "failure",
    "faith",
    "family",
    "famous",
    "fear",
    "fitness",
    "food",
    "forgiveness",
    "freedom",
    "friendship",
    "funny",
    "future",
    "god",
    "good",
    "government",
    "graduation",
    "great",
    "happiness",
    "health",
    "history",
    "home",
    "hope",
    "humor",
    "imagination",
    "inspirational",
    "intelligence",
    "jealousy",
    "knowledge",
    "leadership",
    "learning",
    "legal",
    "life",
    "love",
    "marriage",
    "medical",
    "men",
    "mom",
    "money",
    "morning",
    "movies",
    "success",
];

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

const getQuote = (chatId, message_id) => {
    request.get(
        {
            url:
                "https://api.api-ninjas.com/v1/quotes?category=" +
                categories[Math.floor(Math.random() * categories.length)],
            headers: {
                "X-Api-Key": apiKey,
            },
        },
        async (error, response, body) => {
            if (error) return console.error("Request failed:", error);
            else if (response.statusCode != 200)
                return console.error(
                    "Error:",
                    response.statusCode,
                    body.toString("utf8")
                );
            else {
                body = JSON.parse(body)[0];

                bodyData.push({ message_id: message_id, body });

                return await bot.sendMessage(
                    chatId,
                    `Quote: \n\n "*${body.quote}*" \n\nAuthor: _${body.author}_`,
                    {
                        reply_markup: JSON.stringify({
                            resize_keyboard: true,
                            inline_keyboard: [
                                [
                                    {
                                        text: "Save to favorites",
                                        callback_data: `save_to_fav:${message_id}`,
                                    },
                                ],
                            ],
                        }),
                        parse_mode: "Markdown",
                    }
                );
            }
        }
    );
};

const start = () => {
    bot.setMyCommands([
        { command: "/start", description: "Start the bot" },
        { command: "/info", description: "Gives info about bot" },
    ]);

    bot.on("message", async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === "/start") {
            bot.deleteMessage(chatId, msg.message_id);
            return await bot.sendMessage(
                chatId,
                "Welcome to Daily Quotes Bot🥳 \n\nGet your quote:",
                options
            );
        }
        if (text === "/info") {
            return bot.sendMessage(
                chatId,
                "🌟Welcome to QuoteCanvas, your daily source of inspiration and wisdom!🌟 \n\nQuoteCanvas is your personal oasis of daily quotes that inspire, motivate, and uplift. Our mission is to brighten your day, one thought-provoking quote at a time. \n\n📜 Daily Wisdom: Start your day with a fresh perspective. Receive a handpicked, thoughtfully curated quote every day. Whether you're seeking motivation, a moment of reflection, or just a daily dose of inspiration, we've got you covered. \n\n💡 Quotes for Every Occasion: Explore a wide range of quotes, from famous authors to timeless classics. Find the perfect quote to fit any situation, mood, or challenge you're facing. \n\n🌐 Share the Inspiration: Spread the wisdom by easily sharing your favorite quotes with friends and family. Touch their hearts and brighten their day. \n\nIf you have questions Contact Us @info"
            );
        } else {
            bot.deleteMessage(chatId, msg.message_id);
        }
    });

    bot.on("message", async (msg) => {
        const data = msg.text;
        const message_id = msg.message_id;
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        if (data === "Get quote") {
            getQuote(chatId, message_id);
        }
        if (data === "My favorite quotes") {
            const quotes = await Quotes.findAll();
            let allQuotes = "📖 _My favorite quotes:_ 📖\n\n";
            quotes.map((quote) => {
                allQuotes += `🖊 Quote: \n\n*${quote.dataValues.quote}* \n© Author: _${quote.dataValues.author}_\n\n`;
            });

            bot.sendMessage(chatId, allQuotes, { parse_mode: "Markdown" });
        }
    });

    bot.on("callback_query", async (msg) => {
        const data = msg.data.split(":")[0];
        const message_id = +msg.data.split(":")[1];
        const userId = msg.from.id;
        console.log(msg);
        const chatId = msg.message.chat.id;

        if (data === "save_to_fav" && bodyData) {
            bodyData.forEach(async (a) => {
                if (a.message_id === message_id) {
                    const [quote, created] = await Quotes.findOrCreate({
                        where: { messageId: message_id },
                        defaults: {
                            quote: a.body.quote,
                            author: a.body.author,
                            category: a.body.category,
                            userId: userId,
                            messageId: message_id,
                        },
                    });
                    return await bot.sendMessage(
                        chatId,
                        "Quote successfully saved to favorites!!!"
                    );
                }
            });
        }
    });
};

(async () => {
    await sequelize.sync();
})();

start();
