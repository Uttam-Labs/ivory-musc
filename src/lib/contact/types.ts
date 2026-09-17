export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
  attachmentId?: string;
  attachmentName?: string;
};
