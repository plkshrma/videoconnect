import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['text', 'multiple-choice', 'coding', 'video'],
        default: 'text'
    },
    options: [{
        type: String
    }], // for multiple choice
    correctAnswer: {
        type: String,
        default: ''
    },
    points: {
        type: Number,
        default: 1
    },
    timeLimit: {
        type: Number, // in seconds
        default: 0 // 0 means no limit
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;