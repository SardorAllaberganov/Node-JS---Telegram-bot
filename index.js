const request = require("request");
const TelegramApi = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.TOKEN;
const apiKey = process.env.API_KEY;

const bot = new TelegramApi(token, { polling: true });

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
        keyboard: [[{ text: "Get quote", callback_data: "get_quote" }]],
    }),
    parse_mode: "Markdown",
};

const getQuote = (chatId) => {
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
                body = JSON.parse(body);

                return await bot.sendMessage(
                    chatId,
                    `Quote: \n\n "*${body[0].quote}*" \n\nAuthor: _${body[0].author}_`,
                    options
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
        const chatId = msg.chat.id;
        if (data === "Get quote") {
            getQuote(chatId);
        }
    });
};

start();
