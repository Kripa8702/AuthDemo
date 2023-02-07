const { default: mongoose } = require("mongoose");

const postSchema = mongoose.Schema({
    userId : {
        required : true,
        type : String
    },
    
    postId : {
        required : true,
        type : String
    },
    
    picUrl : {
        required : true,
        type : String
    },
    
    description : {
        required : true,
        type : String
    },
    
    likes : {
        required : false,
        type : [String],
    },

    datePublished : {
        required : true,
        type : String
    },
    
    comments : {
        required : false,
        type : [Map]
    }, 
})

module.exports = mongoose.model('Post' , postSchema);