import React, { useState, useEffect } from 'react';
import '../components/ItemCard.css';
// 假设你使用了 Font Awesome 图标库
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'; // 实心桃心
// import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'; // 空心桃心



export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoritedItems, setFavoritedItems] = useState(new Set());


  useEffect(() => {
    const fetchItems = async () => {
      try {
        const initialFavorites = JSON.parse(localStorage.getItem('favoritedItems')) || [];
        setFavoritedItems(new Set(initialFavorites));

        const res = await fetch('http://10.192.49.63:8080/api/home/items', { //
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` //
          }
        });

        if (!res.ok) throw new Error(`HTTP错误 ${res.status}`); //
        const data = await res.json(); //
        setItems(data.map(item => ({ //
          ...item,
          image: item.image ? `data:image/jpeg;base64,${item.image}` : '/default-preview.jpg' //
        })));
      } catch (err) {
        setError(err.message); //
      } finally {
        setLoading(false); //
      }
    };
    fetchItems();
  }, []);

  const handleFavorite = async (itemId) => {
    const isCurrentlyFavorited = favoritedItems.has(itemId);
    const newFavoritedItems = new Set(favoritedItems); //
    let apiEndpoint = '';
    let successMessage = '';
    let errorMessage = '';

    if (isCurrentlyFavorited) {
      // 尝试取消收藏
      apiEndpoint = 'http://10.192.49.63:8080/api/wardrobe/remove'; // **假设这是你的移除API**
      // 如果你的后端 'add' API 也能处理移除，可以继续使用它，但通常移除操作使用 DELETE 方法或不同的端点
      // method = 'DELETE'; // 如果是标准的 RESTful API，移除通常用 DELETE
      newFavoritedItems.delete(itemId);
      successMessage = '取消收藏成功！';
      errorMessage = '取消收藏失败';
    } else {
      // 尝试添加收藏
      apiEndpoint = 'http://10.192.49.63:8080/api/wardrobe/add'; //
      newFavoritedItems.add(itemId);
      successMessage = '收藏成功！';
      errorMessage = '收藏失败';
    }

    try {
      // 乐观更新UI (先更新界面，如果API失败再回滚)
      setFavoritedItems(newFavoritedItems);
      localStorage.setItem('favoritedItems', JSON.stringify(Array.from(newFavoritedItems)));

      const res = await fetch(apiEndpoint, {
        method: 'POST', // 或者 'DELETE' 如果你的移除API使用DELETE方法
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, //
          'Content-Type': 'application/json' //
        },
        body: JSON.stringify({ clothingId: itemId }) //
      });

      if (!res.ok) {
        // API调用失败，回滚UI更新
        setFavoritedItems(new Set(favoritedItems)); // 恢复到之前的状态
        localStorage.setItem('favoritedItems', JSON.stringify(Array.from(favoritedItems))); // 恢复localStorage
        throw new Error(errorMessage);
      }
      
      // API调用成功，UI已更新，可以给一个提示（可选，因为UI变化本身就是反馈）
      // alert(successMessage); // 可以考虑使用更优雅的提示方式，如toast notification

    } catch (err) {
      // API调用失败且已回滚UI，显示错误信息
      alert(err.message || errorMessage);
    }
  };

  if (loading) return <div className="loading-text">正在加载商品...</div>; //
  if (error) return <div className="error-text">加载失败: {error}</div>; //

  return (
    <div className="item-grid-container"> {/* */}
      <div className="item-grid"> {/* */}
        {items.map(item => {
          const isFavorited = favoritedItems.has(item.id);
          return (
            <div key={item.id} className="item-card"> {/* */}
              <div className="item-image"> {/* */}
                <img 
                  src={item.image} //
                  alt={item.title} //
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/default-preview.jpg'; //
                  }}
                />
              </div>
              <div className="item-content"> {/* */}
                <h3 className="item-title">{item.title}</h3> {/* */}
                <p className="item-brief">{item.brief}</p> {/* */}
                <div className="item-buttons"> {/* */}
                  <button className="item-button detail">详细</button> {/* */}
                  <button 
                    className={`item-button favorite ${isFavorited ? 'favorited' : ''}`}
                    onClick={() => handleFavorite(item.id)} //
                    // disabled={isFavorited} // 移除 disabled 属性，以便可以点击已收藏的按钮来取消收藏
                  >
                    {/* 可以使用图标库来显示不同的桃心状态 */}
                    {/* {isFavorited ? <FontAwesomeIcon icon={faHeartSolid} /> : <FontAwesomeIcon icon={faHeartRegular} />} */}
                    {isFavorited ? '已收藏' : '收藏'} {/* */}
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