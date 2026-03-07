import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
const environment = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${environment}`);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // Fallback
}

export const connectDB = async (): Promise<void> => {
    try {
        const connectionString = process.env.DB_CONNECTION_STRING;

        if (!connectionString) {
            throw new Error('DB_CONNECTION_STRING não está definida nas variáveis de ambiente');
        }

        const conn = await mongoose.connect(connectionString);

        console.log(`[MongoDB] Conectado com sucesso: ${conn.connection.host}`);

        // Implementação do "ping"
        const pingResult = await mongoose.connection.db?.admin().command({ ping: 1 });
        if (pingResult?.ok) {
            console.log('[MongoDB] Ping executado com sucesso! Conexão estável.');
        } else {
            console.warn('[MongoDB] Aviso: O ping não retornou o status esperado.');
        }

    } catch (error) {
        console.error(`[MongoDB] Erro ao conectar: ${(error as Error).message}`);
        process.exit(1);
    }
};
