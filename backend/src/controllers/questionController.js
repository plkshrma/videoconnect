import Question from '../models/Question.js';

export const createQuestion = async (req, res) => {
    try {
        const { title, description, type, options, correctAnswer, points, timeLimit } = req.body;
        const createdBy = req.user.id; // Assuming auth middleware

        const question = new Question({
            title,
            description,
            type,
            options,
            correctAnswer,
            points,
            timeLimit,
            createdBy
        });

        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const question = await Question.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findByIdAndDelete(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};