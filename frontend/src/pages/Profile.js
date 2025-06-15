import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';

// 新增转换函数
const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('图片转换失败:', error);
    return null;
  }
};
export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, defaultAvatar] = await Promise.all([
          fetch('http://10.192.217.208:8080/api/user', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          convertImageToBase64('/avator.png') // 使用public路径
        ]);
        if (!userResponse.ok) throw new Error('获取数据失败');
        
        const userData = await userResponse.json();
        
          
          setUserData({
            ...userData,
            avatar: userData.avatar 
              ? userData.avatar
              : defaultAvatar || '' // 双重保障
          });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="profile-container">
      <ProfileCard
        username={userData?.username}
        email={userData?.email}
        signature={userData?.signature || ''}
        description={userData?.description || ''}
        avatar={userData?.avatar || ''}
        isMerchant={userData?.isMerchant || false}
        onUpdate={(newData) => {
          setUserData(prev => ({ ...prev, ...newData }));
        }}
      />
    </div>
  );
}