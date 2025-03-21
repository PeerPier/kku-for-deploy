import { Link } from "react-router-dom";
import { Post } from "../types/post";
import { getDay } from "../common/date";

interface BlogCardProps {
  blog: Post;
  index: number;
}

const MinimalBlogPost: React.FC<BlogCardProps> = ({ blog, index }) => {
  const { topic, blog_id: id, author, publishedAt, activity } = blog;

  const fullname = author?.fullname || "ไม่ทราบผู้เขียน";
  const username = author?.username || "ไม่ทราบชื่อผู้ใช้";
  const profile_picture = author?.profile_picture || "default-image.jpg";

  return (
    <Link to={`/blog/${id}`} className="blog-link d-flex gap-4 mb-2">
      <h1 className="blog-index">{String(index + 1).padStart(2, "0")}</h1>

      <div>
        <div className="d-flex gap-2 align-items-center mb-2">
          <img
            src={profile_picture}
            alt=""
            className=" rounded-circle"
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
              width: "220px",
            }}
          >
            {fullname} @{username}
          </p>
          <p className="w-auto m-0 fw-medium">
            {getDay(publishedAt)} {" "}
            {new Date(publishedAt).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <h1 className="blog-title">{topic}</h1>
        <div className="total-like-view" style={{display:"flex", gap:".5rem", alignItems:"center"}}>
          <button className="rounded-circle d-flex align-items-center justify-content-center not-liked" style={{ width: "2.5rem", height: "2.5rem" }}><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"></path></svg></button>
          <button className="m-0" style={{ color: "rgb(73, 73, 73)" }}>{activity.total_likes}</button>
        </div>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;
