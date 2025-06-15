import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    try {
      const res = await fetch("http://10.192.217.208:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, avatar: "", signature: "", description: "" }),
      });
      if (res.ok) {
        setSuccess("注册成功，请登录");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        const msg = await res.text();
        setError(msg || "注册失败");
      }
    } catch (err) {
      setError("网络错误");
    }
  };

  return (
    <React.Fragment>
      <div className="register-container">
        <div className="form-section">
          <h2 className="form-title">注册新账号</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-username" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold', marginBottom: '6px', display: 'block'}}>用 户 名</label>
              <input
                type="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-email" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold', marginBottom: '6px', display: 'block'}}>邮        箱</label>
              <input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-password" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold', marginBottom: '6px', display: 'block'}}>密        码</label>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-confirm-password" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold', marginBottom: '6px', display: 'block'}}>确认密码</label>
              <input
                type="password"
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">注册</button>
          </form>
          <div className="extra-links" style={{textAlign: 'left', marginTop: '16px'}}>
            已有账号？<Link to="/login">登录</Link>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, borderRadius: 8 }}>
        已有账号？<Link to="/login">登录</Link>
      </div>
      <div className="message">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </React.Fragment>
  );
}

export default Register;