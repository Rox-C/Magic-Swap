import React from 'react';
import './ProfileCard.css';

function ProfileCard({ username, email, signature, description, avatar }) {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <img 
          src={avatar || ''}
          alt="用户头像"
          className="avatar"
        />
      </div>
      <div className="profile-info">
        <p><span className="font-label">用 户 名 </span><span className="font-content">{username || '未填写'}</span></p>
        <p><span className="font-label">邮    箱 </span><span className="font-content">{email || '未填写'}</span></p>
        <p><span className="font-label">个性签名 </span><span className="font-content">{signature || '此人还未填写个性签名'}</span></p>
        <p><span className="font-label">简   介 </span><span className="font-content">{description || '这个人很懒，这里什么都没有'}</span></p>
      </div>
      <div className="profile-actions">
        <button className="edit-button">编辑信息</button>
        <button className="logout-button">退出登录</button>
      </div>
    </div>
  );
}

export default ProfileCard;