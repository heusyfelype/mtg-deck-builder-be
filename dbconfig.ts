import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables directly from .env.development
dotenv.config({ path: path.resolve(__dirname, '.env.development') });

export const connectDB = async (): Promise<void> => {
    try {
        const connectionString = process.env.DB_CONNECTION_STRING;

        if (!connectionString) {
            throw new Error('DB_CONNECTION_STRING não definida em .env.development!');
        }

        const conn = await mongoose.connect(connectionString);
        console.log(`[MongoDB] Conectado: ${conn.connection.host}`);

        // Testa ping na database
        const pingResult = await mongoose.connection.db?.admin().command({ ping: 1 });

        if (pingResult?.ok) {
            console.log('[MongoDB] Ping executado! Conexão estável e respondendo.');
        } else {
            console.warn('[MongoDB] Aviso: O ping falhou em retornar o status esperado.');
        }

    } catch (error) {
        console.error(`[MongoDB] Erro fatal de conexão: ${(error as Error).message}`);
        process.exit(1);
    }
};
