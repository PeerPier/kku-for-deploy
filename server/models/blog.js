const mongoose = require("mongoose");

require("./user");
require("./comment");
require("./like");
require("./save");

// กำหนดโครงสร้างข้อมูลสำหรับโพสต์บล็อก
const postSchema = new mongoose.Schema(
  {
    blog_id: {
      type: String,
      unique: true,
    },
    topic: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: false,
    },
    category: {
      type: [String],
      required: true,
    },
    banner: {
      type: String,
    },
    des: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: [],
    },
    tags: {
      type: [String],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }],
    draft: {
      type: Boolean,
      default: false,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    }],
    saves: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavedPost",
    }],
    views: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'followers'],
      default: 'public'
    },
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);


postSchema.statics.canView = async function(userId, authorId) {
  // If viewer is the author, they can see all their posts
  if (userId && userId === authorId?.toString()) {
    return true;
  }
  
  // If no logged in user, they can only see public posts
  if (!userId) {
    return { visibility: 'public' };
  }
  
  // Otherwise, check if user is a follower
  const user = await mongoose.model('User').findById(userId);
  const author = await mongoose.model('User').findById(authorId);
  const isFollower = author?.followers?.includes(userId);
  
  return {
    $or: [
      { visibility: 'public' },
      ...(isFollower ? [{ visibility: 'followers' }] : [])
    ]
  };
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;