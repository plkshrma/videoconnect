import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const updates = req.body;

        // Find or create user
        let user = await User.findOne({ clerkId });
        if (!user) {
            user = new User({
                clerkId,
                name: updates.name || 'Unknown User',
                email: updates.email || '',
                profileImage: updates.profileImage || '',
            });
            await user.save();
        } else {
            // Update existing user
            user = await User.findOneAndUpdate(
                { clerkId },
                updates,
                { new: true, runValidators: true }
            );
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};