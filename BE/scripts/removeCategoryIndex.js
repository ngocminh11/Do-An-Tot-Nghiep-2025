const mongoose = require('mongoose');
require('dotenv').config();

async function removeIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.collections();

        for (let collection of collections) {
            const indexes = await collection.indexes();
            console.log(`Collection: ${collection.collectionName}`);
            console.log('Indexes:', indexes);

            // Tìm và xóa index idCategory_1 nếu tồn tại
            const idCategoryIndex = indexes.find(index => index.name === 'idCategory_1');
            if (idCategoryIndex) {
                await collection.dropIndex('idCategory_1');
                console.log('Dropped index idCategory_1');
            }
        }

        console.log('Index removal completed');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

removeIndex(); 