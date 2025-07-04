/**
 * @fileOverview Shared schemas and types for sales data import flows.
 */
import {z} from 'genkit';

export const ImportSaleFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of a sales receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ImportSaleFromPdfInput = z.infer<typeof ImportSaleFromPdfInputSchema>;

export const SaleItemSchema = z.object({
    name: z.string().describe('The name of the product or item sold.'),
    sku: z.string().optional().describe('The Stock Keeping Unit (SKU) of the product, if any.'),
    quantity: z.number().describe('The quantity of the item sold.'),
    price: z.number().describe('The price of a single unit of the item.'),
});

export const ImportSaleOutputSchema = z.object({
  items: z.array(SaleItemSchema).describe('A list of items extracted from the receipt.'),
  date: z.string().optional().describe('The transaction date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).'),
});
export type ImportSaleOutput = z.infer<typeof ImportSaleOutputSchema>;
