import React, { useState } from "react";

const NotiSettings: React.FC = () => {
  const [flightUpdates, setFlightUpdates] = useState(true);
  const [executiveProgram, setExecutiveProgram] = useState(true);

  return (
    <div
      style={{
        width: "600px",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
        color: "#333",
      }}
    >
      {[ 
        {
          title: "การแจ้งเตือนทั่วไป",
          subtitle: "Make sound",
          value: flightUpdates,
          setValue: setFlightUpdates,
        },
        {
          title: "การแจ้งเตือนผ่าน Gmail",
          subtitle: "No sound",
          value: executiveProgram,
          setValue: setExecutiveProgram,
        },
      ].map(({ title, subtitle, value, setValue }, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: index === 0 ? "1px solid #e0e0e0" : "none",
          }}
        >
          <div>
            <div style={{ fontSize: "16px" }}>{title}</div>
            <div style={{ fontSize: "12px", color: "#757575" }}>{subtitle}</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: "36px", height: "20px" }}>
            <input
              type="checkbox"
              checked={value}
              onChange={() => setValue(!value)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: value ? "#4CAF50" : "#ccc",
                transition: ".4s",
                borderRadius: "34px",
              }}
            />
            <span
              style={{
                position: "absolute",
                content: '""',
                height: "16px",
                width: "16px",
                left: value ? "18px" : "4px",
                bottom: "2px",
                backgroundColor: "white",
                transition: ".4s",
                borderRadius: "50%",
              }}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default NotiSettings;