import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    type: { type: String, enum: ['exam', 'assignment', 'event'], default: 'event' },
    subject: { type: String },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    recurrenceEnd: { type: Date }
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
