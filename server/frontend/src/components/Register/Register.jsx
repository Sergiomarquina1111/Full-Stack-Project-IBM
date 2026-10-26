import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/djangoapp/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.status === "Authenticated") {
      onRegister(form.userName);
      navigate("/");
    } else {
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Sign-up</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>Username</label>
        <input name="userName" value={form.userName} onChange={handleChange} required />
        <label>First Name</label>
        <input name="firstName" value={form.firstName} onChange={handleChange} required />
        <label>Last Name</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        <button className="btn" type="submit">Register</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
