import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../../page-animation";
import MinimalBlogPost from "../../nobanner-blog";
import Loader from "../../../components/loader.component";
import { Post } from "../../../types/post";
import NoDataMessage from "../../../components/nodata.component";
import { MdAutoGraph } from "react-icons/md";
import { FcLike } from "react-icons/fc";

const MostPopular = () => {
  const API_URL =
    process.env.REACT_APP_API_ENDPOINT ||
    "https://kku-blog-server-ak2l.onrender.com";

  const [trendingBlogs, setTrendingBlogs] = useState<Post[] | null>(null);
  const fetchTrendingBlogs = () => {
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/posts/trending-blogs`)
      .then(({ data }) => {
        // เอาแค่ 10 อันดับแรกที่ถูกใจมากที่สุด
        const top10Blogs = data.blogs.slice(0, 10);
        setTrendingBlogs(top10Blogs);
      })
      .catch((err) => {
        console.log("Error fetching trending blogs:", err);
      });
  };

  useEffect(() => {
    fetchTrendingBlogs();
  }, []);

  return (
    <AnimationWrapper>
      <section className="container py-4">
        <h4 className="fw-bold fs-3 mb-4 flex items-center gap-2">
          โพสต์ที่มีคนกดไลค์สูงสุด <FcLike className="text-xl" />
        </h4>

        {trendingBlogs === null ? (
          <Loader />
        ) : trendingBlogs.length > 0 ? (
          trendingBlogs.map((blog, i) => (
            <AnimationWrapper
              transition={{ duration: 1, delay: i * 0.1 }}
              key={blog._id}
            >
              <MinimalBlogPost blog={blog} index={i} />
            </AnimationWrapper>
          ))
        ) : (
          <NoDataMessage message="ไม่มีบล็อกที่ติดเทรนด์" />
        )}
      </section>
    </AnimationWrapper>
  );
};

export default MostPopular;
