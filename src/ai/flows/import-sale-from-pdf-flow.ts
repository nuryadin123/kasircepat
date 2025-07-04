'use server';
/**
 * @fileOverview An AI flow to import sales data from a PDF receipt.
 *
 * - importSaleFromPdf - A function that parses a PDF receipt and extracts sales data.
 * - ImportSaleInput - The input type for the importSaleFromPdf function.
 * - ImportSaleOutput - The return type for the importSaleFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportSaleInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of a sales receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ImportSaleInput = z.infer<typeof ImportSaleInputSchema>;

const SaleItemSchema = z.object({
    name: z.string().describe('The name of the product or item sold.'),
    quantity: z.number().describe('The quantity of the item sold.'),
    price: z.number().describe('The price of a single unit of the item.'),
});

const ImportSaleOutputSchema = z.object({
  items: z.array(SaleItemSchema).describe('A list of items extracted from the receipt.'),
  date: z.string().optional().describe('The transaction date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).'),
});
export type ImportSaleOutput = z.infer<typeof ImportSaleOutputSchema>;

export async function importSaleFromPdf(input: ImportSaleInput): Promise<ImportSaleOutput> {
  return importSaleFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importSaleFromPdfPrompt',
  input: {schema: ImportSaleInputSchema},
  output: {schema: ImportSaleOutputSchema},
  prompt: `You are an intelligent data entry assistant for a point-of-sale application.
Your task is to analyze the provided PDF, which is a sales receipt or invoice, and extract the transaction details.

- Identify each line item sold. For each item, extract its name, quantity, and the price PER-UNIT.
- Identify the date of the transaction. If you find a date, convert it to a valid ISO 8601 string.
- Do not extract totals, subtotals, taxes, or discounts. Only extract the individual line items.
- Structure the extracted information into the required JSON format.
- If you cannot determine a specific value for a field (e.g., quantity is not listed, assume 1), make a reasonable assumption.

PDF for analysis: {{media url=pdfDataUri}}`,
});

const importSaleFromPdfFlow = ai.defineFlow(
  {
    name: 'importSaleFromPdfFlow',
    inputSchema: ImportSaleInputSchema,
    outputSchema: ImportSaleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
