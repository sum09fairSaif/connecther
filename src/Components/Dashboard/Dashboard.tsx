import React from "react";
import "./dashboard.css";

type User = {
  name: string;
  age: number;
  height: string;
};

const Dashboard = ({ user }: { user: User }) => {
  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>

      <div className="card">
        <p>Name: {user.name}</p>
        <p>Age: {user.age}</p>
        <p>Height: {user.height}</p>
      </div>
    </div>
  );
};

export default Dashboard;
