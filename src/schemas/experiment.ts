import { z } from 'zod';

import {
  booleanFlagQuerySchema,
  uuidSchema,
  visitorIdSchema,
} from './common';

export const shopProfileSchema = z.object({
  industry: z.string().trim().max(80).optional(),
  monthly_orders: z.string().trim().max(60).optional(),
  team_size: z.number().int().min(1).max(500).optional(),
  channels: z.array(z.string().trim().max(40)).max(10).optional(),
  role_in_study: z.enum(['shop_owner', 'student_roleplay']).optional(),
});

export const experimentConsentSchema = z.object({
  experiment_code: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .default('exp_chatbot_advisor_v1'),
  visitor_id: visitorIdSchema,
  consent_given: z.literal(true, {
    error: 'Bạn cần đồng ý điều khoản tham gia trước khi bắt đầu thí nghiệm.',
  }),
  shop_profile: shopProfileSchema.default({}),
  is_simulated: z.boolean().default(false),
});

export const scenarioNextQuerySchema = z.object({
  assignment_id: uuidSchema,
});

export const completeScenarioSchema = z.object({
  assignment_id: uuidSchema,
  scenario_run_id: uuidSchema,
  selected_product_id: uuidSchema,
  confidence_score: z
    .number()
    .int()
    .min(1, 'Độ tự tin tối thiểu là 1.')
    .max(5, 'Độ tự tin tối đa là 5.'),
  decision_note: z.string().trim().max(500).optional(),
});

export const adminDashboardQuerySchema = z.object({
  include_simulated: booleanFlagQuerySchema.default(false),
});

export type ExperimentConsentInput = z.input<typeof experimentConsentSchema>;
export type CompleteScenarioInput = z.infer<typeof completeScenarioSchema>;
