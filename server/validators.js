const { z } = require('zod');

const roomCodeSchema = z
  .string()
  .trim()
  .length(6, 'Room code must be exactly 6 characters')
  .regex(/^[A-Za-z0-9]+$/, 'Room code must be alphanumeric')
  .transform(val => val.toUpperCase());

const createRoomSchema = z.object({
  hostName: z.string().trim().min(1, 'Host name is required').max(30, 'Host name too long'),
  teamName: z.string().trim().max(40, 'Team name too long').optional().default(''),
  isSolo: z.boolean().optional().default(false),
  purse: z.number().int().min(200000000, 'Purse must be at least ₹20 Cr').max(2500000000, 'Purse capped at ₹250 Cr').optional().default(1000000000),
  squadLimit: z.number().int().min(11, 'Squad limit must be at least 11').max(30, 'Squad limit cannot exceed 30').optional().default(18),
  maxOverseas: z.number().int().min(1).max(10).optional().default(8),
  timerDuration: z.number().int().min(5).max(60).optional().default(15),
  userId: z.string().trim().optional()
});

const joinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  userName: z.string().trim().min(1, 'Name is required').max(30, 'Name too long'),
  teamName: z.string().trim().max(40).optional().default(''),
  userId: z.string().trim().optional()
});

const placeBidSchema = z.object({
  roomCode: roomCodeSchema,
  teamId: z.string().min(1, 'Team ID is required'),
  amount: z.number().int().positive('Bid amount must be a positive integer')
});

const setTimerDurationSchema = z.object({
  roomCode: roomCodeSchema,
  seconds: z.number().int().refine(val => [10, 15, 20, 30].includes(val) || (val >= 5 && val <= 60), {
    message: 'Allowed timer durations: 10s, 15s, 20s, 30s'
  })
});

const generatePlayersSchema = z.object({
  roomCode: roomCodeSchema.optional(),
  count: z.number().int().min(1).max(50).optional().default(10),
  filter: z.object({
    role: z.string().optional(),
    country: z.string().optional(),
    name: z.string().max(50).optional(),
    rating: z.number().min(60).max(99).optional(),
    basePrice: z.number().positive().optional()
  }).optional().default({})
});

const roomOnlySchema = z.object({
  roomCode: roomCodeSchema
});

const skipPlayerSchema = z.object({
  roomCode: roomCodeSchema,
  teamId: z.string().optional()
});

module.exports = {
  roomCodeSchema,
  createRoomSchema,
  joinRoomSchema,
  placeBidSchema,
  setTimerDurationSchema,
  generatePlayersSchema,
  roomOnlySchema,
  skipPlayerSchema
};