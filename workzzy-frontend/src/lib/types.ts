export interface Job {
  id: string;
  title: string;
  address: string;
  initialDescription: string;
  fullDescription: string;
  status: JobStatus;
  hirerId: string;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

// Fixed enum declaration syntax
export const JobStatus = {
  PENDING: "PENDING",
  COMMITTED: "COMMITTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export interface Payment {
  id: string;
  amount: number;
  platformFee: number;
  workerAmount: number;
  depositRefund: number | null;
  status: PaymentStatus;
  hirerId: string;
  workerId: string;
  jobId: string;
  stripePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Fixed enum declaration syntax
export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  message: string | null;
  status: ApplicationStatus;
  depositId: string | null;
  depositStatus: DepositStatus;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

// Fixed enum declaration syntax
export const ApplicationStatus = {
  APPLIED: "APPLIED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;
export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

// Fixed enum declaration syntax
export const DepositStatus = {
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  REFUNDED: "REFUNDED",
} as const;
export type DepositStatus = (typeof DepositStatus)[keyof typeof DepositStatus];

export interface JobImage {
  id: string;
  jobId: string;
  url: string;
  isPublic: boolean;
  caption: string | null;
  createdAt: string;
}
