import { Schema, model, models } from 'mongoose';
import { ANNOUNCEMENT_TARGET } from '../constants/roles';

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_TARGET),
      default: ANNOUNCEMENT_TARGET.ALL,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AnnouncementSchema.index({ targetRole: 1, createdAt: -1 });
AnnouncementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index: auto-delete expired

const Announcement = models.Announcement || model('Announcement', AnnouncementSchema);
export default Announcement;