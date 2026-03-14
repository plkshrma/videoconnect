import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { StreamChat } from 'stream-chat';

const streamClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Helper function to get or create user
const getOrCreateUser = async (clerkId, userData = {}) => {
    let user = await User.findOne({ clerkId });
    if (!user) {
        user = new User({
            clerkId,
            name: userData.name || 'Unknown User',
            email: userData.email || '',
            profileImage: userData.image || '',
        });
        await user.save();
    }
    return user;
};

export const createInterview = async (req, res) => {
    try {
        const { title, description, intervieweeId, questions, scheduledAt, duration } = req.body;
        const interviewerClerkId = req.user.id;

        // Get or create interviewer
        const interviewer = await getOrCreateUser(interviewerClerkId, {
            name: req.user.name || req.user.username,
            email: req.user.email,
            image: req.user.image,
        });

        // Get or create interviewee
        const interviewee = await getOrCreateUser(intervieweeId);

        // Create Stream call
        const call = streamClient.video.call('default', `interview-${Date.now()}`);
        await call.create({
            data: {
                created_by_id: interviewerClerkId,
                members: [{ user_id: interviewerClerkId }, { user_id: intervieweeId }]
            }
        });

        const interview = new Interview({
            title,
            description,
            interviewer: interviewer._id,
            interviewee: interviewee._id,
            questions,
            scheduledAt,
            duration,
            streamCallId: call.id
        });

        await interview.save();
        await interview.populate('interviewer interviewee questions');

        res.status(201).json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getInterviews = async (req, res) => {
    try {
        const userClerkId = req.user.id;

        // Find the user by clerkId
        const user = await User.findOne({ clerkId: userClerkId });
        if (!user) {
            return res.json([]);
        }

        const interviews = await Interview.find({
            $or: [{ interviewer: user._id }, { interviewee: user._id }]
        })
        .populate('interviewer interviewee questions')
        .sort({ scheduledAt: -1 });

        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id)
            .populate('interviewer interviewee questions');

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateInterviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback, rating } = req.body;

        const interview = await Interview.findByIdAndUpdate(
            id,
            { status, feedback, rating },
            { new: true }
        ).populate('interviewer interviewee questions');

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getStreamToken = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user.id;

        const call = streamClient.video.call('default', callId);
        const token = call.generateMemberToken({ user_id: userId });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};