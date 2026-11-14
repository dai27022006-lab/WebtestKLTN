import { z } from 'zod';

import {
  EVENT_NAMES,
  EVENT_VARIANTS,
  isChatOnlyEvent,
} from '@/lib/tracking/events';

import { isoDatetimeSchema, uuidSchema, visitorIdSchema } from './common';

export const eventNameSchema = z.enum(EVENT_NAMES);

export const eventVariantSchema = z.enum(EVENT_VARIANTS);

export const trackEventSchema = z
  .object({
    visitor_id: visitorIdSchema,
    assignment_id: uuidSchema,
    variant: eventVariantSchema,
    event_name: eventNameSchema,
    created_at: isoDatetimeSchema,
    scenario_run_id: uuidSchema.nullable().optional(),
    session_id: uuidSchema.nullable().optional(),
    product_id: uuidSchema.nullable().optional(),
    properties: z.record(z.string(), z.unknown()).default({}),
    is_simulated: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (isChatOnlyEvent(data.event_name) && data.variant !== 'chatbot_on') {
      ctx.addIssue({
        code: 'custom',
        path: ['event_name'],
        message: `Sự kiện ${data.event_name} chỉ hợp lệ khi variant là chatbot_on.`,
      });
    }
  });

export type TrackEventSchemaInput = z.input<typeof trackEventSchema>;
export type TrackEventSchemaOutput = z.infer<typeof trackEventSchema>;
