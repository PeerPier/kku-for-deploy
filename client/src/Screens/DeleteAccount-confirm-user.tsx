import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const DeleteAccountModalUser: React.FC<{
  userId: string | null;
  show: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
}> = ({ userId, show, onClose, onDeleteSuccess }) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL =
    process.env.REACT_APP_API_ENDPOINT ||
    "https://kku-blog-server-ak2l.onrender.com";
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/profile/user/delete/${userId}`,
        {
          data: { password },
        }
      );

      if (response.data.message === "User deleted successfully") {
        setSuccessMessage("บัญชีของคุณถูกลบเรียบร้อยแล้ว!");
        setErrorMessage("");
        onDeleteSuccess();
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการลบบัญชี โปรดตรวจสอบรหัสผ่านของคุณ.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>ลบบัญชีผู้ใช้</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          คุณแน่ใจหรือไม่ที่จะลบบัญชีของคุณ? การกระทำนี้ไม่สามารถยกเลิกได้.
        </p>
        <Form>
          <Form.Group controlId="password">
            <Form.Label>กรุณากรอกรหัสผ่านของคุณเพื่อยืนยัน</Form.Label>
            <Form.Control
              type="password"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {successMessage && <p className="text-success">{successMessage}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount}>
          ลบบัญชี
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModalUser;
