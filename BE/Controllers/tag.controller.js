const tagController = {
    getAllTags: async (req, res) => {
        res.status(200).json({ message: 'Get all tags endpoint' });
    },
    getTagById: async (req, res) => {
        res.status(200).json({ message: 'Get tag by id endpoint' });
    }
};

module.exports = tagController; 