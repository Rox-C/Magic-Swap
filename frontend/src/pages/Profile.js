import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
        if (!response.ok) throw new Error('获取数据失败');
        const data = await response.json();
        setUserData(data);
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
      />
    </div>
  );
}