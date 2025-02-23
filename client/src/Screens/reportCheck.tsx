import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportDetailsModal from "../components/report-view-modal";
// Import the modal component

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

const ReportCheck: React.FC = () => {
  const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ฟังก์ชันเพื่อดึงข้อมูลรีพอร์ตจาก API
  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/report/by/${sessionStorage.getItem("userId")}`);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  // ฟังก์ชันลบรายงาน
  const handleCancelReport = async (reportId: string) => {
    try {
      const userData = sessionStorage.getItem("user");
      const token: string | null = userData ? JSON.parse(userData).access_token : null;

      if (!token) {
        console.error("No access token found");
      } else {
        await axios.patch(`${API_BASE_URL}/api/report/${reportId}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setReports((prevReports) =>
        prevReports.filter((report) => report._id !== reportId)
      );
      handleCloseModal(); // ปิด Modal หลังลบรายงาน
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  // ฟังก์ชันเพื่อแสดงรายละเอียดของรีพอร์ต
  const handleShowModal = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // ฟังก์ชันปิด Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  // ฟังก์ชันรีเฟรชรายงานหลังจากการดำเนินการ
  const refreshReports = () => {
    fetchReports(); // Refetch reports after an action (verify, delete, etc.)
  };

  // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อโหลดหน้าจอ
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      {selectedReport && (
        <ReportDetailsModal
          showModal={showModal}
          handleClose={handleCloseModal}
          report={selectedReport}
          refreshReports={refreshReports}
        />
      )}
      <div style={{ margin: "2% 2%", fontSize: "14px" }}>
        <h2>รายงานทั้งหมด</h2>
        <div
          style={{
            maxHeight: "500px", // ความสูงสูงสุดก่อนจะเลื่อน
            overflowY: "auto", // เพิ่ม scroll bar แนวตั้ง
            overflowX: "auto", // เพิ่ม scroll bar แนวนอน
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead
              style={{ position: "sticky", top: 0, backgroundColor: "#fff" }}
            >
              <tr>
                <th style={{ padding: "10px", textAlign: "center" }}>ผู้ที่ถูกรายงานโพสต์</th>
                <th style={{ padding: "10px", textAlign: "center" }}>เหตุผล</th>
                <th style={{ padding: "10px", textAlign: "center" }}>สถานะ</th>
                <th style={{ padding: "10px", textAlign: "center" }}>
                  วันที่รายงาน
                </th>
                <th style={{ padding: "10px", textAlign: "center" }}>
                  รายละเอียด
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px" }}>
                    {report.post.author.fullname}
                  </td>
                  <td style={{ padding: "10px" }}>{report.reason}</td>
                  <td style={{ padding: "10px" }}>{report.status == "Approved" ? "อนุมัติ" : report.status == "Pending" ? "รอดำเนินการ" : report.status == "Cancel" ? "โพสต์ถูกลบ/ยกเลิกรายงาน" : "ปฏิเสธ"}</td>
                  <td style={{ padding: "10px" }}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button
                      style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      onClick={() => handleShowModal(report)}
                    >
                      ดูรายละเอียด
                    </button>
                    {
                    report.status == "Pending"?
                    <button
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      onClick={() => handleCancelReport(report._id)}
                    >
                      ยกเลิก
                    </button>:
                     <button
                     disabled={true}
                     style={{
                       padding: "5px 10px",
                       backgroundColor: "#939393",
                       color: "white",
                       border: "none",
                       borderRadius: "4px",
                     }}
                   >
                     ยกเลิก
                   </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReportCheck;
