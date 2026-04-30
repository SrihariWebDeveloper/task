import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: String,
    input: String,
    operation: String,
    status: {
        type: String,
        default: "pending"
    },
    result: String,
    logs: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;