// Archivo para extraer datos de un PDF usando pdfjs-dist
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

function normalizeDateToISO(rawDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        return rawDate;
    }

    const dmyMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dmyMatch) {
        throw new Error(`Formato de fecha no soportado: ${rawDate}`);
    }

    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
}

/**
 * Extrae el tipo de documento, número y fecha desde el texto del PDF.
 * Se asume que el texto relevante está en la parte superior del PDF.
 * @param {string} filePath - Ruta absoluta al archivo PDF
 * @returns {Promise<{document_type: string, document_number: string, date_performed: string}>}
 */
export async function extractPdfData(filePath) {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');

    const typeFromLabel = text.match(/Cli\s*No\.?\s*:?\s*(CC|CE|TI|RC|PAS|PEP|PPT)\b/i);
    const numberFromLabel = text.match(/Case\s*No\.?\s*:?\s*([A-Za-z0-9-]{5,})\b/i);
    const dateFromLabel = text.match(/Date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})(?:\s+\d{1,2}:\d{2}:\d{2})?/i);

    if (typeFromLabel && numberFromLabel && dateFromLabel) {
        return {
            document_type: typeFromLabel[1].toUpperCase(),
            document_number: numberFromLabel[1],
            date_performed: normalizeDateToISO(dateFromLabel[1])
        };
    }

    // Regex para extraer tipo, número y fecha (ajustar según formato real)
    // Ejemplo: "CE 123456789 2026-03-15"
    const match = text.match(/(CC|CE|TI|RC|PAS|PEP|PPT)\s*([A-Za-z0-9-]{5,})\s*((?:\d{4}-\d{2}-\d{2})|(?:\d{1,2}\/\d{1,2}\/\d{4}))/i);
    if (!match) throw new Error('No se pudo extraer datos del PDF, Valida que el PDF contenga los campos necesarios.');
    return {
        document_type: match[1].toUpperCase(),
        document_number: match[2],
        date_performed: normalizeDateToISO(match[3])
    };
}

//PROMT
// Ok, entendido, actualmente me devuelve un error y no se inserta en la BD porque el PDF internamente no cuenta con el mismo nombre de variables, te voy a pasar el nombre de las variables que estan en el PDF, para que hagas el cambio, teniendo en cuenta que el busca en el PDF #sym:expectedName , #sym:document_type y #sym:document_number .
// las varables del PDF son:
// Cli No -> el valor que encuentre aqui es el tipo