const express = require("express");
const { verify } = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Blog = require("../models/blog");
const Like = require("../models/like");
const Notifications = require("../models/notifaications");
const View = require("../models/view");
const Comment = require("../models/comments");
const auth = require("./authMiddleware");
const bcrypt = require("bcrypt");
const { NotiMailer } = require("../mail/noti_sender");
const BadWordScanner = require("../utils/badword");
const Report = require("../models/report");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res.status(401).json({ error: "ไม่มี token การเข้าถึง" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "การเข้าถึง token ไม่ถูกต้อง" });
    }

    req.user = user.id;
    next();
  });
};

router.post("/", verifyJWT, async (req, res) => {
  const { nanoid } = require("nanoid");
  let authorId = req.user;
  let { topic, des, banner, tags, content, draft, visibility, id } = req.body;
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : ${badword}`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  if (!topic || topic.length === 0) {
    return res.status(403).json({ error: "คุณต้องระบุชื่อบล็อก" });
  }

  if (!draft) {
    if (!des || des.length === 0 || des.length > 200) {
      return res
        .status(403)
        .json({ error: "คุณต้องอธิบายบล็อกต่ำกว่า 200 ตัวอักษร" });
    }

    if (!banner || banner.length === 0) {
      return res
        .status(403)
        .json({ error: "คุณต้องใส่หน้าปกเพื่อเผยแพร่บล็อก" });
    }

    if (content.blocks) {
      if (!content.blocks.length) {
        return res.status(403).json({ error: "เขียนอะไรบางอย่างเพื่อเผยแพร่" });
      }
    }

    if (!tags || tags.length === 0 || tags.length > 10) {
      return res
        .status(403)
        .json({ error: "ใส่แท็กในรายการเพื่อเผยแพร่บล็อก สูงสุด 10 แท็ก" });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    id ||
    topic
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      {
        topic,
        des,
        banner,
        content,
        tags,
        visibility,
        draft: draft ? draft : false,
      }
    )
      .then(() => {
        return res.status(200).json({ id: draft });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: "ไม่สามารถอัปเดตจำนวนโพสต์ทั้งหมดได้" });
      });
  } else {
    let blog = new Blog({
      topic,
      des,
      banner,
      content,
      tags,
      visibility: visibility || "public",
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { total_posts: incrementVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: "ข้อผิดพลาดในการอัพเดตเลขจำนวนโพสต์" });
          });
      })
      .catch((err) => {
        console.error("Error occurred:", err);
        return res.status(500).json({
          error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
          details: err.message,
        });
      });
  }
});

// server/routes/blog.js - Updated increment-view endpoint

router.post("/increment-view", async (req, res) => {
  try {
    const { blog_id } = req.body;

    if (!blog_id || typeof blog_id !== "string") {
      return res.status(400).json({ error: "Invalid Blog ID" });
    }

    let blog = await Blog.findOne({ blog_id });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // ✅ ตรวจสอบว่า views เป็น object ถ้าไม่ใช่ ให้กำหนดใหม่
    if (typeof blog.views !== "object") {
      blog.views = {
        total: blog.views || 0,
        daily: {},
        monthly: {},
        yearly: {},
      };
      await blog.save();
    }

    // ✅ ปรับเวลาเป็นโซนไทย (UTC+7)
    const now = new Date();
    const thailandOffset = 7 * 60 * 60 * 1000;
    const nowInThailand = new Date(now.getTime() + thailandOffset);

    const today = nowInThailand.toISOString().split("T")[0]; // YYYY-MM-DD
    const month = nowInThailand.toISOString().slice(0, 7); // YYYY-MM
    const year = nowInThailand.getFullYear().toString(); // YYYY

    // ✅ ใช้ findOneAndUpdate() เพื่ออัปเดตและคืนค่าล่าสุด
    const updatedBlog = await Blog.findOneAndUpdate(
      { blog_id },
      {
        $inc: {
          "views.total": 1,
          [`views.daily.${today}`]: 1,
          [`views.monthly.${month}`]: 1,
          [`views.yearly.${year}`]: 1,
        },
      },
      { new: true } // ✅ คืนค่า blog ที่ถูกอัปเดตกลับมา
    );

    console.log("🕒 Thai Time:", nowInThailand.toISOString());
    console.log("📅 Views Daily:", updatedBlog.views.daily);
    console.log("✅ Updated Blog Views:", updatedBlog.views.total);

    return res.status(200).json({
      message: "View count updated successfully",
      views: updatedBlog.views.total,
    });
  } catch (err) {
    console.error("🔥 Error incrementing view:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/get-blog", async (req, res) => {
  try {
    const { blog_id } = req.body;
    let userId = null;

    // Extract user ID from JWT token if present
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.error("Token verification failed:", err);
      }
    }

    // First find the blog to get the author ID
    const blog = await Blog.findOne({ blog_id })
      .populate({
        path: "author",
        select: "fullname username profile_picture followers",
      })
      .select(
        "topic des content banner activity views publishedAt blog_id tags visibility author"
      );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (!userId) {
      if (blog.visibility == "public") {
        return res.status(200).json({ blog });
      } else {
        return res.status(403).json({
          error: "This post is only visible to followers",
        });
      }
    }

    // Check viewing permissions using the canView static method
    const canViewBlog = await Blog.canView(userId, blog.author._id);

    if (typeof canViewBlog === "boolean" && canViewBlog) {
      // User is the author - can see everything
      return res.status(200).json({ blog });
    } else if (typeof canViewBlog === "object") {
      // User is either a follower or not logged in - apply visibility filter
      const visibilityFilter = canViewBlog;

      // Check if the blog's visibility matches the allowed visibility
      const canView =
        Array.isArray(visibilityFilter.$or) &&
        visibilityFilter.$or.some((filter) => {
          console.log(filter, blog.visibility);
          return filter.visibility === blog.visibility;
        });

      if (!canView && userId) {
        return res.status(403).json({
          error: "This post is only visible to followers",
        });
      }

      return res.status(200).json({ blog });
    }

    // If we get here, user doesn't have permission
    return res.status(403).json({
      error: "You don't have permission to view this post",
    });
  } catch (err) {
    console.error("Error fetching blog:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/like-blog", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const { _id, islikedByUser } = req.body;
    const incrementVal = !islikedByUser ? 1 : -1;

    const post = await Blog.findByIdAndUpdate(
      _id,
      { $inc: { "activity.total_likes": incrementVal } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!islikedByUser) {
      const newLike = new Like({
        user: user_id,
        post: _id,
      });
      const savedLike = await newLike.save();

      post.likes.push(savedLike._id);
      await post.save();

      const notification = new Notifications({
        type: "like",
        blog: _id,
        notification_for: post.author,
        user: user_id,
        like: savedLike._id,
        entity: post.author,
        entityModel: "User",
      });

      await User.findOneAndUpdate(
        { _id: user_id },
        { $addToSet: { liked_posts: _id } },
        { new: true }
      );

      await notification.save();
      NotiMailer(
        notification.notification_for,
        user_id,
        notification.type,
        newLike.post
      );

      return res.status(200).json({ liked_by_user: true });
    } else {
      // Remove like
      const likeToRemove = await Like.findOneAndDelete({
        user: user_id,
        post: _id,
      });

      if (likeToRemove) {
        post.likes = post.likes.filter(
          (likeId) => !likeId.equals(likeToRemove._id)
        );
        await post.save();

        await User.findOneAndUpdate(
          { _id: user_id },
          { $pull: { liked_posts: _id } },
          { new: true }
        );

        // Delete the associated like notification
        await Notifications.findOneAndDelete({
          user: user_id,
          blog: _id,
          type: "like",
        });
      }

      return res.status(200).json({ liked_by_user: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;

  Notifications.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

router.post("/dislike-blog", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const { _id } = req.body;
    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": -1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    const deletedLike = await Like.findOneAndDelete({
      user: user_id,
      post: _id,
    });

    if (deletedLike) {
      blog.likes = blog.likes.filter(
        (likeId) => !likeId.equals(deletedLike._id)
      );
      await blog.save();
      await Notifications.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      });

      return res.status(200).json({ liked_by_user: false });
    } else {
      return res.status(404).json({ error: "Like not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/add-comment", verifyJWT, async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : ${badword}`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }

  let user_id = req.user;

  let { _id, comment, blog_author, replying_to } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "เขียนอะไรบางอย่างเพื่อแสดงความคิดเห็น" });
  }
  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  new Comment(commentObj)
    .save()
    .then(async (commentFile) => {
      let { comment, commentedAt, children } = commentFile;

      await Blog.findOneAndUpdate(
        { _id },
        {
          $push: { comments: commentFile._id },
          $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1,
          },
        }
      );

      await User.findOneAndUpdate(
        { _id: user_id, commented_posts: { $ne: _id } },
        { $addToSet: { commented_posts: _id } },
        { new: true }
      );

      console.log("แสดงความคิดเห็นแล้ว!");

      let notifaicationObj = {
        type: replying_to ? "reply" : "comment",
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
        entityModel: "User", // Add entity model
        entity: commentFile._id, // Reference the comment
      };

      if (replying_to) {
        notifaicationObj.replied_on_comment = replying_to;

        const replyingToCommentDoc = await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: commentFile._id } }
        );

        notifaicationObj.notification_for = replyingToCommentDoc.commented_by;
      }

      new Notifications(notifaicationObj)
        .save()
        .then(() => console.log("แจ้งเตือนใหม่!!"))
        .catch((err) => console.error("Error saving notification:", err));

      NotiMailer(
        blog_author,
        notifaicationObj.user,
        notifaicationObj.type,
        notifaicationObj.blog
      );

      return res.status(200).json({
        comment,
        commentedAt,
        _id: commentFile._id,
        user_id,
        children,
      });
    })
    .catch((error) => {
      console.error("Error saving comment:", error);
      return res.status(500).json({ error: "Error saving comment." });
    });
});

router.patch("/update-comment", verifyJWT, async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : ${badword}`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }

  let user_id = req.user;
  let { _id, comment } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "เขียนอะไรบางอย่างเพื่อแก้ไขความคิดเห็น" });
  }

  try {
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: _id, commented_by: user_id },
      { comment },
      { new: true }
    );

    if (!updatedComment) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    return res
      .status(200)
      .json({ message: "Comment updated successfully", updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Error updating comment." });
  }
});

router.post("/delete-comment", verifyJWT, async (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const comment = await Comment.findOne({
      _id,
      commented_by: user_id,
    }).session(session);

    if (!comment) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    const deleteCommentAndChildren = async (commentId) => {
      const commentToDelete = await Comment.findById(commentId).session(
        session
      );
      let count = 1;

      if (commentToDelete) {
        const children = commentToDelete.children || [];
        for (const childId of children) {
          count += await deleteCommentAndChildren(childId);
        }
        await Comment.findByIdAndDelete(commentId).session(session);
      }

      return count;
    };

    const totalCommentsToDelete = await deleteCommentAndChildren(comment._id);

    await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: comment._id },
        $inc: { "activity.total_comments": -totalCommentsToDelete },
      }
    ).session(session);

    if (comment.isReply) {
      await Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: comment._id } }
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Comment and its replies deleted successfully",
      totalCommentsToDelete,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Error deleting comment." });
  }
});

router.post("/get-blog-comments", (req, res) => {
  let { blog_id, skip } = req.body;

  let maxLimit = 5;

  Comment.find({ blog_id, isReply: false })
    .populate("commented_by", "username fullname profile_picture")
    .skip(skip)
    .limit(maxLimit)
    .sort({
      commentedAt: -1,
    })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

router.post("/get-replies", (req, res) => {
  let { _id, skip } = req.body;

  let maxLimit = 5;

  Comment.findOne({ _id })
    .populate({
      path: "children",
      option: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select: "profile_picture username fulname",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

// Edit Tag API
router.post("/edit-tag", async (req, res) => {
  const { old_tag, new_tag } = req.body;

  try {
    const result = await Blog.updateMany(
      { tags: old_tag },
      {
        $set: {
          "tags.$[elem]": new_tag,
        },
      },
      { arrayFilters: [{ elem: old_tag }] }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ error: "No blogs found with the given tag" });
    }

    return res.status(200).json({ message: "Tags updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

router.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword, ChecknewPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword) ||
    !passwordRegex.test(ChecknewPassword)
  ) {
    return res.status(403).json({
      error:
        "รหัสผ่านควรมีความยาว 6-20 ตัวอักษร พร้อมตัวเลข ตัวพิมพ์เล็ก 1 ตัว ตัวพิมพ์ใหญ่ 1 ตัว",
    });
  }

  if (newPassword !== ChecknewPassword) {
    return res.status(403).json({ error: "รหัสผ่านใหม่ไม่ตรงกัน" });
  }
  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "คุณไม่สามารถเปลี่ยนรหัสผ่านของบัญชีนี้ได้เพราะคุณเข้าสู่ระบบผ่าน Google",
        });
      }

      bcrypt.compare(currentPassword, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            error:
              "เกิดข้อผิดพลาดบางอย่างขณะบันทึกรหัสผ่านใหม่ โปรดลองอีกครั้งภายหลัง",
          });
        }

        if (!result) {
          return res.status(403).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }

        bcrypt.hash(newPassword, 10, (err, hashed_password) => {
          User.findOneAndUpdate(
            { _id: req.user },
            { password: hashed_password }
          )
            .then((u) => {
              return res.status(200).json({ status: "เปลี่ยนรหัสผ่านแล้ว" });
            })
            .catch((err) => {
              return res.status(500).json({
                error:
                  "เกิดข้อผิดพลาดบางอย่างขณะบันทึกรหัสผ่านใหม่ โปรดลองอีกครั้งภายหลัง",
              });
            });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "หาผู้ใช้ไม่พบ" });
    });
});

router.post("/save-blog", verifyJWT, async (req, res) => {
  const user_id = req.user;
  const { _id, issavedByUser } = req.body;

  const incrementVal = !issavedByUser ? 1 : -1;

  try {
    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_saves": incrementVal } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // อัปเดตข้อมูลการบันทึกในฟิลด์ saves ของโพสต์
    const updateSave = !issavedByUser
      ? { $addToSet: { saves: { user: user_id, blogId: _id } } }
      : { $pull: { saves: { user: user_id, blogId: _id } } };

    const updateUserSavePost = !issavedByUser
      ? await User.findOneAndUpdate(
          { _id: user_id },
          { $addToSet: { saved_posts: _id } },
          { new: true }
        )
      : await User.findOneAndUpdate(
          { _id: user_id },
          { $pull: { saved_posts: _id } },
          { new: true }
        );

    await Blog.findByIdAndUpdate(_id, updateSave);

    return res.status(200).json({ saved_by_user: !issavedByUser });
  } catch (error) {
    console.error("Error saving blog:", error);
    return res.status(500).json({ error: "Failed to save blog" });
  }
});

router.get("/saved-blogs", verifyJWT, async (req, res) => {
  const user_id = req.user; // User ID จาก JWT

  try {
    const blogs = await Blog.find({ "saves.user": user_id }).populate("author");

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ error: "No saved blogs found" });
    }

    return res.status(200).json({ savedBlogs: blogs });
  } catch (error) {
    console.error("Error fetching saved blogs:", error);
    return res.status(500).json({ error: "Failed to fetch saved blogs" });
  }
});
router.get("/saved-blogsPost", verifyJWT, async (req, res) => {
  const user_id = req.user;

  try {
    const blogs = await Blog.find({ "saves.user": user_id })
      .populate("author", "username")
      .select("topic banner des publishedAt blog_id");

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ error: "No saved blogs found" });
    }

    return res.status(200).json({ savedBlogs: blogs });
  } catch (error) {
    console.error("Error fetching saved blogs:", error);
    return res.status(500).json({ error: "Failed to fetch saved blogs" });
  }
});

router.post("/user-written-blog", verifyJWT, async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : ${badword}`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  let user_id = req.user;
  let { page, draft, query, deleteDocCount } = req.body;

  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;

  if (deleteDocCount) {
    skipDocs -= deleteDocCount;
  }

  Blog.find({ author: user_id, draft, topic: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select(" topic banner publishedAt blog_id activity des draft _id")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

router.post("/user-written-blog-count", verifyJWT, async (req, res) => {
  try {
    await BadWordScanner(req.body);
  } catch (err) {
    badword = err.toString().split(" ");
    badword = badword[badword.length - 1];
    return res.status(403).json({
      error: `ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : ${badword}`,
      details: `$ข้อความของคุณมีคำไม่เหมาะสม กรุณาตรวจสอบและแก้ไข : “${badword}”`,
    });
  }
  let user_id = req.user;
  let { draft, query } = req.body;

  Blog.countDocuments({ author: user_id, draft, topic: new RegExp(query, "i") })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// Delete Tag API
router.delete("/deletetag", async (req, res) => {
  const { tag } = req.body;

  try {
    const result = await Blog.updateMany(
      { tags: tag },
      { $pull: { tags: tag } }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ error: "No blogs found with the given tag" });
    }

    return res
      .status(200)
      .json({ message: "Tag deleted successfully from blogs" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/delete-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { blog_id } = req.body;

  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notifications.deleteMany({ blog_id: blog._id }).then((data) =>
        console.log("ลบการแจ้งเตือนแล้ว")
      );

      Comment.deleteMany({ blog_id: blog._id }).then((data) =>
        console.log("ลบความคิดเห็นแล้ว")
      );

      User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { blog: blog._id }, $inc: { total_posts: -1 } }
      ).then((user) => console.log("ลบบล็อกแล้ว"));

      Report.updateMany(
        { post: blog._id },
        { $set: { status: "Cancel", verified: true } }
      ).then(() => {
        console.log("ตรวจสอบ report แล้ว");
      });

      return res.status(200).json({ status: "เรียบร้อยแล้ว" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
router.get("/tag/:tag", async (req, res) => {
  const tag = req.params.tag;
  try {
    const posts = await Blog.find({ tags: tag }).populate({
      path: "author",
      select: "profile_picture username fullname followers",
    });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

module.exports = router;
