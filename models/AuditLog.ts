import { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      // e.g. 'CREATE_USER', 'UPDATE_GRADE', 'DROP_COURSE'
    },
    resource: {
      type: String,
      required: true,
      trim: true,
      // e.g. 'User', 'Grade', 'Enrollment'
    },
    resourceId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
);

AuditLogSchema.index({ actor: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: -1 });

const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);
export default AuditLog;