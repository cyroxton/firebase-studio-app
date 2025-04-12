'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting a priority level for a task based on its description.
 *
 * - suggestTaskPriority - A function that takes a task description as input and returns a suggested priority level.
 * - SuggestTaskPriorityInput - The input type for the suggestTaskPriority function.
 * - SuggestTaskPriorityOutput - The return type for the suggestTaskPriority function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestTaskPriorityInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task.'),
});
export type SuggestTaskPriorityInput = z.infer<typeof SuggestTaskPriorityInputSchema>;

const SuggestTaskPriorityOutputSchema = z.object({
  suggestedPriority: z.enum(['low', 'medium', 'high']).describe('The suggested priority level for the task.'),
  reasoning: z.string().describe('The reasoning behind the suggested priority.'),
});
export type SuggestTaskPriorityOutput = z.infer<typeof SuggestTaskPriorityOutputSchema>;

export async function suggestTaskPriority(input: SuggestTaskPriorityInput): Promise<SuggestTaskPriorityOutput> {
  return suggestTaskPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskPriorityPrompt',
  input: {
    schema: z.object({
      taskDescription: z.string().describe('The description of the task.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedPriority: z.enum(['low', 'medium', 'high']).describe('The suggested priority level for the task.'),
      reasoning: z.string().describe('The reasoning behind the suggested priority.'),
    }),
  },
  prompt: `You are a task prioritization expert. Given the following task description, suggest a priority level (low, medium, or high) and explain your reasoning.\n\nTask Description: {{{taskDescription}}}\n\nSuggested Priority: \nReasoning: `,
});

const suggestTaskPriorityFlow = ai.defineFlow<
  typeof SuggestTaskPriorityInputSchema,
  typeof SuggestTaskPriorityOutputSchema
>(
  {
    name: 'suggestTaskPriorityFlow',
    inputSchema: SuggestTaskPriorityInputSchema,
    outputSchema: SuggestTaskPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
