'use server';
/**
 * @fileOverview An AI-powered 'Gift Matcher' tool that suggests optimal diamond or currency packages
 * for specific gaming servers based on user input and popular trends.
 *
 * - aiGiftMatcherSuggestions - A function that handles the AI gift matching process.
 * - AiGiftMatcherInput - The input type for the aiGiftMatcherSuggestions function.
 * - AiGiftMatcherOutput - The return type for the aiGiftMatcherSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiGiftMatcherInputSchema = z.object({
  game: z
    .string()
    .describe("The name of the game (e.g., 'MLBB India', 'Genshin Impact')."),
  budget: z
    .number()
    .describe("The user's budget in their local currency (e.g., 99, 199)."),
  goal: z
    .string()
    .describe(
      "The user's primary goal for the purchase (e.g., 'buy a new skin', 'stock up on diamonds', 'get a weekly pass')."
    ),
});
export type AiGiftMatcherInput = z.infer<typeof AiGiftMatcherInputSchema>;

const AiGiftMatcherOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        package_name: z
          .string()
          .describe(
            "The name of the suggested package (e.g., '86 Diamonds', 'Weekly Pass')."
          ),
        price: z
          .string()
          .describe(
            "The price of the suggested package, including currency symbol (e.g., '₹99')."
          ),
        currency_amount: z
          .number()
          .describe(
            "The amount of in-game currency or diamonds provided by this package."
          ),
        reason: z
          .string()
          .describe(
            "A brief explanation of why this package is a good suggestion based on the user's input and popular trends."
          ),
        best_for_goal: z
          .boolean()
          .describe(
            "True if this package directly addresses the user's stated goal, false otherwise."
          ),
      })
    )
    .describe('An array of suggested diamond or currency packages.'),
});
export type AiGiftMatcherOutput = z.infer<typeof AiGiftMatcherOutputSchema>;

export async function aiGiftMatcherSuggestions(
  input: AiGiftMatcherInput
): Promise<AiGiftMatcherOutput> {
  return aiGiftMatcherSuggestionsFlow(input);
}

const aiGiftMatcherPrompt = ai.definePrompt({
  name: 'aiGiftMatcherPrompt',
  input: { schema: AiGiftMatcherInputSchema },
  output: { schema: AiGiftMatcherOutputSchema },
  prompt: `You are an AI-powered 'Gift Matcher' assistant for AATMA HUB, specializing in recommending optimal diamond or currency packages for various games. Your goal is to provide personalized suggestions based on user preferences and popular trends.

Given the user's input, suggest 2-3 suitable packages. Ensure the suggested packages are relevant to the game, fit within the budget, and align with their goal. Always prioritize packages that offer good value or directly fulfill the user's stated goal.

Input:
Game: {{{game}}}
Budget: {{{budget}}}
Goal: {{{goal}}}

Consider popular trends for {{{game}}} and packages that best align with the goal of '{{{goal}}}'. The price in the output should be a string including the currency symbol (e.g., '₹99'). The currency amount should be a number (e.g., 86, 172).

Output your suggestions as a JSON object with a 'suggestions' array, matching the specified schema. Each suggestion should include a 'package_name', 'price', 'currency_amount', 'reason', and 'best_for_goal'.`,
});

const aiGiftMatcherSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiGiftMatcherSuggestionsFlow',
    inputSchema: AiGiftMatcherInputSchema,
    outputSchema: AiGiftMatcherOutputSchema,
  },
  async (input) => {
    const { output } = await aiGiftMatcherPrompt(input);
    return output!;
  }
);
