const TelegramApi = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.TOKEN;

const bot = new TelegramApi(token, { polling: true });

const chats = [];

const gameOpt = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [
                { text: 1, callback_data: "1" },
                { text: 2, callback_data: "2" },
                { text: 3, callback_data: "3" },
            ],
            [
                { text: 4, callback_data: "4" },
                { text: 5, callback_data: "5" },
                { text: 6, callback_data: "6" },
            ],
            [
                { text: 7, callback_data: "7" },
                { text: 8, callback_data: "8" },
                { text: 9, callback_data: "9" },
            ],
            [{ text: 0, callback_data: "0" }],
        ],
    }),
};

const start = () => {
    bot.setMyCommands([
        { command: "/start", description: "Start the bot" },
        { command: "/info", description: "Gives info about bot" },
        { command: "/game", description: "Guess the number game" },
    ]);

    bot.on("message", async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === "/start") {
            await bot.sendSticker(
                chatId,
                "https://tlgrm.ru/_/stickers/8a1/9aa/8a19aab4-98c0-37cb-a3d4-491cb94d7e12/3.webp"
            );
            return bot.sendMessage(chatId, `Welcome to Daily Quotes Bot`);
        }
        if (text === "/info") {
            return bot.sendMessage(
                chatId,
                `Thoughtful Reflection: Contemplate the wisdom of the world's greatest thinkers.`
            );
        }
        if (text === "/game") {
            bot.sendMessage(
                chatId,
                `Now I will guess a number from 0 to 9, and you must guess it!`
            );
            const randomNumber = Math.floor(Math.random() * 10);
            chats[chatId] = randomNumber;
            return bot.sendMessage(chatId, "Guess the number!", gameOpt);
        }
        return bot.sendMessage(chatId, "I do not understand you, try again!");
    });

    bot.on("callback_query", async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data == chats[chatId]) {
            return await bot.sendMessage(
                chatId,
                `Congratulation, you guess the number ${chats[chatId]}`
            );
        } else {
            return await bot.sendMessage(
                chatId,
                `Unfortunately, you do not guess the number. Bot guess the number ${chats[chatId]}. Try again!`
            );
        }
    });
};

start();
