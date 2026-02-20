import { Schema, model, models } from 'mongoose';
import { GRADE_TYPE } from '../constants/roles';

const GradeSchema = new Schema(
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
    assignment: {
      type: String,
      required: [true, 'Assignment name is required'],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
    },
    maxScore: {
      type: Number,
      required: [true, 'Max score is required'],
      min: [1, 'Max score must be at least 1'],
    },
    type: {
      type: String,
      enum: Object.values(GRADE_TYPE),
      required: [true, 'Grade type is required'],
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

GradeSchema.index({ student: 1, course: 1 });
GradeSchema.index({ course: 1, type: 1 });

// Virtual: percentage score
GradeSchema.virtual('percentage').get(function () {
  return ((this.score / this.maxScore) * 100).toFixed(1);
});

const Grade = models.Grade || model('Grade', GradeSchema);
export default Grade;