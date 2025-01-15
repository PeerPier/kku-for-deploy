const mongoose = require("mongoose");

require("./user");
require("./comment");
// require("./like");
require("./save");

// กำหนดโครงสร้างข้อมูลสำหรับโพสต์บล็อก
const postSchema = new mongoose.Schema(
  {
    blog_id: {
      type: String,
      // required: true,
      unique: true,
    },
    topic: {
      type: String,
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
      required: true,
      ref: "User",
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_saves: {
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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    draft: {
      type: Boolean,
      default: false,
    },
    saves: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        blogId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: "publishedAt",
    },
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
