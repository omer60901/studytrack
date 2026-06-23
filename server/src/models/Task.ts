import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'General' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    tags: [{ type: String }],
    dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
