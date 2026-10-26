import { useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Dealers from "./components/Dealers/Dealers";
import Dealer from "./components/Dealers/Dealer";
import PostReview from "./components/Dealers/PostReview";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import "./App.css";

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const navigate = useNavigate();

  const handleLogin = (name) => {
    localStorage.setItem("username", name);
    setUsername(name);
  };

  const handleLogout = async () => {
    await fetch("/djangoapp/logout");
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="brand">Cars Dealership</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/postreview">Review Dealer</Link>
          {username ? (
            <>
              <span className="welcome">Logged in as <strong>{username}</strong></span>
              <button className="btn-small" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign-up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<Dealers />} />
          <Route path="/dealer/:id" element={<Dealer username={username} />} />
          <Route path="/postreview" element={<PostReview username={username} />} />
          <Route path="/postreview/:id" element={<PostReview username={username} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
