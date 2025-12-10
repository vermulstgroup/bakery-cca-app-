'use server';
/**
 * @fileOverview A flow to analyze sales data and provide personalized offers.
 *
 * - getPersonalizedOffers - A function that generates personalized offers based on sales data.
 * - PersonalizedOffersInput - The input type for the getPersonalizedOffers function.
 * - PersonalizedOffersOutput - The return type for the getPersonalizedOffers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedOffersInputSchema = z.object({
  salesData: z.string().describe('Sales data from previous weeks, in JSON format.'),
});
export type PersonalizedOffersInput = z.infer<typeof PersonalizedOffersInputSchema>;

const PersonalizedOffersOutputSchema = z.object({
  offers: z.string().describe('Personalized offers to customers, in JSON format.'),
});
export type PersonalizedOffersOutput = z.infer<typeof PersonalizedOffersOutputSchema>;

export async function getPersonalizedOffers(input: PersonalizedOffersInput): Promise<PersonalizedOffersOutput> {
  return personalizedOffersFlow(input);
}

const personalizedOffersPrompt = ai.definePrompt({
  name: 'personalizedOffersPrompt',
  input: {schema: PersonalizedOffersInputSchema},
  output: {schema: PersonalizedOffersOutputSchema},
  prompt: `You are an AI assistant helping a bakery manager generate personalized offers for their customers based on sales data.

  Analyze the following sales data from previous weeks:
  {{salesData}}

  Based on this data, generate personalized offers that the bakery can provide to customers to increase sales and customer loyalty.
  Return the offers in JSON format.  The offers should be tailored to the specific products that the customer buys frequently.
  For example, if a customer frequently buys Yeast Mandazi, offer a discount on Yeast Mandazi or a related product.
  Be concise and provide offers that are likely to be effective. Limit to 3 offers.
  Ensure the returned JSON is valid and can be parsed without errors.
  `,
});

const personalizedOffersFlow = ai.defineFlow(
  {
    name: 'personalizedOffersFlow',
    inputSchema: PersonalizedOffersInputSchema,
    outputSchema: PersonalizedOffersOutputSchema,
  },
  async input => {
    const {output} = await personalizedOffersPrompt(input);
    return output!;
  }
);
