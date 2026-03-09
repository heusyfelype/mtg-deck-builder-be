import { connectDB } from '../dbconfig';
import CardModel from '../models/Card';
import CardsByUserModel from '../models/CardsByUser';

function computeColorKey(colorIdentity: any): string {
    if (!Array.isArray(colorIdentity)) return '';
    try {
        return [...colorIdentity].sort().join('');
    } catch (e) {
        return '';
    }
}

async function migrateAllCards(batchSize = 1000) {
    console.log('Migrating allCards...');
    const total = await CardModel.countDocuments({});
    console.log(`Total allCards: ${total}`);

    const cursor = CardModel.find({}).lean().cursor();
    let ops: any[] = [];
    let processed = 0;

    for await (const doc of cursor) {
        const d: any = doc;
        const colorKey = computeColorKey(d.color_identity);
        const colorCount = Array.isArray(d.color_identity) ? d.color_identity.length : 0;

        const updateDoc: any = {};
        if (d.colorKey !== colorKey) updateDoc.colorKey = colorKey;
        if (d.colorCount !== colorCount) updateDoc.colorCount = colorCount;

        if (Object.keys(updateDoc).length > 0) {
            ops.push({
                updateOne: {
                    filter: { _id: d._id },
                    update: { $set: updateDoc }
                }
            });
        }

        processed++;

        if (ops.length >= batchSize) {
            await CardModel.bulkWrite(ops);
            ops = [];
            console.log(`Processed ${processed}/${total}`);
        }
    }

    if (ops.length > 0) {
        await CardModel.bulkWrite(ops);
        console.log(`Processed ${processed}/${total}`);
    }

    console.log('allCards migration completed.');
}

async function migrateCardsByUser(batchSize = 1000) {
    console.log('Migrating cardsByUser...');
    const total = await CardsByUserModel.countDocuments({});
    console.log(`Total cardsByUser: ${total}`);

    const cursor = CardsByUserModel.find({}).lean().cursor();
    let ops: any[] = [];
    let processed = 0;

    for await (const doc of cursor) {
        const d: any = doc;
        const card: any = d.card || {};
        const colorKey = computeColorKey(card.color_identity);
        const colorCount = Array.isArray(card.color_identity) ? card.color_identity.length : 0;

        const updateDoc: any = {};
        if (card.colorKey !== colorKey) updateDoc['card.colorKey'] = colorKey;
        if (card.colorCount !== colorCount) updateDoc['card.colorCount'] = colorCount;

        if (Object.keys(updateDoc).length > 0) {
            ops.push({
                updateOne: {
                    filter: { _id: d._id },
                    update: { $set: updateDoc }
                }
            });
        }

        processed++;

        if (ops.length >= batchSize) {
            await CardsByUserModel.bulkWrite(ops);
            ops = [];
            console.log(`Processed ${processed}/${total}`);
        }
    }

    if (ops.length > 0) {
        await CardsByUserModel.bulkWrite(ops);
        console.log(`Processed ${processed}/${total}`);
    }

    console.log('cardsByUser migration completed.');
}

//run this script with `node -r ts-node/register src/scripts/migrateColorFields.ts` to create necessary migrations.
async function run() {
    await connectDB();

    await migrateAllCards();
    await migrateCardsByUser();

    console.log('Migration finished.');
    process.exit(0);
}

run().catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
});
