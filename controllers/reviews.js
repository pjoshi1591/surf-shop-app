const Post = require('../models/post');
const Review = require('../models/review');

module.exports = {
    async reviewCreate(req,res,next) {
        // Find the post by it's id
        const post = await Post.findById(req.params.id);
        // Create the review
        req.body.review.author = req.user._id;
        const review = await Review.create(req.body.review);
        // assign review to post
        post.reviews.push(review);
        // save the post
        post.save();
        // redirect to the post
        req.session.success = 'Review Created Successfuly!';
        res.redirect(`/posts/${post.id}`);
    },

    async reviewUpdate(req,res,next) {
        await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
        req.session.success = 'Review updated successfully';
        res.redirect(`/posts/${req.params.id}`);
    },

    async reviewDestroy(req,res,next) {

    }
};