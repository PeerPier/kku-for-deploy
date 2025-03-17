import "../../misc/adminHome.css";
import {  useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {  IoIosTime } from "react-icons/io";

import {
  fetchAdminProfile,
} from "../../api/adminProfile";
import { PiUsersThreeFill } from "react-icons/pi";
import { IoDocumentTextOutline } from "react-icons/io5";
import Form from "react-bootstrap/Form";
import axios from "axios";
import ReportDetailsModal from "./approve-modal";
import { Button } from "react-bootstrap";
import "chart.js/auto"; // สำหรับการใช้งาน Chart.js
import { useNavigate } from "react-router-dom";
export interface Report {
  _id: string;
  reason: string;
  verified: boolean;
  status: string;
  createdAt: string;
  reportedBy: {
    _id: string;
    fullname: string;
  };
  post: {
    _id: string;
    author: {
      _id: string;
      fullname: string;
      banner: string;
      profile_picture: string;
    };
    content: [
      {
        time: number;
        blocks: [
          {
            id: string;
            type: string;
            data: {
              text: string;
            };
          }
        ];
        version: string;
      }
    ];
    image: string;
    topic: string;
    detail: string;
    tags: string[];
    banner: string;
    publishedAt: string;
    contentWithImages: {
      content: string;
      images?: string[];
    }[];
  };
}

interface MonthData {
  month: string;
  publishedAt: number;
}

const ManageReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { adminId } = useParams<{ adminId: string }>();
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
  const adminUsername = sessionStorage.getItem("userId");
  const [adminProfile, setAdminProfile] = useState<any>(true);
  const [getView, setGetView] = useState<any>();
  const [selectedCate, setSelectedCate] = useState<string>("dashboard");
  const [selectedBlog, setSelectedBlog] = useState<string>("blog-all");
  const [selectedApprove, setSelectedApprove] =
    useState<string>("blog-success");
  const [reports, setReports] = useState<Report[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [ setUsers] = useState<any>([]);
  const [setAllUsers] = useState<any>([]);
  const [monthsPost, setMonthsPost] = useState<MonthData[]>([]);
  const [title, setTitle] = useState("Dashboard"); // เพิ่มเติม: สร้าง state สำหรับเปลี่ยน title ของหน้าเว็บ

  const handleShowModal = (report: any) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const accessToken = user?.access_token;

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/login/auth`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("Authentication successful:", response.data);
      } catch (error) {
        sessionStorage.clear();
        console.error(error);
        navigate("/admin/login");
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/report`);
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseUser = await axios.get(
          `${API_BASE_URL}/profile/within24hour`
        );
        const responseAllUser = await axios.get(`${API_BASE_URL}/profile`);
        setUsers(responseUser.data);
        setAllUsers(responseAllUser.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const profileData = await fetchAdminProfile(id);
          setAdminProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchData();
  }, [id]);

  
  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/report`);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/views`);
        setGetView(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchViews();
  }, []);

  const handleTableSelection = (Table: string) => {
    setSelectedBlog(Table);
  };

  const refreshReports = () => {
    fetchReports();
  };

  const countVerifiedReports = (reports: Report[]): number => {
    return reports.reduce(
      (count, report) => (!report.verified ? count + 1 : count),
      0
    );
  };

  const countNoVerifiedReports = (reports: Report[]): number => {
    return reports.reduce(
      (count, report) => (report.verified ? count + 1 : count),
      0
    );
  };



  return (
    <div className="average">
    <div className="main1">
      <h2
        style={{
          fontSize: "1.8rem",
          fontWeight: "800",
          marginTop: "2rem",
        }}
      >
        จัดการบล็อก
      </h2>
      <div className="insights">
        <div
          className="blogpost-all"
          onClick={(e) => {
            e.preventDefault();
            handleTableSelection("blog-all");
          }}
        >
          <IoDocumentTextOutline className="svg3" />

          <div className="middle">
            <div className="left">
              <h3>บล็อกที่รายงานทั้งหมด</h3>
              <h1>{reports.length}</h1>
            </div>
          </div>
        </div>
        <div
          className="view-all"
          onClick={(e) => {
            e.preventDefault();
            handleTableSelection("blog-wait");
          }}
        >
          <IoIosTime className="svg2" />
          <div className="middle">
            <div className="left">
              <h3>รอตรวจสอบ</h3>
              <h1>{countVerifiedReports(reports)}</h1>
            </div>
          </div>
        </div>

        <div
          className="user-all"
          onClick={(e) => {
            e.preventDefault();
            handleTableSelection("blog-success");
          }}
        >
          <PiUsersThreeFill className="svg1" />
          <div className="middle">
            <div className="left">
              <h3>ตรวจสอบแล้ว</h3>
              <h1>{countNoVerifiedReports(reports)}</h1>
            </div>
          </div>
        </div>
      </div>

      {selectedBlog === "blog-all" && (
        <div
          className="recent-order"
          style={{
            overflowY: "auto", // เพิ่ม scrollbar เมื่อเนื้อหามากเกินไป
            maxHeight: "400px", // กำหนดความสูงสูงสุดของ div
            marginTop: "10px",
            borderRadius: "2rem",
          }}
        >
          <table>
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#fff",
                zIndex: 1,
              }}
              className="pt-5"
            >
              <tr>
                <th>ผู้รายงาน</th>
                <th>วันที่</th>
                <th>หัวข้อการรายงาน</th>
                <th>สถานะ</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>

            {adminProfile && (
              <tbody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report._id}>
                      <td>
                        {report.reportedBy
                          ? report.reportedBy.fullname
                          : ""}
                      </td>
                      <td>
                        {new Date(
                          report.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td>{report.reason || "No Title"}</td>
                      <td
                        className="warning"
                        style={{
                          color:
                            report.status === "Approved"
                              ? "#44ab89"
                              : report.status === "Pending"
                              ? "black"
                              : report.status === "Cancel"
                              ? "orange"
                              : "#ff7782",
                        }}
                      >
                        {report.status === "Approved"
                          ? "อนุญาติให้อยู่บนเว็บไซต์"
                          : report.status === "Pending"
                          ? "รอดำเนินการ"
                          : report.status === "Cancel"
                          ? "ผู้ใช้ลบบล็อกหรือยกเลิกรายงาน"
                          : "ไม่อนุญาติให้อยู่บนเว็บไซต์"}
                      </td>

                      <td className="primary">
                        <Button
                          variant="info"
                          onClick={() => handleShowModal(report)}
                          disabled={report.status !== "Pending"}
                          style={{
                            opacity:
                              report.status === "Pending" ? 1 : 0.5, // ✅ ทำให้ปุ่มซีดแทนการหายไป
                            cursor:
                              report.status === "Pending"
                                ? "pointer"
                                : "not-allowed",
                          }}
                        >
                          รายละเอียด
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>ไม่มีการรายงาน</td>
                  </tr>
                )}
              </tbody>
            )}
          </table>

          {/* Report Details Modal */}
          {selectedReport && (
            <ReportDetailsModal
              showModal={showModal}
              handleClose={handleCloseModal}
              report={selectedReport}
              refreshReports={refreshReports}
            />
          )}
        </div>
      )}

      {selectedBlog === "blog-wait" && (
        <div
          className="recent-order"
          style={{
            overflowY: "scroll",
            maxHeight: "400px",
            margin: "0",
            borderRadius: "2rem",
          }}
        >
          <table>
            <thead className="pt-5">
              <tr>
                <th>ผู้รายงาน</th>
                <th>วันที่</th>
                <th>หัวข้อการรายงาน</th>
                <th>สถานะ</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            {adminProfile && (
              <tbody>
                {reports.length > 0 ? (
                  reports.map((report) =>
                    !report.verified ? (
                      <tr key={report._id}>
                        <td>
                          {report.reportedBy
                            ? report.reportedBy.fullname
                            : ""}
                        </td>
                        <td>
                          {new Date(
                            report.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td>{report.reason || "No Title"}</td>
                        <td
                          className="warning"
                          style={{
                            color:
                              report.status === "Approved"
                                ? "#44ab89"
                                : report.status === "Pending"
                                ? "black"
                                : report.status === "Cancel"
                                ? "orange"
                                : "#ff7782",
                          }}
                        >
                          {report.status === "Approved"
                            ? "อนุญาติให้อยู่บนเว็บไซต์"
                            : report.status === "Pending"
                            ? "รอดำเนินการ"
                            : report.status === "Cancel"
                            ? "ผู้ใช้ลบบล็อกหรือยกเลิกรายงาน"
                            : "ไม่อนุญาติให้อยู่บนเว็บไซต์"}
                        </td>

                        <td className="primary">
                          <Button
                            variant="info"
                            onClick={() => handleShowModal(report)}
                            disabled={report.verified ? true : false}
                          >
                            รายละเอียด
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      <></>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={5}>ไม่มีการรายงาน</td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
          {/* Report Details Modal */}
          {selectedReport && (
            <ReportDetailsModal
              showModal={showModal}
              handleClose={handleCloseModal}
              report={selectedReport}
              refreshReports={refreshReports}
            />
          )}
        </div>
      )}

      {selectedBlog === "blog-success" && (
        <div
          className="recent-order"
          style={{
            overflowY: "scroll",
            maxHeight: "400px",
            margin: "0",
            borderRadius: "2rem",
          }}
        >
          <div
            className="selectBlogCate"
            style={{
              marginLeft: "2rem",
              position: "fixed",
            }}
          >
            <Form>
              {["radio"].map((type) => (
                <div key={`inline-${type}`}>
                  <Form.Check
                    inline
                    label="Approve"
                    style={{ color: "#41f1b6" }}
                    name="group1"
                    type="radio"
                    id={`inline-${type}-1`}
                    onChange={() =>
                      setSelectedApprove("blog-success")
                    }
                    checked={selectedApprove === "blog-success"}
                  />
                  <Form.Check
                    inline
                    label="Decline"
                    style={{ color: "#ff7782" }}
                    name="group1"
                    type="radio"
                    id={`inline-${type}-2`}
                    onChange={() =>
                      setSelectedApprove("blog-decline")
                    }
                    checked={selectedApprove === "blog-decline"}
                  />
                  <Form.Check
                    inline
                    label="Cancel"
                    style={{ color: "#ff7782" }}
                    name="group1"
                    type="radio"
                    id={`inline-${type}-3`}
                    onChange={() => setSelectedApprove("blog-cancel")}
                    checked={selectedApprove === "blog-cancel"}
                  />
                </div>
              ))}
            </Form>
          </div>
          <div>
            {selectedApprove === "blog-success" && (
              <table>
                <thead className="pt-5">
                  <tr>
                    <th>ผู้รายงาน</th>
                    <th>วันที่</th>
                    <th>หัวข้อการรายงาน</th>
                    <th>สถานะ</th>
                    <th>รายละเอียด</th>
                  </tr>
                </thead>
                {adminProfile && (
                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((report) =>
                        report.verified &&
                        report.status === "Approved" ? (
                          <tr key={report._id}>
                            <td>
                              {report.reportedBy
                                ? report.reportedBy.fullname
                                : ""}
                            </td>
                            <td>
                              {new Date(
                                report.createdAt
                              ).toLocaleDateString()}
                            </td>
                            <td>{report.reason || "No Title"}</td>
                            <td
                              className="warning"
                              style={{
                                color:
                                  report.status === "Approved"
                                    ? "#44ab89"
                                    : report.status === "Pending"
                                    ? "black"
                                    : report.status === "Cancel"
                                    ? "orange"
                                    : "#ff7782",
                              }}
                            >
                              {report.status === "Approved"
                                ? "อนุญาติให้อยู่บนเว็บไซต์"
                                : report.status === "Pending"
                                ? "รอดำเนินการ"
                                : report.status === "Cancel"
                                ? "ผู้ใช้ลบบล็อกหรือยกเลิกรายงาน"
                                : "ไม่อนุญาติให้อยู่บนเว็บไซต์"}
                            </td>

                            <td className="primary">
                              <Button
                                variant="info"
                                onClick={() =>
                                  handleShowModal(report)
                                }
                                disabled={
                                  report.verified ? true : false
                                }
                              >
                                รายละเอียด
                              </Button>
                            </td>
                          </tr>
                        ) : (
                          <></>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan={5}>ไม่มีการรายงาน</td>
                      </tr>
                    )}
                  </tbody>
                )}
              </table>
            )}
          </div>

          {selectedApprove === "blog-decline" && (
            <table>
              <thead className="pt-5">
                <tr>
                  <th>ผู้รายงาน</th>
                  <th>วันที่</th>
                  <th>หัวข้อการรายงาน</th>
                  <th>สถานะ</th>
                  <th>รายละเอียด</th>
                </tr>
              </thead>
              {adminProfile && (
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report) =>
                      report.status === "Declined" ? (
                        <tr key={report._id}>
                          <td>
                            {report.reportedBy
                              ? report.reportedBy.fullname
                              : ""}
                          </td>
                          <td>
                            {new Date(
                              report.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td>{report.reason || "No Title"}</td>
                          <td className="warning">ปฏิเสธ</td>
                          <td className="primary">
                            <Button
                              variant="info"
                              onClick={() => handleShowModal(report)}
                              disabled={
                                report.verified ? true : false
                              }
                            >
                              รายละเอียด
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        <></>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={5}>ไม่มีการรายงาน</td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          )}

          {selectedApprove === "blog-cancel" && (
            <table>
              <thead className="pt-5">
                <tr>
                  <th>ผู้รายงาน</th>
                  <th>วันที่</th>
                  <th>หัวข้อการรายงาน</th>
                  <th>สถานะ</th>
                  <th>รายละเอียด</th>
                </tr>
              </thead>
              {adminProfile && (
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report) =>
                      report.status === "Cancel" ? (
                        <tr key={report._id}>
                          <td>
                            {report.reportedBy
                              ? report.reportedBy.fullname
                              : ""}
                          </td>
                          <td>
                            {new Date(
                              report.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td>{report.reason || "No Title"}</td>
                          <td className="warning">
                            โพสต์ถูกลบ/ยกเลิกรายงาน
                          </td>
                          <td className="primary">
                            <Button
                              variant="info"
                              onClick={() => handleShowModal(report)}
                              disabled={
                                report.verified ? true : false
                              }
                            >
                              รายละเอียด
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        <></>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={5}>ไม่มีการรายงาน</td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          )}
        </div>
      )}
    </div>
  </div>

  );
};

export default ManageReport;
