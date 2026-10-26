import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/djangoapp/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });
    const data = await res.json();
    if (res.ok && data.status === "Authenticated") {
      onLogin(userName);
      navigate("/");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>Username</label>
        <input value={userName} onChange={(e) => setUserName(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
