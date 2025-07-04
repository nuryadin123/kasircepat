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
  model: 'googleai/gemini-1.5-flash-latest', // Use a more capable model for document analysis
  prompt: `You are an intelligent data entry assistant for a point-of-sale application.
Your task is to analyze the provided PDF, which is a sales receipt or invoice, and extract the transaction details.

- **Analyze Line Items**: Identify each line item sold. For each item, extract its full name, the quantity, and its price.
- **Calculate Per-Unit Price**: It is very important that you provide the price PER-UNIT. If the document provides a subtotal for the line item (like in a "Subtotal (IDR)" column) instead of a per-unit price, you MUST calculate the per-unit price by dividing the line item's subtotal by the quantity. For example, if quantity is 2 and subtotal is 33,580, the price is 16,790.
- **Extract Date**: Identify the date of the transaction (look for "Tanggal Invoice"). Convert it to a valid ISO 8601 string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").
- **Ignore Other Costs**: Do not extract overall totals, shipping costs ("Subtotal Ongkir"), taxes, or discounts. Only focus on the individual product line items.
- **Output Format**: Structure the extracted information into the required JSON format.
- **Handle Missing Data**: If you cannot determine a quantity for an item, assume 1.
- **Validation**: You must analyze the document provided. If the PDF does not appear to be a receipt or invoice, or if no line items can be found, you MUST return an empty list for the 'items' field.

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
    
    if (!output) {
      // This case handles when the model fails to produce a parsable JSON output.
      // We can throw an error that will be caught by the UI.
      throw new Error('AI gagal mem-parsing respons. Pastikan PDF adalah struk yang valid.');
    }

    return output;
  }
);
