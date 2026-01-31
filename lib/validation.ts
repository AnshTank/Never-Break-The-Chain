import { z } from 'zod';

// OTP validation
export const otpSchema = z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits');

// Common validation patterns
export const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const signupSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional()
});

export const setupPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

// OTP schemas
export const sendOTPSchema = z.object({
  email: emailSchema,
  type: z.enum(['verification', 'reset']).optional().default('verification'),
});

export const verifyOTPSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  newPassword: passwordSchema,
  verified: z.boolean().optional(), // Flag to indicate OTP was already verified
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
});

// MNZD Configuration schemas
export const mnzdConfigSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  minMinutes: z.number().int().min(5, 'Minimum 5 minutes').max(480, 'Maximum 8 hours'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
});

export const mnzdConfigsSchema = z.object({
  mnzdConfigs: z.array(mnzdConfigSchema).min(1, 'At least one config required').max(10, 'Too many configs')
});

// Progress schemas
export const taskProgressSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  minutes: z.number().int().min(0, 'Minutes cannot be negative').max(1440, 'Cannot exceed 24 hours'),
  completed: z.boolean().default(false)
});

export const dailyProgressSchema = z.object({
  date: dateSchema,
  tasks: z.array(taskProgressSchema).optional(),
  totalHours: z.number().min(0).max(24).optional()
});

export const progressUpdateSchema = z.object({
  date: dateSchema,
  updates: z.object({
    tasks: z.array(taskProgressSchema).optional(),
    totalHours: z.number().min(0).max(24).optional()
  })
});

export const progressQuerySchema = z.object({
  date: dateSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional()
}).refine(
  (data) => data.date || (data.startDate && data.endDate),
  'Either date or both startDate and endDate are required'
);

// Settings schemas
export const userSettingsSchema = z.object({
  mnzdConfigs: z.array(mnzdConfigSchema).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.boolean().optional(),
  timezone: z.string().optional()
});

// User profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: emailSchema.optional()
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  type: z.enum(['daily', 'weekly', 'monthly']).optional()
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  'Start date must be before or equal to end date'
);

// Generic validation helpers
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be 1-100').optional()
});

// Request validation wrapper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Query parameter validation
export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): { success: true; data: T } | { success: false; error: string } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return validateRequest(schema, params);
}