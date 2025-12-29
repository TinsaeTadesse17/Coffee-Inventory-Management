import { prisma } from './prisma';
import { NotificationType, Role } from '@prisma/client';

/**
 * Email configuration
 * Note: For production, use a service like SendGrid, AWS SES, or Resend
 */
interface EmailConfig {
  enabled: boolean;
  from: string;
  // Add your email service config here
}

const emailConfig: EmailConfig = {
  enabled: process.env.EMAIL_ENABLED === 'true',
  from: process.env.EMAIL_FROM || 'noreply@esetcoffee.com',
};

/**
 * Send email notification
 * Supports SMTP or can be configured for services like SendGrid, AWS SES, Resend
 */
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  if (!emailConfig.enabled) {
    console.log(`[EMAIL DISABLED] To: ${to}, Subject: ${subject}`);
    return;
  }

  try {
    // Option 1: Use SMTP (configure via environment variables)
    /*
    if (process.env.SMTP_HOST) {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: emailConfig.from,
        to,
        subject,
        html: body,
      });

      console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
      return;
    }
    */

    // Option 2: Use Resend API (recommended for production)
    /*
    if (process.env.RESEND_API_KEY) {
      const resend = await import('resend');
      const resendClient = new resend.Resend(process.env.RESEND_API_KEY);

      await resendClient.emails.send({
        from: emailConfig.from,
        to,
        subject,
        html: body,
      });

      console.log(`[EMAIL SENT via Resend] To: ${to}, Subject: ${subject}`);
      return;
    }
    */

    // Option 3: Use SendGrid
    /*
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = await import('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        from: emailConfig.from,
        to,
        subject,
        html: body,
      });

      console.log(`[EMAIL SENT via SendGrid] To: ${to}, Subject: ${subject}`);
      return;
    }
    */

    // Fallback: Log email (for development)
    console.log(`[EMAIL LOG] To: ${to}, Subject: ${subject}`);
    console.log(`[EMAIL BODY]\n${body}`);
    
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
    // Don't throw - email failure shouldn't break the app
  }
}

/**
 * Create notification for a user
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}) {
  const { userId, type, title, message, link, sendEmail: shouldSendEmail = true } = params;

  // Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });

  // Send email notification if enabled
  if (shouldSendEmail) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user?.email) {
      const emailBody = `
        <div>
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2c3e50;">Eset Coffee - ${title}</h2>
            <p>${message}</p>
            ${link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${link}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a></p>` : ''}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated notification from Eset Coffee Dashboard. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      await sendEmail(user.email, `Eset Coffee - ${title}`, emailBody);
    }
  }

  return notification;
}

/**
 * Notify users by role
 */
export async function notifyByRole(params: {
  role: Role | Role[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}) {
  const { role, type, title, message, link, sendEmail = true } = params;

  const roles = Array.isArray(role) ? role : [role];

  const users = await prisma.user.findMany({
    where: {
      role: { in: roles },
      active: true,
    },
    select: { id: true, email: true, name: true },
  });

  const notifications = await Promise.all(
    users.map((user) =>
      createNotification({
        userId: user.id,
        type,
        title,
        message,
        link,
        sendEmail,
      })
    )
  );

  return notifications;
}

/**
 * Notify about approval request
 */
export async function notifyApprovalRequest(params: {
  batchId: string;
  batchNumber: string;
  requestedBy: string;
}) {
  const { batchId, batchNumber, requestedBy } = params;

  const requester = await prisma.user.findUnique({
    where: { id: requestedBy },
    select: { name: true },
  });

  return notifyByRole({
    role: 'CEO',
    type: 'APPROVAL_REQUEST',
    title: 'Approval Requested',
    message: `${requester?.name} has requested approval for Batch ${batchNumber}`,
    link: `/dashboard?batchId=${batchId}`,
  });
}

/**
 * Notify about batch ready for next step
 */
export async function notifyBatchReady(params: {
  batchId: string;
  batchNumber: string;
  nextRole: Role | Role[];
  stepName: string;
}) {
  const { batchId, batchNumber, nextRole, stepName } = params;

  return notifyByRole({
    role: nextRole,
    type: 'BATCH_READY',
    title: `Batch Ready for ${stepName}`,
    message: `Batch ${batchNumber} is ready for ${stepName}`,
    link: `/dashboard?batchId=${batchId}`,
  });
}

/**
 * Notify about aging coffee
 */
export async function notifyAgingCoffee(params: {
  batchId: string;
  batchNumber: string;
  daysInWarehouse: number;
}) {
  const { batchId, batchNumber, daysInWarehouse } = params;

  return notifyByRole({
    role: 'WAREHOUSE',
    type: 'AGING_ALERT',
    title: 'Aging Coffee Alert',
    message: `Batch ${batchNumber} has been in warehouse for ${daysInWarehouse} days (6+ months)`,
    link: `/warehouse?batchId=${batchId}`,
  });
}

/**
 * Notify about duplicate entry
 */
export async function notifyDuplicateEntry(params: {
  batchId: string;
  batchNumber: string;
  submittedBy: string;
}) {
  const { batchId, batchNumber, submittedBy } = params;

  const submitter = await prisma.user.findUnique({
    where: { id: submittedBy },
    select: { name: true },
  });

  return notifyByRole({
    role: ['CEO', 'ADMIN'],
    type: 'DUPLICATE_ENTRY',
    title: 'Duplicate Entry Detected',
    message: `${submitter?.name} attempted to record duplicate data for Batch ${batchNumber}. Approval required.`,
    link: `/dashboard?batchId=${batchId}`,
  });
}

/**
 * Notify about processing completion
 */
export async function notifyProcessingComplete(params: {
  batchId: string;
  batchNumber: string;
  processingRunId: string;
}) {
  const { batchId, batchNumber, processingRunId } = params;

  return notifyByRole({
    role: ['WAREHOUSE', 'EXPORT_MANAGER', 'CEO'],
    type: 'PROCESSING_COMPLETE',
    title: 'Processing Complete',
    message: `Batch ${batchNumber} has completed processing`,
    link: `/processing?runId=${processingRunId}`,
  });
}

/**
 * Notify about low jute bag stock
 */
export async function notifyLowJuteBagStock(params: {
  size: string;
  currentQuantity: number;
  threshold: number;
}) {
  const { size, currentQuantity, threshold } = params;

  return notifyByRole({
    role: ['WAREHOUSE', 'CEO', 'FINANCE'],
    type: 'JUTE_BAG_LOW_STOCK',
    title: 'Low Jute Bag Stock',
    message: `Jute bag inventory for ${size} is low (${currentQuantity} remaining, threshold: ${threshold})`,
    link: '/warehouse',
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get all notifications for user
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}









