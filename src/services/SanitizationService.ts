import path from 'path';
import { processLargeJsonArray } from '../functions/filterAndWriteJson';

class SanitizationService {
  async createSanitization(): Promise<number> {
    // Verificar se email já existe

   const inputFile = path.join(__dirname, '../../data/all-cards-20250817092053.json');
    const outputFile = path.join(__dirname, '../../data/filtered-cards.json');
    await processLargeJsonArray({inputPath: inputFile, filterFn: (card: any) => card.lang == "pt" /*|| card.lang == "en"*/, outputPath: outputFile, });
  
    return 1;
  }
}

export const sanitizationService = new SanitizationService();