import React, { useState } from "react";
import { Button, Container, Typography, Box, Alert, AlertProps } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../misc/reset-password.css";
import InputBox from "../components/input.component";

type CustomAlertProps = AlertProps & { show: boolean; message: string };

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState<CustomAlertProps>({
    show: false,
    message: "",
    severity: "success"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG", email);
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email }),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(`เราได้ส่งลิงก์สําหรับตั้งค่ารหัสผ่านใหม่ไปยังอีเมล ${email}`);
          setAlert({
            show: true,
            message: `เราได้ส่งลิงก์สําหรับตั้งค่ารหัสผ่านใหม่ไปยังอีเมล ${email} รหัสอ้างอิง (${data.ref})`,
            severity: "success"
          });
        } else {
          toast.error(data.message);
        }
      })
      .catch((err) => toast.error("เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง"));
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",              // ใช้ Flexbox เพื่อจัดการตำแหน่ง
        justifyContent: "center",     // จัดกลางในแนวนอน
        alignItems: "center",         // จัดกลางในแนวตั้ง
        minHeight: "100vh",           // ทำให้ Container ใช้พื้นที่ทั้งหน้าจอ
        padding: "10px",              // กำหนดระยะห่างขอบ
        
      }}
    >
      <ToastContainer />
      <Box
        sx={{
          padding: "40px 20px",
          borderRadius: "8px",
          backgroundColor: "white",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
                    // เพิ่มเงาให้กับกล่องเพื่อความสวยงาม
        }}
      >
        <Typography variant="h4" component="h1" sx={{ marginBottom: "20px", fontWeight: "600" }}>
          ป้อนอีเมลของคุณ
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: "20px", color: "#6c757d" }}>
          ป้อนที่อยู่อีเมลที่เชื่อมต่อกับบัญชีของคุณ
          แล้วเราจะส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ให้แก่คุณ
        </Typography>

        {alert.show && (
          <Alert
            severity={alert.severity}
            sx={{ my: "24px", textAlign: "left", borderRadius: "8px" }}
          >
            {alert.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <InputBox
            name="email"
            type="email"
            id="email"
            placeholder="อีเมล"
            icon="MdOutlineMail"
            value={email}
            onChange={(e) => {setEmail(e.target.value);console.log(e.target.value)}}
            disabled={alert.show}
          />

          {alert.show ? (
            <Button
              variant="contained"
              fullWidth
              disableElevation
              onClick={() => {
                window.location.href = "https://kku-client.vercel.app/admin/login";
              }}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                textTransform: "none",
                padding: "10px 0",
                borderRadius: "50px",
                "&:hover": {
                  backgroundColor: "#181818"
                }
              }}
            >
              กลับไปหน้าหลัก
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                textTransform: "none",
                padding: "10px 0",
                borderRadius: "50px",
                "&:hover": {
                  backgroundColor: "#181818"
                }
              }}
            >
              ดำเนินการต่อ
            </Button>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
