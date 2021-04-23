const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/admin')
const Admin = mongoose.model('admins')
require('../models/posts')
const Post = mongoose.model('posts')
require('../models/podcastPosts')
const Podcast = mongoose.model('podcasts')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { post } = require('./admin')

router.get('/ler/:id', function(req, res){
    Post.findOne({_id: req.params.id}).lean().populate('post').then(function(posts){
        Post.find().lean().sort({_id: -1}).limit(3).then(function(post){
            res.render('website/ler', {posts: posts, post: post})
        })
    })
})

router.get('/blog', function(req, res){
    Post.find().lean().sort({_id: -1}).then(function(posts){
        res.render('website/blog', {posts: posts})
    })
})

router.get('/podcasts', function(req, res){
    Podcast.find().lean().sort({_id: -1}).then(function(podcasts){
        res.render('website/podcasts', {podcasts: podcasts})
    })
})

router.get('/ouvir/:id', (req, res) => {
    Podcast.findOne({ _id: req.params.id }).lean().populate('podcasts').then((podcasts) => {
        Podcast.find().lean().sort({_id: -1}).limit(3).then((podcast) => {
            res.render('website/ouvir', {podcasts: podcasts, podcast: podcast})
        })
    })
})

router.get('/contato', function(req, res){
    res.render('website/contato')
})

router.get('/designs', function(req, res){
    res.render('website/designs')
})

router.get('/milesimosol', function(req, res){
    res.render('website/milesimosol')
})


module.exports = router