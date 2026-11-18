import { z } from 'zod';

import {
  booleanFlagQuerySchema,
  nonEmptyTrimmedString,
  uuidSchema,
  visitorIdSchema,
} from './common';

export const sendChatMessageSchema = z
  .object({
    session_id: uuidSchema.optional(),
    assignment_id: uuidSchema.optional(),
    visitor_id: visitorIdSchema.optional(),
    scenario_run_id: uuidSchema.optional(),
    message: nonEmptyTrimmedString(1500, 'Nội dung tin nhắn'),
    locale: z.enum(['vi', 'en', 'ru', 'zh']).default('vi'),
    is_simulated: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.assignment_id && !data.visitor_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['visitor_id'],
        message: 'visitor_id là bắt buộc khi chat trong phiên thí nghiệm.',
      });
    }
  });

export const chatSessionsQuerySchema = z.object({
  assignment_id: uuidSchema.optional(),
  visitor_id: visitorIdSchema.optional(),
  scenario_run_id: uuidSchema.optional(),
});

export const adminChatLogsQuerySchema = z.object({
  include_simulated: booleanFlagQuerySchema.default(false),
  limit: z.coerce.number().int().min(1).max(100).default(30),
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
export type AdminChatLogsQueryInput = z.infer<typeof adminChatLogsQuerySchema>;
export type LlmAdvisorStructuredOutput = z.infer<
  typeof llmAdvisorStructuredOutputSchema
>;
