const { Sequelize } = require("sequelize");
const sequelize = require("./db");

const Quotes = sequelize.define("quotes", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    quote: Sequelize.TEXT,
    // author: Sequelize.STRING,
    // category: Sequelize.STRING,
    userId: Sequelize.STRING,
    messageId: Sequelize.STRING,
});

module.exports = Quotes;
