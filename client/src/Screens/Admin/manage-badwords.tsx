import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Modal, Button } from "react-bootstrap";
import {
  addBadWordGroupAPI,
  deleteBadWordGroupAPI,
  fetchBadWordGroupsAPI,
  updateBadWordGroupAPI,
} from "../../api/badwordAPI";

const ManageBadwords: React.FC = () => {
  const [badwordGroups, setBadwordGroups] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [badWords, setBadWords] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadBadwordGroups = async () => {
      try {
        const fetchedGroups = await fetchBadWordGroupsAPI();
        if (Array.isArray(fetchedGroups)) {
          setBadwordGroups(fetchedGroups);
        } else {
          console.error("Fetched data is not an array");
        }
      } catch (error) {
        console.error("Failed to load bad word groups:", error);
      }
    };
    loadBadwordGroups();
  }, []);

  const handleAddBadWords = async (e: React.FormEvent) => {
    e.preventDefault();
    const wordsArray = badWords.split(",").map((word) => word.trim()).filter(word => word !== "");
    
    if (wordsArray.length === 0) {
      alert("กรุณากรอกคำหยาบอย่างน้อย 1 คำ");
      return;
    }

    try {
      const newGroup = await addBadWordGroupAPI(wordsArray);
      setBadwordGroups((prev) => [...prev, newGroup]);
      setBadWords("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding bad words:", error);
    }
  };

  const handleEditBadWords = (group: any) => {
    if (!group) return;
    setBadWords(group.words.join(", "));
    setEditingId(group._id);
    setShowEditModal(true);
  };

  const handleUpdateBadWords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const wordsArray = badWords.split(",").map((word) => word.trim()).filter(word => word !== "");

    if (wordsArray.length === 0) {
      alert("กรุณากรอกคำหยาบอย่างน้อย 1 คำ");
      return;
    }

    try {
      const updatedGroup = await updateBadWordGroupAPI(editingId, wordsArray);
      setBadwordGroups((prev) => prev.map((group) => (group._id === editingId ? updatedGroup : group)));
      setBadWords("");
      setEditingId(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating bad words:", error);
    }
  };

  const handleDeleteBadWords = async (id: string) => {
    try {
      await deleteBadWordGroupAPI(id);
      setBadwordGroups((prev) => prev.filter((group) => group._id !== id));
    } catch (error) {
      console.error("Error deleting bad words:", error);
    }
  };

  const confirmDeleteBadWords = (id: string) => {
    setGroupToDelete(id);
    setShowConfirmModal(true);
  };

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการคำหยาบ</h1>
        <div className="add-q add-badwords" onClick={() => setShowAddModal(true)}>
          <div>
            <IoMdAdd />
            <span>เพิ่มรายการคำหยาบ</span>
          </div>
        </div>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <h2>รายการ</h2>
          <div className="right">
            <div className="activity-analytics" style={{ marginTop: "0.5rem" }}>
              {badwordGroups.map((group) => (
                <div className="item" key={group._id}>
                  <div className="right">
                    <div className="info">
                      <h3>{group.words.join(", ")}</h3>
                    </div>
                    <div className="manage d-flex">
                      <div className="edit warning" onClick={() => handleEditBadWords(group)} style={{ paddingRight: "10px" }}>
                        <h3>แก้ไข</h3>
                      </div>
                      <div className="delete danger" onClick={() => confirmDeleteBadWords(group._id)}>
                        <h3>ลบ</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มรายการคำหยาบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            placeholder="คำหยาบ1, คำหยาบ2,... "
            value={badWords}
            onChange={(e) => setBadWords(e.target.value)}
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>ยกเลิก</Button>
          <Button variant="primary" onClick={handleAddBadWords}>บันทึก</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขรายการคำหยาบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            placeholder="คำหยาบ1,คำหยาบ2,..."
            value={badWords}
            onChange={(e) => setBadWords(e.target.value)}
            className="form-control"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>ยกเลิก</Button>
          <Button style={{ backgroundColor: "#7380ec", borderColor: "#7380ec", color: "white" }} onClick={handleUpdateBadWords}>บันทึก</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered >
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการลบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>คุณแน่ใจว่าต้องการลบรายการคำหยาบนี้หรือไม่?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>ยกเลิก</Button>
          <Button variant="danger" onClick={async () => { if (groupToDelete) { await handleDeleteBadWords(groupToDelete); setShowConfirmModal(false); }}}>ยืนยัน</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageBadwords;
