const GoogleSheetsDB = require('../../backend/googleSheets');

let dbInstance = null;

const getDB = async () => {
    if (!dbInstance) {
        dbInstance = new GoogleSheetsDB();
        await dbInstance.initialize();
    }
    return dbInstance;
};

module.exports = { getDB };