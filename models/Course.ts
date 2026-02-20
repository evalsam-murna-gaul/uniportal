import { Schema, model, models } from 'mongoose';

const CourseSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code format: CS101, MATH202'],
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Max capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 50,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
      // e.g. "2024/2025 - First Semester"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index({ code: 1 });
CourseSchema.index({ faculty: 1 });
CourseSchema.index({ department: 1 });
CourseSchema.index({ semester: 1 });

const Course = models.Course || model('Course', CourseSchema);
export default Course;