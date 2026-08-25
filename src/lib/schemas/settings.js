import { z } from 'zod';

export const settingsSchema = z.object({
  // General
  platformName: z.string().min(1, 'Platform name is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  
  // Booking
  minBookingNotice: z.coerce.number().min(0, 'Must be positive'),
  maxBookingAdvance: z.coerce.number().min(1, 'Must be greater than 0'),
  
  // Payment
  currency: z.string().min(1, 'Currency is required'),
  paymentGateway: z.string().min(1, 'Payment gateway is required'),
  
  // Tax
  gstPercentage: z.coerce.number().min(0).max(100),
  taxRegistrationNumber: z.string().optional(),
  
  // Platform Fee
  platformFeePercentage: z.coerce.number().min(0).max(100),
  
  // Cancellation
  freeCancellationWindow: z.coerce.number().min(0),
  lateCancellationFee: z.coerce.number().min(0).max(100),
  
  // Refund
  refundProcessingDays: z.coerce.number().min(0),
  
  // Payout
  minimumPayoutAmount: z.coerce.number().min(0),
  payoutSchedule: z.string().min(1, 'Payout schedule is required'),
  
  // Notification
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  
  // Support
  supportEmail: z.string().email('Invalid support email'),
  supportPhone: z.string().min(1, 'Support phone is required'),
  
  // Maintenance
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
});
