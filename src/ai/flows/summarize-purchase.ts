// Summarize the items purchased and their quantities for a quick preview and printing.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PurchaseItemSchema = z.object({
  name: z.string().describe('Name of the product.'),
  quantity: z.number().describe('Quantity of the product purchased.'),
});

const SummarizePurchaseInputSchema = z.object({
  items: z.array(PurchaseItemSchema).describe('List of items purchased with their quantities.'),
});

export type SummarizePurchaseInput = z.infer<typeof SummarizePurchaseInputSchema>;

const SummarizePurchaseOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the purchase details, including items and quantities.'),
});

export type SummarizePurchaseOutput = z.infer<typeof SummarizePurchaseOutputSchema>;

export async function summarizePurchase(input: SummarizePurchaseInput): Promise<SummarizePurchaseOutput> {
  return summarizePurchaseFlow(input);
}

const summarizePurchasePrompt = ai.definePrompt({
  name: 'summarizePurchasePrompt',
  input: {schema: SummarizePurchaseInputSchema},
  output: {schema: SummarizePurchaseOutputSchema},
  prompt: `Summarize the following purchase details for a customer receipt. Include the name and quantity of each item. Be concise and clear.

Items:
{{#each items}}
- {{quantity}} x {{name}}
{{/each}}
`,
});

const summarizePurchaseFlow = ai.defineFlow(
  {
    name: 'summarizePurchaseFlow',
    inputSchema: SummarizePurchaseInputSchema,
    outputSchema: SummarizePurchaseOutputSchema,
  },
  async input => {
    const {output} = await summarizePurchasePrompt(input);
    return output!;
  }
);
