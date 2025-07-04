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
    sku: z.string().optional().describe('The Stock Keeping Unit (SKU) of the product, if any.'),
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
  prompt: `You are an intelligent data entry assistant for a point-of-sale application. Your primary task is to meticulously analyze the provided PDF, which is a sales receipt or invoice, and extract all transaction details with high accuracy.

**Extraction Rules:**

1.  **Mandatory Full Extraction**: You **must** extract **every single line item** listed under the "Rincian Produk" section. Do not stop prematurely. The list of products ends right before you see a line for "Subtotal Ongkir" or a similar summary line item. Process the entire list.

2.  **Line Item Analysis**: For each individual product line item, you must extract:
    *   **Full Name**: The complete name of the product.
    *   **SKU**: The Stock Keeping Unit. It is critical to extract this if it's present, often found in parentheses like \`(KP-M-L)\`. If no SKU exists for an item, leave the \`sku\` field empty.
    *   **Quantity**: The number of units sold. If not explicitly stated, assume the quantity is \`1\`.
    *   **Per-Unit Price**: The price for a single unit. **This is critical.** The document may show a subtotal for the line item (e.g., in the "Subtotal (IDR)" column). If so, you **must** calculate the per-unit price by dividing this subtotal by the quantity. For example, if the quantity is 2 and the subtotal is 33,580, the correct \`price\` to return is \`16790\`.

3.  **Date Extraction**: Locate the transaction date (labeled "Tanggal Invoice") and convert it to a valid ISO 8601 string format (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").

4.  **Exclusions**: Do **not** extract any overall summary figures. This includes the final total, shipping costs ("Subtotal Ongkir"), taxes, or discounts. Your focus is solely on the individual product line items.

5.  **Validation**: If the uploaded PDF is not a recognizable receipt or invoice, or if no product items can be found, you must return an empty list for the 'items' field in the JSON output.

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
