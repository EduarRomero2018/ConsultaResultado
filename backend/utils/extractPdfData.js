// Archivo para extraer datos de un PDF usando pdfjs-dist
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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

    // Regex para extraer tipo, número y fecha (ajustar según formato real)
    // Ejemplo: "CE 123456789 2026-03-15"
    const match = text.match(/(CC|CE|TI|RC|PAS|PEP|PPT)\s*([A-Za-z0-9-]{5,})\s*(\d{4}-\d{2}-\d{2})/);
    if (!match) throw new Error('No se pudo extraer datos del PDF');
    return {
        document_type: match[1],
        document_number: match[2],
        date_performed: match[3]
    };
}
