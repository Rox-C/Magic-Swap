import React, { useState } from 'react';
import './DetailCard.css';

export default function DetailCard({ item }) {
  const [reviews, setReviews] = useState(item.reviews || []);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });

  // 提交评价处理
// 修改DetailCard组件中的handleSubmit方法
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!newReview.content.trim()) return;

  try {
    // 调用父组件传递的提交方法
    const response = await fetch(`/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 实际项目需要添加认证头
      },
      body: JSON.stringify({
        itemId: item.id,       // 确保item prop包含id
        content: newReview.content,
        rating: newReview.rating,
        // 实际项目应从用户系统获取真实userId
        userId: "user-001"  
      })
    });

    if (!response.ok) throw new Error('提交失败');
    
    // 成功后更新前端状态
    const savedReview = await response.json();
    setReviews([savedReview, ...reviews]);
    setNewReview({ rating: 5, content: '' });

  } catch (error) {
    console.error('提交评价失败:', error);
    alert('评价提交失败，请重试');
  }
};

  return (
    <div className="detail-card">
      {/* 商品主内容区 */}
      <div className="fixed-layout">
        {/* 左侧图片区 */}
        <div className="media-section">
          <div className="main-image-frame">
            <img 
              src={`data:${item.imageTypes[0]};base64,${item.images[0]}`}
              alt={item.title}
              className="main-image"
            />
          </div>
        </div>

        {/* 右侧信息区 */}
        <div className="info-section">
          <h1 className="item-title">{item.title}</h1>
          <div className="price-box">￥{item.price}</div>
          
          <div className="desc-section">
            <h3>商品描述</h3>
            <div className="desc-content">
              {item.description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button className="edit-btn">
              {/* <img src="/icons/edit.png" alt="编辑" /> */}
              修改信息
            </button>
            <button className="wardrobe-btn">
              {/* <img src="/icons/wardrobe.png" alt="衣橱" /> */}
              加入衣橱
            </button>
          </div>

          {/* 嵌入式评价系统 */}
          <div className="review-panel">
            <h3>用户评价 ({reviews.length})</h3>
            
            <form onSubmit={handleSubmit} className="review-editor">
              <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < newReview.rating ? 'active' : ''}`}
                    onClick={() => setNewReview({...newReview, rating: i+1})}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                placeholder="写下您的真实体验..."
                className="review-input"
              />
              <button type="submit" className="submit-btn">
                发布评价
              </button>
            </form>

            <div className="review-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="user-info">
                  <img 
                  src={review.user?.avatar || '/default-avatar.png'} 
                  alt="用户头像"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                    e.target.classList.add('avatar-error');
                  }}
/>
                    <span>{review.user?.username || '匿名用户'}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-content">
                    <div className="rating">{"★".repeat(review.rating)}</div>
                    <p>{review.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}