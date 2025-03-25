import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const UserStatsGraph = () => {
  const [userStats, setUserStats] = useState({
    email_users: 0,
    google_users: 0,
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/users/statistics`)
      .then((res) => res.json())
      .then((data) => setUserStats(data))
      .catch((err) => console.error(err));
  }, []);

  const data = [
    { name: "Email", users: userStats.email_users },
    { name: "Google", users: userStats.google_users },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="users" fill="#73c8ec" radius={[10, 10, 10, 10]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserStatsGraph;