const postController = {
    getAllPosts: async (req, res) => {
        res.status(200).json({ message: 'Get all posts endpoint' });
    },
    getPostById: async (req, res) => {
        res.status(200).json({ message: 'Get post by id endpoint' });
    }
};

module.exports = postController; 