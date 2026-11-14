import { z } from 'zod';

import { nonEmptyTrimmedString, uuidSchema, visitorIdSchema } from './common';

export const sendChatMessageSchema = z.object({
  session_id: uuidSchema.optional(),
  assignment_id: uuidSchema,
  visitor_id: visitorIdSchema,
  scenario_run_id: uuidSchema.optional(),
  message: nonEmptyTrimmedString(1500, 'Nội dung tin nhắn'),
  is_simulated: z.boolean().default(false),
});

export const chatSessionsQuerySchema = z.object({
  assignment_id: uuidSchema,
  visitor_id: visitorIdSchema.optional(),
  scenario_run_id: uuidSchema.optional(),
});

/**
 * Structured output schema enforced on Gemini response before server-side grounding check.
 */
export const llmAdvisorStructuredOutputSchema = z.object({
  reply: nonEmptyTrimmedString(3000, 'Câu trả lời của trợ lý'),
  suggested_products: z
    .array(
      z.object({
        product_id: uuidSchema,
        reason: nonEmptyTrimmedString(300, 'Lý do gợi ý'),
      })
    )
    .max(3),
  missing_catalog_info: z.boolean().default(false),
});

export type SendChatMessageInput = z.input<typeof sendChatMessageSchema>;
export type ChatSessionsQueryInput = z.infer<typeof chatSessionsQuerySchema>;
export type LlmAdvisorStructuredOutput = z.infer<
  typeof llmAdvisorStructuredOutputSchema
>;
