// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. 导入 useNavigate
import '../components/ItemCard.css';
// 假设你使用了 Font Awesome 图标库 (如果实际未使用，可以移除)
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'; // 实心桃心
// import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'; // 空心桃心

export default function Home() {
  const navigate = useNavigate(); // 2. 获取 navigate 函数
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoritedItems, setFavoritedItems] = useState(new Set());

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const initialFavorites = JSON.parse(localStorage.getItem('favoritedItems')) || [];
        setFavoritedItems(new Set(initialFavorites));

        const res = await fetch('http://10.192.217.208:8080/api/home/items', {
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
    const isCurrentlyFavorited = favoritedItems.has(itemId);
    const newFavoritedItems = new Set(favoritedItems);
    let apiEndpoint = '';
    // let successMessage = ''; // successMessage 未被使用，可以移除
    let errorMessage = '';

    if (isCurrentlyFavorited) {
      apiEndpoint = 'http://10.192.217.208:8080/api/wardrobe/remove';
      newFavoritedItems.delete(itemId);
      // successMessage = '取消收藏成功！'; // 未被使用
      errorMessage = '取消收藏失败';
    } else {
      apiEndpoint = 'http://10.192.217.208:8080/api/wardrobe/add';
      newFavoritedItems.add(itemId);
      // successMessage = '收藏成功！'; // 未被使用
      errorMessage = '收藏失败';
    }

    try {
      setFavoritedItems(newFavoritedItems);
      localStorage.setItem('favoritedItems', JSON.stringify(Array.from(newFavoritedItems)));

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clothingId: itemId })
      });

      if (!res.ok) {
        setFavoritedItems(new Set(favoritedItems));
        localStorage.setItem('favoritedItems', JSON.stringify(Array.from(favoritedItems)));
        throw new Error(errorMessage);
      }
      // 成功后可以不显示 alert，UI变化已经是反馈
    } catch (err) {
      alert(err.message || errorMessage);
    }
  };

  if (loading) return <div className="loading-text">正在加载商品...</div>;
  if (error) return <div className="error-text">加载失败: {error}</div>;

  return (
    <div className="item-grid-container">
      <div className="item-grid">
        {items.map(item => {
          const isFavorited = favoritedItems.has(item.id);
          return (
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
                  {/* 3. 给“详细”按钮绑定 onClick 事件，并使用 navigate 函数 */}
                  <button
                    className="item-button detail"
                    onClick={() => navigate(`/details/${item.id}`)}
                  >
                    详细
                  </button>
                  <button
                    className={`item-button favorite ${isFavorited ? 'favorited' : ''}`}
                    onClick={() => handleFavorite(item.id)}
                  >
                    {/* 可以使用图标库来显示不同的桃心状态 */}
                    {/* {isFavorited ? <FontAwesomeIcon icon={faHeartSolid} /> : <FontAwesomeIcon icon={faHeartRegular} />} */}
                    {isFavorited ? '已收藏' : '收藏'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
