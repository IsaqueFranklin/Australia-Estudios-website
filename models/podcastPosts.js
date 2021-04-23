const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Podcast = new Schema({
    title: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    },
    autor: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
});

mongoose.model("podcasts", Podcast);