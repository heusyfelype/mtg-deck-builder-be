import { createReadStream, createWriteStream } from 'fs';
import { JsonFilterOptions } from '../types';
import { createInterface } from 'readline';

//export async function processAndFilterLargeJson<T>(options: JsonFilterOptions<T>): Promise<{ processedItems: number }> {
export async function processLargeJsonArray<T>(options: JsonFilterOptions<T>): Promise<{ processedItems: number }> {
  return new Promise((resolve, reject) => {
    const inputStream = createReadStream(options.inputPath, { 
      encoding: 'utf8',
      highWaterMark: 1024 * 1024 // Aumenta o buffer de leitura para 1MB
    });
    const outputStream = createWriteStream(options.outputPath, { encoding: 'utf8' });

    let buffer = '';
    let depth = 0;
    let processed = 0;
    let written = 0;
    let isFirstItem = true;

    // Escreve o início do array
    outputStream.write('[\n');

    const processBuffer = () => {
      while (true) {
        // Encontra o próximo { ou }
        const start = buffer.search(/[{}]/);
        if (start === -1) break;

        const char = buffer[start];
        
        if (char === '{') {
          if (depth === 0) {
            // Encontrou início de um novo objeto
            const end = findMatchingBrace(buffer.slice(start));
            if (end === -1) break; // Objeto incompleto

            try {
              const objStr = buffer.slice(start, start + end + 1);
              const obj = JSON.parse(objStr) as T;
              processed++;

              if (!options.filterFn || options.filterFn(obj)) {
                const result = options.transform ? options.transform(obj) : obj;
                
                if (!isFirstItem) {
                  outputStream.write(',\n');
                } else {
                  isFirstItem = false;
                }
                
                outputStream.write(JSON.stringify(result, null, 2));
                
                written++;
                console.log(`Item ${written} adicionado!`)
              }

              buffer = buffer.slice(start + end + 1);
              
              // if (options.onProgress && processed % 1000 === 0) {
              //   options.onProgress(processed);
              // }
            } catch (err: any) {
              reject(new Error(`Erro ao parsear JSON: ${err.message}`));
              break;
            }
          } else {
            depth++;
            buffer = buffer.slice(start + 1);
          }
        } else if (char === '}') {
          depth = Math.max(0, depth - 1);
          buffer = buffer.slice(start + 1);
        }
        console.log(`Linha ${processed} processada!`)
      }
    };

    const rl = createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      buffer += line;
      processBuffer();
    });

    rl.on('close', () => {
      processBuffer(); // Processa qualquer dado restante
      outputStream.write('\n]'); // Fecha o array
      outputStream.end();
      resolve({ processedItems: processed });
    });

    inputStream.on('error', (err) => {
      outputStream.end();
      reject(err);
    });

    outputStream.on('error', (err) => {
      inputStream.destroy();
      reject(err);
    });
  });
}
// Helper para encontrar o fechamento de chaves correspondente
function findMatchingBrace(str: string): number {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') depth++;
    if (str[i] === '}') depth--;
    if (depth === 0) return i;
  }
  return -1;
}
