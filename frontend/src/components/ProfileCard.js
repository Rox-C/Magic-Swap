import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import './ProfileCard.css';

function ProfileCard({ username, email, signature, description, avatar, isMerchant, onUpdate }) {
  // 原始状态保留
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [merchantLoading, setMerchantLoading] = useState(false);
  
  // 新增编辑相关状态
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState({});
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // 进入编辑模式
  const handleEditClick = () => {
    setEditMode(true);
    setTempData({
      username: username || '',
      signature: signature || '',
      description: description || ''
    });
  };

  // 保存修改
  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = {
        username: tempData.username,
        signature: tempData.signature,
        description: tempData.description
      };

      // 处理头像裁剪
      if (editorRef.current) {
        const canvas = editorRef.current.getImageScaledToCanvas();
        updates.avatar = canvas.toDataURL(); // 包含完整base64前缀
        // updates.avatar = fullBase64.split(',')[1]; 
      }

      const response = await fetch('http://10.192.217.208:8080/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失败');
      }

      const updatedUser = await response.json();
      onUpdate(updatedUser);
      setEditMode(false);
      setAvatarEditorOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 打开头像编辑器
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarEditorOpen(true);
    }
  };

  // 错误消息处理（保留原有）
  const getErrorMessage = (error) => {
    if (error.name === 'AbortError') {
      return '请求超时，请检查网络连接';
    }
    if (error.message.includes('Failed to fetch')) {
      return '无法连接服务器，请确认：\n1. 后端服务已启动\n2. 端口号正确';
    }
    return error.message;
  };

  // 退出登录（保留原有）
  const handleLogout = () => {
    setLoading(true);
    setError('');
    fetch('http://10.192.217.208:8080/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('favoritedItems');
      window.location.href = '/login';
    })
    .catch(error => {
      setError('退出失败，请重试');
      console.error('退出失败:', error);
    })
    .finally(() => setLoading(false));
  };

  // 商铺注册（保留原有）
  const handleRegisterClick = async() => {
    try {
      const inputShopName = prompt('请输入您的店铺名称：');
      if (!inputShopName?.trim()) {
        setError('店铺名称不能为空');
        return;
      }
      // console.log('注册商铺名称:', inputShopName);
      setMerchantLoading(true);
      setError('');
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const response = await fetch('http://10.192.217.208:8080/api/merchant/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shopName: inputShopName })
        // signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        alert('正在注册商铺，请稍候...');
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP错误 ${response.status}`);
      }
  
      const updatedUser = await response.json();
      onUpdate(updatedUser);
      alert('注册成功！');
    } catch (error) {
      console.error('注册失败:', error);
      setError(getErrorMessage(error));
    } finally {
      setMerchantLoading(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarUpload}
          style={{ display: 'none' }}
        />
        <div 
          className="avatar-container"
          onClick={() => editMode && fileInputRef.current.click()}
        >
          <img
            src={avatar || ''}
            alt="用户头像"
            className="avatar"
            style={{ cursor: editMode ? 'pointer' : 'default' }}
          />
          {editMode && <div className="avatar-overlay">点击修改</div>}
        </div>

        {/* 头像编辑器模态框 */}
        {avatarEditorOpen && (
          <div className="avatar-editor-modal">
            <div className="editor-content">
              <AvatarEditor
                ref={editorRef}
                image={selectedFile}
                width={250}
                height={250}
                border={50}
                borderRadius={125}
                color={[255, 255, 255, 0.6]}
                scale={1.2}
              />
              <div className="editor-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setAvatarEditorOpen(false)}
                >
                  取消
                </button>
                <button 
                  className="save-button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? '保存中...' : '保存头像'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="profile-info">
        {editMode ? (
          <>
            <div className="edit-field">
              <label>用户名：</label>
              <input
                value={tempData.username}
                onChange={(e) => setTempData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
              />
            </div>
            <div className="edit-field">
              <label>个性签名：</label>
              <textarea
                value={tempData.signature}
                onChange={(e) => setTempData(prev => ({
                  ...prev,
                  signature: e.target.value
                }))}
              />
            </div>
            <div className="edit-field">
              <label>个人简介：</label>
              <textarea
                value={tempData.description}
                onChange={(e) => setTempData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
            </div>
          </>
        ) : (
          <>
            <p><span className="font-label">用 户 名 </span><span className="font-content">{username || '未填写'}</span></p>
            <p><span className="font-label">邮    箱 </span><span className="font-content">{email || '未填写'}</span></p>
            <p><span className="font-label">个性签名 </span><span className="font-content">{signature || '此人还未填写个性签名'}</span></p>
            <p><span className="font-label">简   介 </span><span className="font-content">{description || '这个人很懒，这里什么都没有'}</span></p>
          </>
        )}
      </div>

      <div className="profile-actions">
        {editMode ? (
          <>
            <button 
              className="save-button"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button 
              className="cancel-button"
              onClick={() => setEditMode(false)}
            >
              取消
            </button>
          </>
        ) : (
          <button 
            className="edit-button"
            onClick={handleEditClick}
          >
            编辑信息
          </button>
        )}
        
        <button 
          className="logout-button" 
          onClick={handleLogout} 
          disabled={loading}
        >
          {loading ? '退出中...' : '退出登录'}
        </button>
        
        {/* {!isMerchant && (
          <button 
            className="register-merchant-button"
            onClick={handleRegisterClick}
            disabled={merchantLoading}
          >
            {merchantLoading ? '注册中...' : '注册商铺'}
          </button>
        )} */}
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default ProfileCard;