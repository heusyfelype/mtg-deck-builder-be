import { connectDB } from '../dbconfig';
import CardModel from '../models/Card';
import CardsByUserModel from '../models/CardsByUser';

async function createIndexes() {
    await connectDB();

    console.log('Creating index on allCards: { colorKey:1, colorCount:1, cmc:1 }');
    await CardModel.collection.createIndex({ cmc: 1, colorCount: 1, colorKey: 1 });

    console.log('Creating index on cardsByUser: { userId:1, "card.colorKey":1, "card.colorCount":1, "card.cmc":1 }');
    await CardsByUserModel.collection.createIndex({ userId: 1, 'card.colorKey': 1, 'card.colorCount': 1, 'card.cmc': 1 });

    console.log('Indexes created.');
    process.exit(0);
}

createIndexes().catch((err) => {
    console.error('Error creating indexes:', err);
    process.exit(1);
});
