import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import BlogCard from "../components/blogpost.component";
import { Post } from "../types/post";
import { FaTag } from "react-icons/fa6";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "./page-animation";

interface BlogState {
  result: Post[];
  totalDocs: number;
  page: number;
}

const TagPost = () => {
  const { tag } = useParams();
  const [blogs, setBlogs] = useState<Post[] | null>(null); 
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (tag) {
      fetchPostsByTag(tag); 
    }
  }, [tag]);

  const fetchPostsByTag = async (tag: string) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/create-blog/tag/${tag}`
      );

      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="tag-post-container">
      <div className="d-flex align-items-center gap-3 flex-wrap mb-5 tag-header">
        <FaTag className="tag-icon" size={36} />
        <span className="fs-4 fw-semibold tag-text">แท็ก: {tag}</span>
      </div>

      <div className="mt-4">
        {blogs && blogs.length > 0 ? (
          blogs.map((blog, i) => (
            <AnimationWrapper
              transition={{ duration: 1, delay: i * 0.1 }}
              key={i}
            >
              <div className="blog-card-wrapper ">
                <BlogCard content={blog} author={blog.author} />
              </div>
            </AnimationWrapper>
          ))
        ) : (
          <NoDataMessage message={`ไม่มีบล็อกที่เกี่ยวข้องกับแท็ก "${tag}"`} />
        )}
      </div>
    </div>
  );
};

export default TagPost;
