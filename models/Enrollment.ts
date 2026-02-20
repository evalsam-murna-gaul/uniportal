import { Schema, model, models } from 'mongoose';
import { ENROLLMENT_STATUS } from '../constants/roles';

const EnrollmentSchema = new Schema(
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
    status: {
      type: String,
      enum: Object.values(ENROLLMENT_STATUS),
      default: ENROLLMENT_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// A student can only enroll in a course once
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ course: 1, status: 1 });

const Enrollment = models.Enrollment || model('Enrollment', EnrollmentSchema);
export default Enrollment;