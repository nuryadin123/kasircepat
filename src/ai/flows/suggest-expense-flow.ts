'use server';
/**
 * @fileOverview An AI flow to suggest expense descriptions.
 *
 * - suggestExpenses - A function that suggests expense descriptions based on existing ones.
 * - SuggestExpensesInput - The input type for the suggestExpenses function.
 * - SuggestExpensesOutput - The return type for the suggestExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpensesInputSchema = z.object({
    existingExpenses: z.array(z.string()).describe('A list of existing expense descriptions.'),
    query: z.string().optional().describe('A partial query to narrow down suggestions.'),
});
export type SuggestExpensesInput = z.infer<typeof SuggestExpensesInputSchema>;

const SuggestExpensesOutputSchema = z.object({
    suggestions: z.array(z.string()).describe('A list of 5 suggested expense descriptions.'),
});
export type SuggestExpensesOutput = z.infer<typeof SuggestExpensesOutputSchema>;

export async function suggestExpenses(input: SuggestExpensesInput): Promise<SuggestExpensesOutput> {
    return suggestExpensesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestExpensesPrompt',
    input: {schema: SuggestExpensesInputSchema},
    output: {schema: SuggestExpensesOutputSchema},
    prompt: `You are an expert accountant for a small business in Indonesia.
Your task is to suggest relevant and common expense descriptions.

Based on the following list of existing expenses, suggest 5 new, relevant, and common expense descriptions that a similar business might have.
Do not repeat any expenses from the existing list.
The suggestions should be in Indonesian.

Existing Expenses:
{{#each existingExpenses}}
- {{{this}}}
{{/each}}

{{#if query}}
The user has started typing: "{{{query}}}". Make sure your suggestions are relevant to this query.
{{/if}}

Provide 5 concise suggestions.`,
});

const suggestExpensesFlow = ai.defineFlow(
    {
        name: 'suggestExpensesFlow',
        inputSchema: SuggestExpensesInputSchema,
        outputSchema: SuggestExpensesOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);
