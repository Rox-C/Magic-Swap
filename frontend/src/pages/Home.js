import React, { useState, useEffect } from 'react';
import '../components/ItemCard.css';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/home/items', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) throw new Error(`HTTP错误 ${res.status}`);
        const data = await res.json();
        setItems(data.map(item => ({
          ...item,
          image: item.image ? `data:image/jpeg;base64,${item.image}` : '/default-preview.jpg'
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);
  const handleFavorite = async (itemId) => {
    try {
      const res = await fetch('http://localhost:8080/api/wardrobe/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clothingId: itemId })
      });
  
      if (!res.ok) throw new Error('收藏失败');
      
      // 简单提示即可
      alert('收藏成功！');
    } catch (err) {
      alert(err.message);
    }
  };
  
  // 按钮保持简单状态
  <button 
    className="item-button favorite"
    onClick={() => handleFavorite(item.id)}
  >
    加入收藏
  </button>
  if (loading) return <div className="loading-text">正在加载商品...</div>;
  if (error) return <div className="error-text">加载失败: {error}</div>;

  return (
    <div className="item-grid-container">
      <div className="item-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-image">
              <img 
                src={item.image} 
                alt={item.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-preview.jpg';
                }}
              />
            </div>
            <div className="item-content">
              <h3 className="item-title">{item.title}</h3>
              <p className="item-brief">{item.brief}</p>
              <div className="item-buttons">
                <button className="item-button detail">详细</button>
                <button 
                  className="item-button favorite"
                  onClick={() => handleFavorite(item.id)}
                >
                  {'收藏'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}