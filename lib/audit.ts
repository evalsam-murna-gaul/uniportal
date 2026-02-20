import { connectDB } from './db';
import AuditLog from '@/models/AuditLog';

interface AuditParams {
  actorId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write an audit log entry.
 * Call this after any state-changing API operation.
 * Never await this in the critical path — fire and forget.
 *
 * @example
 * audit({ actorId: session.user.id, action: 'CREATE_USER', resource: 'User', resourceId: newUser._id })
 */
export async function audit({ actorId, action, resource, resourceId, metadata }: AuditParams) {
  try {
    await connectDB();
    await AuditLog.create({ actor: actorId, action, resource, resourceId, metadata });
  } catch (err) {
    // Log silently — audit failure should never break the main request
    console.error('[Audit Log Error]', err);
  }
}