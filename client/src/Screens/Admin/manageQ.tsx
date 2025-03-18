import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Modal, Button } from "react-bootstrap";
import { tools } from "../../components/tools.component";
import EditorJS from "@editorjs/editorjs";
import {
  addQuestionAPI,
  deleteQuestionAPI,
  fetchQuestionsAPI,
  updateQuestionAPI,
} from "../../api/manageQAPI";

const ManageQ: React.FC = () => {
  const id = sessionStorage.getItem("adminId");
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestionsAPI();
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions);
        } else {
          console.error("Fetched questions is not an array");
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    };

    loadQuestions();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      console.error("Admin ID is undefined");
      return;
    }
    try {
      const newQuestion = await addQuestionAPI(topic, answer, id);
      setQuestions((prev) => [...prev, newQuestion]);
      setTopic("");
      setAnswer("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleEditQuestion = (question: any) => {
    if (!question) {
      console.error("Question is null or undefined");
      return;
    }

    setTopic(question.topic);
    setAnswer(question.answer);
    setEditingId(question._id);
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    try {
      const updatedQuestion = await updateQuestionAPI(editingId, topic, answer);

      setQuestions((prev) =>
        prev.map((q) => (q._id === editingId ? updatedQuestion : q))
      );

      setTopic("");
      setAnswer("");
      setEditingId(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionAPI(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const confirmDeleteQuestion = (id: string) => {
    setQuestionToDelete(id);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    let addEditor: any;
    let editEditor: any;

    const initializeAddEditor = async () => {
      addEditor = new EditorJS({
        holder: "textEditor",
        tools: tools,
        placeholder: "Answer",
        onChange: async () => {
          try {
            const savedData = await addEditor.save();
            setAnswer(JSON.stringify(savedData));
          } catch (error) {
            console.error("Error saving editor content:", error);
          }
        },
      });
    };

    const initializeEditEditor = async () => {
      editEditor = new EditorJS({
        holder: "editTextEditor",
        tools: tools,
        placeholder: "Answer",
        data: answer ? JSON.parse(answer) : undefined,
        onChange: async () => {
          try {
            const savedData = await editEditor.save();
            setAnswer(JSON.stringify(savedData));
          } catch (error) {
            console.error("Error saving editor content:", error);
          }
        },
      });
    };

    if (showAddModal) {
      initializeAddEditor();
    }

    if (showEditModal) {
      initializeEditEditor();
    }

    return () => {
      if (addEditor) {
        addEditor.isReady
          .then(() => {
            addEditor.destroy();
          })
          .catch((error: any) => console.error("Error destroying add editor:", error));
      }

      if (editEditor) {
        editEditor.isReady
          .then(() => {
            editEditor.destroy();
          })
          .catch((error: any) => console.error("Error destroying edit editor:", error));
      }
    };
  }, [showAddModal, showEditModal]);

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการคำถาม</h1>


        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              display: "flex", // ใช้ flexbox เพื่อจัดตำแหน่ง
              justifyContent: "space-between", // ให้เนื้อหาทั้งหมดอยู่ห่างกัน
              alignItems: "center", // จัดให้อยู่กลางในแนวตั้ง
              marginBottom: "20px", // เพิ่มระยะห่างด้านล่าง
            }}
          >
            <h2 style={{ marginLeft: "2px" }}>รายการ</h2>
            <div
              className="add-q"
              onClick={() => setShowAddModal(true)}
              style={{
                display: "flex",
                alignItems: "center", // จัดให้อยู่กลางในแนวตั้ง
                backgroundColor: "#363949", // สีพื้นหลังของปุ่ม
                color: "white", // สีข้อความ
                padding: "5px 10px", // ขนาด padding ของปุ่ม
                borderRadius: "5px", // มุมโค้งของปุ่ม
                cursor: "pointer", // เปลี่ยนเคอร์เซอร์เป็น pointer เมื่อ hover
              }}
            >
              <IoMdAdd style={{ marginRight: "5px" }} /> {/* ระยะห่างจากไอคอน */}
              <span>เพิ่มคำถาม</span>
            </div>
          </div>

          <div className="right">
            <div className="activity-analytics" style={{ marginTop: "0.5rem" }}>
              {questions.map(
                (question) =>
                  question && (
                    <div className="item" key={question._id}>
                      <div className="right">
                        <div className="info">
                          <h3>{question.topic}</h3>
                        </div>
                        <div className="manage d-flex">
                          <div
                            className="edit warning"
                            onClick={() => handleEditQuestion(question)}
                            style={{ paddingRight: "10px" }}
                          >
                            <h3>แก้ไข</h3>
                          </div>
                          <div
                            className="delete danger"
                            onClick={() => confirmDeleteQuestion(question._id)}
                          >
                            <h3>ลบ</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มคำถาม</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: '400px' }}>
            <div>
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="form-control"
            />
            </div>
            <div
            id="textEditor"
            style={{
              border: "1px solid #ced4da",
              borderRadius: "4px",
              padding: "10px",
              minHeight: "400px",
              marginTop: '1rem',
            }}
            ></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
          <Button
            style={{ backgroundColor: "#7380ec", borderColor: "#7380ec", color: "white" }}
            onClick={handleAddQuestion}
          >
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>แก้ไขคำถามที่พบบ่อย</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div>
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="form-control"
            />
            <div
              id="editTextEditor"
              style={{
              border: "1px solid #ced4da",
              borderRadius: "4px",
              padding: "10px",
              minHeight: "400px",
              marginTop: "1rem",
              }}
            ></div>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            ยกเลิก
          </Button>
          <Button style={{ backgroundColor: "#7380ec", borderColor: "#7380ec", color: "white" }} onClick={handleUpdateQuestion}>
            บันทึก
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการลบ</Modal.Title>
        </Modal.Header>
        <Modal.Body>คุณแน่ใจว่าต้องการลบคำถามนี้หรือไม่?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            ยกเลิก
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (questionToDelete) {
                await handleDeleteQuestion(questionToDelete);
                setShowConfirmModal(false);
              }
            }}
          >
            ยืนยัน
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageQ;
