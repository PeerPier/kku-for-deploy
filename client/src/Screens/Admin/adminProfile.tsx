import "../../misc/adminProfile.css";
import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import backArrow from "../../pic/go-back.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import Pro from "../../pic/start1.jpg";
import axios from "axios";
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

interface AdminData {
    firstname: string;
    lastname: string;
    email: string;
    tel: string;
}

const AdminProfile: React.FC = () => {
    const { adminId } = useParams<{ adminId: string }>();
    const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT;
    const adminUsername = sessionStorage.getItem("userId");
    const [adminProfile, setAdminProfile] = useState<any>(true);
    const [selectedCate, setSelectedCate] = useState<string>("admin-profile"); // เพิ่มเติม: สร้าง selectedCate สำหรับเปลี่ยน cate ของหน้าเว็บ เปลี่ยนให้ defualt เป็น admin-profile
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("admin-profile"); // เพิ่มเติม: สร้าง state สำหรับเปลี่ยน title ของหน้าเว็บ เปลี่ยนให้ defualt เป็น profile
    const [activeTab, setActiveTab] = useState("login-history");
    const [adminData, setAdminData] = useState<AdminData>({
        firstname: "",
        lastname: "",
        email: "",
        tel: ""
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleShowModal = (report: any) => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
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
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log("Authentication successful:", response.data);
            } catch (error) {
                sessionStorage.clear();
                console.error(error);
                navigate("/admin/login");
            }
        };

        fetchData();
    }, [navigate, API_BASE_URL]);

    useEffect(() => {
        const themToggler = document.querySelector(".theme-toggler");

        if (themToggler) {
            const changeTheme = () => {
                document.body.classList.toggle("dark-theme-variables");

                themToggler?.querySelector("svg:nth-child(1)")?.classList.toggle("active");
                themToggler?.querySelector("svg:nth-child(2)")?.classList.toggle("active");
            };

            themToggler.addEventListener("click", changeTheme);

            return () => {
                themToggler.removeEventListener("click", changeTheme);
            };
        }
    }, [selectedCate]);

    // เพิ่มเติม: เมื่อเลือกหมวดหมู่ต่างๆ ค่า selectedCate จะเปลี่ยน และ title ของหน้าเว็บจะเปลี่ยนตามทันที
    useEffect(() => {
        if (selectedCate === "dashboard") {
            setTitle("Dashboard");
        } else if (selectedCate === "average") {
            setTitle("จัดการบล็อก");
        } else if (selectedCate === "manage-q") {
            setTitle("จัดการคำถาม");
        } else if (selectedCate === "manage-user") {
            setTitle("จัดการบัญชีผู้ใช้");
        } else if (selectedCate === "manage-cate") {
            setTitle("จัดการหมวดหมู่");
        } else if (selectedCate === "manage-badwords") {
            setTitle("จัดการคำหยาบ");
        } else if (selectedCate === "admin-profile") {
            setTitle("Admin");
        }
    }, [selectedCate]);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const response = await axios.get(`${API_BASE_URL}/admin/${adminId}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`
                    }
                });
                setAdminData(response.data);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };
        fetchAdminData();
    }, [adminId, API_BASE_URL]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdminData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem("user") || "{}");
            const token = user.access_token;

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.put(`${API_BASE_URL}/admin/${adminId}`, adminData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setIsEditing(false);
                alert("Profile updated successfully");
            }
        } catch (error: any) {
            console.error("Error updating admin data:", error);
            alert(error.response?.data?.message || "Failed to update profile");
        }
    };

    return (
        <div className="adminProfile">
            <div className="admin-dashboard-container">
                <div className="main-content">
                    <div className="header">
                        <div className="header-content">
                            <div className="admin-profile-header">
                                <div
                                    className="back-arrow"
                                    onClick={() => {
                                        navigate(-1); // เพิ่มเติม:เมื่อคลิก back-arrow จะกลับไปหน้าก่อนหน้า
                                    }}
                                >
                                    <img src={backArrow} alt="" />
                                </div>
                                {/* เพิ่มเติม: title ให้เป็น Dynamic */}
                                <h1>{title}</h1>
                            </div>
                            {/* เพิ่มเติม: profile-theme เป็นส่วนของ profile เเละ theme */}
                            <div className="profile-theme">
                                <div className="right">
                                    <div className="top">
                                        <div
                                            className="back-arrow-phone"
                                            onClick={() => {
                                                navigate(-1); // เพิ่มเติม:เมื่อคลิก back-arrow จะกลับไปหน้าก่อนหน้า
                                            }}
                                        >
                                            <img src={backArrow} alt="" />
                                        </div>
                                        <div className="theme-toggler">
                                            <MdLightMode className="active" />
                                            <MdDarkMode />
                                        </div>

                                        {adminProfile && (
                                            <div
                                                className="profile"
                                                onClick={() => {
                                                    setSelectedCate("admin-profile");
                                                    navigate(`/admin/${adminId}/profile`); // เพิ่มเติม:เมื่อคลิก profile จะไปหน้า profile
                                                }}
                                            >
                                                <div className="info">
                                                    <p>
                                                        Hello, <b>{adminUsername}</b>
                                                    </p>
                                                    <small className="text-muted1">
                                                        {adminUsername}
                                                    </small>
                                                </div>
                                                <div className="profile-photo">
                                                    <img src={Pro} alt="Profile" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* เพิ่มเติม: ส่วนของตารางข้อมูล */}
                    <div className="content-area">
                        <div className="user-profile-section">
                            {/* เพิ่มเติม: ส่วนการกรอก from  */}
                            <div className="profile-form">
                                <div className="form-fields">
                                    <div className="input-group-profile">
                                        <label>Firstname</label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            placeholder="Firstname"
                                            className="form-input"
                                            value={adminData.firstname}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                        <label>Lastname</label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            placeholder="Lastname"
                                            className="form-input"
                                            value={adminData.lastname}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            className="form-input"
                                            value={adminData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                        <label>Tel</label>
                                        <input
                                            type="tel"
                                            name="tel"
                                            placeholder="Tell"
                                            className="form-input"
                                            value={adminData.tel}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="action-buttons">
                                        {isEditing ? (
                                            <>
                                                <button className="edit-btn" onClick={handleUpdate}>
                                                    บันทึก
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    ยกเลิก
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="change-password-btn"
                                                    onClick={() => {}}
                                                >
                                                    เปลี่ยนรหัสผ่าน
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* เพิ่มเติม: ส่วนของ tab เลือกว่าจะดูข้อมมูลไหน มี  login history  เเละ   admin profile  */}
                            <div className="profile-tabs">
                                <div className="tabs">
                                    {/* 
                    เพิ่มเติม: สร้าง tab-btn สำหรับเปลี่ยน tab ของหน้าเว็บ 
                    เมื่อคลิก tab จะเปลี่ยน activeTab ให้เป็นค่าของ tab นั้นๆ
                  */}
                                    <button
                                        className={`tab-btn ${
                                            activeTab === "login-history" ? "active" : ""
                                        }`}
                                        onClick={() => handleTabClick("login-history")}
                                    >
                                        ประวัติการเข้าสู่ระบบ
                                    </button>
                                    <button
                                        className={`tab-btn ${
                                            activeTab === "edit-admin-profile" ? "active" : ""
                                        }`}
                                        onClick={() => handleTabClick("edit-admin-profile")}
                                    >
                                        แก้ไขแอดมิน
                                    </button>
                                </div>
                                {/* ตาราง login history */}
                                {activeTab === "login-history" && (
                                    <div className="tab-content">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>วันที่</th>
                                                    <th>ชื่อบัญชีผู้ใช้</th>
                                                    <th>อีเมล</th>
                                                    <th>เวลาที่เข้าสู่ระบบ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>10/14/2024</td>
                                                    <td>chalita sakaeww</td>
                                                    <td>chalita.sak@gmail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                                <tr>
                                                    <td>10/15/2024</td>
                                                    <td>chalita sakaew</td>
                                                    <td>chalita.sak@kkumail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                                <tr>
                                                    <td>10/15/2024</td>
                                                    <td>peer</td>
                                                    <td>pzgpl2@gmail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                                <tr>
                                                    <td>10/18/2024</td>
                                                    <td>teerawut sungkagaro</td>
                                                    <td>trwfs00@mailinator.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                                <tr>
                                                    <td>10/18/2024</td>
                                                    <td>teerawut sungkagaro</td>
                                                    <td>trw.designstyle@gmail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                                <tr>
                                                    <td>10/19/2024</td>
                                                    <td>dog</td>
                                                    <td>dog@gmail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {/* ตาราง แก้ไข admin profile */}
                                {activeTab === "edit-admin-profile" && (
                                    <div className="tab-content">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>วันที่</th>
                                                    <th>ชื่อบัญชีผู้ใช้</th>
                                                    <th>อีเมล</th>
                                                    <th>เวลาที่เข้าสู่ระบบ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>10/14/2024</td>
                                                    <td>chalita sakaeww</td>
                                                    <td>chalita.sak@gmail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                                <tr>
                                                    <td>10/15/2024</td>
                                                    <td>chalita sakaew</td>
                                                    <td>chalita.sak@kkumail.com</td>
                                                    <td>20.00.32</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
