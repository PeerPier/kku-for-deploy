import { Link } from "react-router-dom";
import { Post, Author } from "../types/post";
import { 
  FaRegHeart, 
  FaRegCommentDots, 
  FaEllipsisV, 
  FaEye 
} from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaEarthAmericas } from "react-icons/fa6";


import { getDay } from "../common/date";
import { useState } from "react";

interface BlogCardProps {
  content: Post;
  author: Author;
}

const BlogCard: React.FC<BlogCardProps> = ({ content, author }) => {
  const {
    publishedAt,
    tags,
    topic,
    des,
    banner,
    activity: { total_likes, total_comments },
    blog_id: id,
    views,         // view count from content
    visibility,    // visibility from content ("followers" or other value)
  } = content;

  const {
    fullname = "Unknown Author",
    profile_picture = "",
    username = "Unknown User",
  } = author || {};

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const tagList = Array.isArray(tags) ? tags : [];

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click event from propagating to the parent Link
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="blog-card-wrapper" style={{ position: "relative" }}>
      <Link
        to={`/blog/${id}`}
        className="blog-link d-flex align-items-center mb-4"
        style={{
          borderBottom: "1px solid #ccc",
          paddingBottom: "1.25rem",
          textDecoration: "none",
        }}
      >
        <div className="w-100">
          <div className="d-flex gap-2 align-items-center mb-7">
            <img
              src={profile_picture}
              alt=""
              className="rounded-circle"
              style={{ height: "24px", width: "24px" }}
            />
            <p
              className="m-0 fw-medium"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: "1",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fullname} @{username}
            </p>
            <p className="w-auto m-0 fw-medium">
              {publishedAt
                ? `${getDay(publishedAt)} ${
                    new Date(publishedAt).getFullYear() + 543
                  } เวลา ${new Date(publishedAt).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "ไม่ทราบวันที่"}
            </p>
            <span className="d-flex align-items-center gap-2" style={{ color: "#404040" }}>
              {visibility === "followers" ? (
                <>
                  <FaUserAlt  style={{ marginRight: "0.2rem" }} />
                  
                </>
              ) : (
                <>
                <FaEarthAmericas style={{ marginRight: "0.2rem" }} />
                  
                </>
              )}
            </span>
          </div>

          <h1 className="blog-title mt-3">{topic}</h1>

          <p className="descript-blogpost">{des}</p>
          <div className="d-flex gap-4 mt-3" style={{ alignItems: "center" }}>
            <span className="d-flex align-items-center gap-2" style={{ color: "#404040" }}>
              <FaRegHeart />
              {total_likes}
            </span>
            <span className="d-flex align-items-center gap-2" style={{ color: "#404040" }}>
              <FaRegCommentDots />
              {total_comments}
            </span>
           
            
          </div>

          <div className="d-flex gap-4 mt-3">
            {tagList.map((tag, index) => (
              <span key={index} className="btn-light py-1 px-4">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ aspectRatio: "1/1", height: "7rem", background: "#f0f0f0" }}>
          <img
            src={banner}
            alt=""
            className="w-100 h-100"
            style={{ objectFit: "cover", aspectRatio: "1/1" }}
          />
        </div>
      </Link>

      {/* Three dots menu button */}
      <div
        className="menu-button"
        onClick={handleDropdownToggle}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          cursor: "pointer",
        }}
      >
        <FaEllipsisV />
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div
          className="dropdown-menu"
          style={{
            position: "absolute",
            top: "30px", // Adjust position below the three dots button
            right: "10px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
          }}
        >
          <button className="dropdown-item" style={{ padding: "8px 16px" }}>
            Edit
          </button>
          <button className="dropdown-item" style={{ padding: "8px 16px" }}>
            Delete
          </button>
          <button className="dropdown-item" style={{ padding: "8px 16px" }}>
            Report
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogCard;
