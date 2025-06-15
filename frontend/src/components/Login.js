import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://10.192.217.208:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        try {
          const userToken = data.token; // 使用刚获取的token
          const wardrobeResponse = await fetch("http://10.192.217.208:8080/api/wardrobe", {
            headers: {
              'Authorization': `Bearer ${userToken}`
            }
          });

          if (wardrobeResponse.ok) {
            const wardrobeData = await wardrobeResponse.json();
            // 后端返回的 wardrobeData 结构通常是 { clothes: [{ id: '...', ... }] }
            // 我们需要提取所有衣物的ID列表
            const favoriteItemIds = wardrobeData.clothes.map(cloth => cloth.id);
            
            // 将收藏的衣物ID列表存入 localStorage，键名为 'favoritedItems'
            // Home.js 可能会使用更具体的键名（如 `favoritedItems_${userId}`），
            // 但这里按照要求存入 'favoritedItems'。Home.js 的逻辑会基于 userId 再次同步。
            localStorage.setItem('favoritedItems', JSON.stringify(favoriteItemIds));
          } else {
            // 获取衣橱数据失败，可以记录一个警告，但不应阻止用户登录流程
            console.warn("登录成功，但获取用户衣橱数据失败。本地收藏可能未立即同步。");
          }
        } catch (wardrobeError) {
          // 网络或其他错误导致获取衣橱数据失败
          console.error("登录成功后，获取衣橱数据时发生错误:", wardrobeError);
        }
        navigate("/");
      } else {
        const msg = await res.text();
        setError(msg || "登录失败");
      }
    } catch (err) {
      setError("网络错误");
    }
  };

  return (
    <div className="login-container">
      <div className="content-wrapper">
        <div className="welcome-section">
          <div className="brand-logo">
            <div className="logo logo-magic">Magic</div>
            <div className="logo logo-huanzhuang">换装</div>
          </div>
          <div className="slogan">AI一键换装平台</div>
        </div>
        <div className="form-section" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold'}}>
          <div className="form-title" style={{fontWeight: 'bold'}}>会员登录</div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-email" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold', marginBottom: '6px', display: 'block'}}>邮箱</label>
              <input
                id="login-email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-password" style={{fontFamily: 'SimSun, Songti SC, serif', fontWeight: 'bold', marginBottom: '6px', display: 'block'}}>密码</label>
              <input
                id="login-password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div > <button type="submit">登录</button> </div>
            
          </form>
          <div className="extra-links">
            <Link to="/register">立即注册</Link>
            <a href="#">忘记密码</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;