import { Schema, model, models } from 'mongoose';
import { ATTENDANCE_STATUS } from '../constants/roles';

const AttendanceSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, 'Status is required'],
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per student per course per day
AttendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ course: 1, date: 1 });

const Attendance = models.Attendance || model('Attendance', AttendanceSchema);
export default Attendance;