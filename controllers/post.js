const Post = require('../models/post');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoicGpvc2hpMTUiLCJhIjoiY2plY3lyeW91MHZqbzJybWt4cmM2djF3YiJ9.yiNymklGOJL_8-z07LRf1A';
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports = {
    async postIndex(req, res, next) {
        const posts = await Post.paginate({}, {
            page: req.query.page || 1,
            limit: 10,
            sort: '-_id'
        });
        posts.page = Number(posts.page);
        res.render('posts/index', { posts, mapBoxToken, title: 'Post Index' });
    },

    postNew(req,res,next) {
        res.render('posts/new');
    },

    async postCreate(req,res,next) {
        req.body.post.images = [];
        for(const file of req.files) {
            req.body.post.images.push({
                url: file.secure_url,
                public_id: file.public_id
            });
        }
        const response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 1
            })
            .send()
        req.body.post.geometry = response.body.features[0].geometry;
        req.body.post.author = req.user._id;    
		let post = new Post(req.body.post);
		post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
		await post.save();
        req.session.success = 'Post created successfully';
        res.redirect(`/posts/${post.id}`);
    },

    async postShow(req,res,next) {
        const post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: {sort: {'_id': -1}},
            populate: {
                path: 'author',
                model: 'User'
            }
        });
        const floorRating = post.calculateAvgRating();
        res.render('posts/show', { post, mapBoxToken, floorRating });
    },

    postEdit(req,res,next) {
        res.render('posts/edit');
    },

    async postUpdate(req,res,next) {
        const { post } = res.locals;
        // check if there's any images for deletion
        if(req.body.deleteImages && req.body.deleteImages.length) {
            // assign deleteImages from req.body to it's own variable
            const deleteImages = req.body.deleteImages;
            // loop over deleteImages
            for(let public_id of deleteImages) {
                // delete images from cloudinary
                await cloudinary.v2.uploader.destroy(public_id);
                // delete images from post.images
                for(let image of post.images) {
                    if(image.public_id === public_id) {
                        const index = post.images.indexOf(image);
                        post.images.splice(index,1);
                    }
                }
            }
        }
        // check if there are any new images for upload
        if(req.files) {
            // upload images
            for(const file of req.files) {
                post.images.push({
                    url: file.secure_url,
                    public_id: file.public_id
                });
            }
        }
        if(req.body.post.location !== post.location) {
            const response = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 1
                })
                .send()
            post.geometry = response.body.features[0].geometry;
            post.location = req.body.post.location;
        }
        // update the post with new properties
        post.title = req.body.post.title;
        post.description = req.body.post.description;
        post.price = req.body.post.price;
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        // save the updated post into the db
        await post.save();
        // redirect to show page
        res.redirect(`/posts/${post.id}`);
    },

    async postDestroy(req,res,next) {
        const { post } = res.locals;
        for(let image of post.images) {
            await cloudinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        req.session.success = 'Post deleted Successfully';
        res.redirect('/posts');
    }
};