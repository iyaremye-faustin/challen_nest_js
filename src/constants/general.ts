export const ORGANIZATION_STATUSES = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
};

export type CountryAddress = {
  province: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
};

export type OrganisationContactPerson = {
  name: string;
  email: string;
  phone: string;
};

export type DimensionValueTarget = {
  value_id: string;
  target: number;
};


export const ROLE_STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'INACTIVE',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  PENDING: 'PENDING',
};


export const OTP_EXPIRY_SECONDS = 300;

export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_RESEND_MAX_ATTEMPTS = 5;
export const OTP_RESEND_WINDOW_SECONDS = 15 * 60;


export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export const LOAN_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const LOAN_PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE'
};

export const PAYMENT_NOTIFICATION_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SUCCESS',
  FAILED: 'FAILED'
};

export const PAYMENT_CHANNEL = {
  MTN: 'MTN',
  AIRTEL: 'AIRTEL',
  BANK: 'BANK',
}