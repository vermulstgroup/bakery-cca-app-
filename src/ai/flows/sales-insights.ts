'use server';
/**
 * @fileOverview A flow to analyze sales data and provide actionable insights.
 *
 * - getSalesInsights - A function that generates insights based on sales data.
 * - SalesInsightsInput - The input type for the getSalesInsights function.
 * - SalesInsightsOutput - The return type for the getSalesInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesInsightsInputSchema = z.object({
  salesData: z.string().describe('Sales data from previous weeks, in JSON format.'),
});
export type SalesInsightsInput = z.infer<typeof SalesInsightsInputSchema>;

const InsightSchema = z.object({
  title: z.string().describe('A short, descriptive title for the insight.'),
  insight: z.string().describe('The detailed insight or trend analysis.'),
  emoji: z.string().describe('An emoji that visually represents the insight.')
});

const SalesInsightsOutputSchema = z.object({
  insights: z.array(InsightSchema).describe('An array of sales insights and trends.'),
});
export type SalesInsightsOutput = z.infer<typeof SalesInsightsOutputSchema>;

export async function getSalesInsights(input: SalesInsightsInput): Promise<SalesInsightsOutput> {
  try {
    return await salesInsightsFlow(input);
  } catch (error) {
    console.error('Error getting sales insights:', error);
    // Return a default or empty response in case of an error
    return { insights: [] };
  }
}

const salesInsightsPrompt = ai.definePrompt({
  name: 'salesInsightsPrompt',
  input: {schema: SalesInsightsInputSchema},
  output: {schema: SalesInsightsOutputSchema},
  prompt: `You are an expert business analyst for a bakery. Your goal is to find actionable trends and insights from sales data.

  Analyze the following sales data from previous weeks:
  {{salesData}}

  Based on this data, generate three distinct and actionable insights. Focus on identifying patterns, growth opportunities, or potential issues.
  For example, identify the top-selling product, notice a product whose sales are declining, or suggest a bundle based on items frequently sold together.
  
  Do NOT generate generic advice. Each insight should be directly supported by the data provided.
  For each insight, provide a short title, a concise explanation of the trend, and a relevant emoji.
  Ensure the returned JSON is valid and can be parsed without errors.
  `,
});

const salesInsightsFlow = ai.defineFlow(
  {
    name: 'salesInsightsFlow',
    inputSchema: SalesInsightsInputSchema,
    outputSchema: SalesInsightsOutputSchema,
  },
  async input => {
    const {output} = await salesInsightsPrompt(input);
    return output!;
  }
);
