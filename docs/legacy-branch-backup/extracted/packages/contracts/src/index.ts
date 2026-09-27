import { z } from 'zod';

export const aspirationStatusSchema = z.enum([
  'exploring',
  'active',
  'paused',
  'evolving',
  'completed',
  'released',
]);
export const boardRoleSchema = z.enum(['owner', 'editor', 'viewer']);
export const createBoardSchema = z.strictObject({
  title: z.string().trim().min(1).max(160),
  entryMode: z.enum(['reflect', 'visual']),
  themes: z.array(z.string().trim().min(1).max(80)).max(3).default([]),
});

// Ownership and visibility are deliberately absent from client creation input.
export const meaningCardSchema = z.strictObject({
  meaning: z.string().trim().max(2000).optional(),
  desiredFeeling: z.string().trim().max(300).optional(),
  futureScene: z.string().trim().max(2000).optional(),
  nextStep: z.string().trim().max(500).optional(),
  obstacle: z.string().trim().max(500).optional(),
  ifThenPlan: z
    .strictObject({
      if: z.string().trim().min(1).max(500),
      then: z.string().trim().min(1).max(500),
    })
    .optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type MeaningCard = z.infer<typeof meaningCardSchema>;
export type AspirationStatus = z.infer<typeof aspirationStatusSchema>;
export type BoardRole = z.infer<typeof boardRoleSchema>;
