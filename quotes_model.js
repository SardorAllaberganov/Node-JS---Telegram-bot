const { Sequelize } = require("sequelize");
const sequelize = require("./db");

const Quotes = sequelize.define("quotes", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    quote: Sequelize.STRING,
    author: Sequelize.STRING,
    category: Sequelize.STRING,
    userId: Sequelize.INTEGER,
    messageId: Sequelize.INTEGER,
});

module.exports = Quotes;
