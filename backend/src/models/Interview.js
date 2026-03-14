import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    streamCallId: {
        type: String,
        default: ''
    },
    feedback: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    }
}, {
    timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;