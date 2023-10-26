const Sequelize = require("sequelize");

require("dotenv").config();
const db = process.env.DB;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(db, db_user, db_password, {
    dialect: "mysql",
    host: "localhost",
});

module.exports = sequelize;
