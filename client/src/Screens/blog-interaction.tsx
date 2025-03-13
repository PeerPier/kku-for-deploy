import { useContext, useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { BlogContext } from "./blog.page";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoBookmarkOutline } from "react-icons/io5";
import { MdOutlineBookmark } from "react-icons/md";
import LikeModal from "../components/like-modal.component";
import { MdReport } from "react-icons/md";
import { addReport } from "../api/post";
import { Button, Form, Modal } from "react-bootstrap";

const BlogInteraction = () => {
  const blogContext = useContext(BlogContext);
  const userContext = useContext(UserContext);
  const [showLikesModal, setShowLikesModal] = useState(false);
  
  const userId = sessionStorage.getItem("userId");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportSubmittedModal, setShowReportSubmittedModal] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const navigate = useNavigate();

  const handleShowReportModal = (id: string | undefined) => {
    setReportPostId(id || "");
    setShowReportModal(true);
  };
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportPostId(null);
    setReportReason("");
  };
  const handleReportPost = async () => {
    if (reportPostId && reportReason) {
      try {
        if (!userId) {
          throw new Error("User is not logged in.");
        }

        const response = await addReport(reportPostId, reportReason, userId);

        if (response && response.status === 201) {
          toast.success("Report submitted successfully!");
          // ปิด modal รายงานและแสดง modal แจ้งผลสำเร็จ
          handleCloseReportModal();
          setShowReportSubmittedModal(true);
        } else {
          toast.error("Failed to submit the report.");
          handleCloseReportModal();
        }
      } catch (error) {
        console.error("Failed to report post:", error);
        toast.error("An error occurred while submitting the report.");
      }
    } else {
      toast.error("Please enter a reason for the report.");
    }
  };
  if (!blogContext || !userContext) {
    return null;
  }

  const {
    blog,
    blog: { _id, topic, blog_id, activity, activity: blogActivity, author },
    setBlog,
    islikedByUser,
    setLikeByUser,
    issavedByUser,
    setSaveByUser,
    setCommentWrapper,
  } = blogContext;

  const total_likes = blogActivity?.total_likes || 0;
  const total_saves = blogActivity?.total_saves || 0;
  const total_comments = blogActivity?.total_comments || 0;
  const author_username = author?.username || "Unknown";

  let {
    userAuth: { username, access_token },
  } = userContext;

  // const handleLike = () => {
  //   if (access_token) {
  //     setLikeByUser((preVal) => !preVal);
  //     !islikedByUser ? total_likes++ : total_likes--;
  //     setBlog({ ...blog, activity: { ...activity, total_likes } });
  //     console.log(islikedByUser);
  //   } else {
  //     toast.error("กรุณาเข้าสู่ระบบก่อนไลค์บล็อก");
  //   }
  // };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (access_token) {
      axios
        .post(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/isliked-by-user`,
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setLikeByUser(Boolean(result));
        })
        .catch((err) => {
          console.log(err);
        });
        // ตรวจสอบสถานะการบันทึก (saved-blogs)
      axios
      .get( `${process.env.REACT_APP_API_ENDPOINT}/create-blog/saved-blogs`,{
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(({ data: { savedBlogs } }) => {
        const isSaved = savedBlogs.some((blog:any) => blog._id === _id);
        setSaveByUser(isSaved); // อัปเดตสถานะการบันทึก
      })
      .catch((err) => {
        console.log(err);
      });

    }
  }, []);

  const handleLike = () => {
    if (access_token) {
      setLikeByUser(!islikedByUser);

      const newTotalLikes = !islikedByUser ? total_likes + 1 : total_likes - 1;

      setBlog({
        ...blog,
        activity: {
          ...activity,
          total_likes: newTotalLikes,
          total_comments: activity?.total_comments || 0,
        },
      });

      axios
        .post(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/like-blog`,
          {
            _id,
            islikedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อนไลค์บล็อก");
    }
  };

  const handleSave = () => {
    if (access_token) {
      setSaveByUser(!issavedByUser);

      const newTotalSave = !issavedByUser ? total_saves + 1 : total_saves - 1;

      setBlog({
        ...blog,
        activity: {
          ...activity,
          total_saves: newTotalSave,
          total_comments: activity?.total_comments || 0,
        },
      });

      axios
        .post(
          `${process.env.REACT_APP_API_ENDPOINT}/create-blog/save-blog`,
          {
            _id,
            issavedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อนบันทึกบล็อก");
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="d-flex gap-2 justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <button
            className={
              "rounded-circle d-flex align-items-center justify-content-center " +
              (islikedByUser ? "liked" : "not-liked")
            }
            style={{
              width: "2.5rem",
              height: "2.5rem",
            }}
            onClick={handleLike}
          >
            {islikedByUser ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button className="m-0" style={{ color: "#494949" }} onClick={()=> setShowLikesModal(true)}>
            {total_likes}
          </button>

          <button
            onClick={() => setCommentWrapper((preVal) => !preVal)}
            className="rounded-circle d-flex align-items-center justify-content-center "
            style={{
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f0f0f1",
            }}
          >
            <FaRegCommentDots />
          </button>
          <p className="m-0" style={{ color: "#494949" }}>
            {total_comments}
          </p>

          <button
            className={
              "rounded-circle d-flex align-items-center justify-content-center " +
              (issavedByUser ? "saved" : "not-saved")
            }
            style={{
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f0f0f0",
            }}
            onClick={handleSave}
          >
            {issavedByUser ? <MdOutlineBookmark /> : <IoBookmarkOutline />}
          </button>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline text-purple"
              style={{
                color: "inherit",
              }}
            >
              แก้ไข
            </Link>
          ) : (
            ""
          )}
          <div className="m-0 published-detail">
            {/* Only show the "Report Issue" button if the current user is not the author */}
            {userId !== author?._id && (
              <button
                className="cursor-pointer bg-dark text-white p-2 rounded"
                onClick={() => handleShowReportModal(_id)}
              >
                <MdReport
                  style={{
                    fontSize: "22px",
                    marginRight: "0.4rem",
                    marginBottom: "2px",
                  }}
                />
                รายงานปัญหา
              </button>
            )}
          </div>
          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${topic}&url=${window.location.href}`}
            style={{
              color: "inherit",
            }}
          >
            <FaTwitter className="text-twitter" />
          </Link>
         
        </div>
      </div>
      {/* Report Modal */}
      <Modal
        show={showReportModal}
        onHide={handleCloseReportModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รายงานปัญหา</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Check
                type="radio"
                label="เนื้อหาไม่เหมาะสม"
                name="reportReason"
                value="เนื้อหาไม่เหมาะสม"
                onChange={(e) => setReportReason(e.target.value)}
                checked={reportReason === "เนื้อหาไม่เหมาะสม"}
              />
              <Form.Check
                type="radio"
                label="เนื้อหามีการกลั่นแกล้งหรือคุกคาม"
                name="reportReason"
                value="เนื้อหามีการกลั่นแกล้งหรือคุกคาม"
                onChange={(e) => setReportReason(e.target.value)}
                checked={
                  reportReason === "เนื้อหามีการกลั่นแกล้งหรือคุกคาม"
                }
              />
              <Form.Check
                type="radio"
                label="เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม"
                name="reportReason"
                value="เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม"
                onChange={(e) => setReportReason(e.target.value)}
                checked={
                  reportReason ===
                  "เนื้อหามีการขายหรือส่งเสริมสินค้าต้องห้าม"
                }
              />
              <Form.Check
                type="radio"
                label="ข้อมูลเท็จ"
                name="reportReason"
                value="ข้อมูลเท็จ"
                onChange={(e) => setReportReason(e.target.value)}
                checked={reportReason === "ข้อมูลเท็จ"}
              />
              <Form.Check
                type="radio"
                label="การแอบอ้างบุคคลอื่น"
                name="reportReason"
                value="การแอบอ้างบุคคลอื่น"
                onChange={(e) => setReportReason(e.target.value)}
                checked={reportReason === "การแอบอ้างบุคคลอื่น"}
              />
              <Form.Check
                type="radio"
                label="สแปม"
                name="reportReason"
                value="สแปม"
                onChange={(e) => setReportReason(e.target.value)}
                checked={reportReason === "สแปม"}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReportModal}>
            ยกเลิก
          </Button>
          <Button variant="danger" onClick={handleReportPost}>
            รายงานปัญหา
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Report Submitted Modal */}
      <Modal
        show={showReportSubmittedModal}
        onHide={() => setShowReportSubmittedModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>รายงานปัญหาสำเร็จ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          รายงานปัญหาของคุณได้รับการส่งเรียบร้อยแล้ว
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowReportSubmittedModal(false)}
          >
            ปิด
          </Button>
          <Button variant="primary" onClick={() => navigate("/dashboard/reportcheck")}>
            ดูการรายงาน
          </Button>
        </Modal.Footer>
      </Modal>

      <LikeModal
        isOpen={showLikesModal}
        onClose={()=>setShowLikesModal(false)}
        postId={_id || ""}
        accessToken={access_token || ""}
      />
      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;