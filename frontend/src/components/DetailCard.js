// src/components/DetailCard.js
import React, { useState } from 'react';
import './DetailCard.css';

const DetailCard = ({ item, reviews, onReviewSubmit, isAuthenticated, itemId, apiBaseUrl }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState(''); // Renamed from 'comment' to 'commentText' for clarity
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (rate) => setRating(rate);
  const handleHoverRating = (rate) => setHoverRating(rate);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    if (!isAuthenticated) {
      setSubmitError('请先登录后再发表评价。');
      setIsSubmitting(false);
      return;
    }
    if (rating === 0) {
      setSubmitError('请选择评分。');
      setIsSubmitting(false);
      return;
    }
    if (!commentText.trim()) {
      setSubmitError('请输入评价内容。'); // This client-side check should catch it too
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    //  CORRECT PAYLOAD ACCORDING TO BACKEND Review.java
    const reviewPayload = {
      itemId: itemId, // itemId is already a string from useParams, matching Review.java
      rating: rating,
      content: commentText // CRITICAL: Changed 'comment' key to 'content' and use commentText state
    };

    console.log('Submitting review with payload:', JSON.stringify(reviewPayload));

    try {
      const response = await fetch(`${apiBaseUrl}/api/reviews`, { // Assuming this is the correct endpoint to POST a new review
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewPayload)
      });

      if (!response.ok) {
        let errorResponseMessage = `服务器响应 ${response.status}`;
        try {
            const errorData = await response.json();
            console.error('Review submission error response data (JSON):', errorData);
            if (errorData && errorData.message) {
                errorResponseMessage = errorData.message;
            } else if (errorData && errorData.error) { // Handle { "error": "message" } structure
                errorResponseMessage = errorData.error;
            } else if (errorData && errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                errorResponseMessage = errorData.errors.map(err => `${err.field ? err.field + ': ' : ''}${err.defaultMessage}`).join(', ');
            } else if (errorData && typeof errorData === 'object') {
                errorResponseMessage = JSON.stringify(errorData);
            }
        } catch (jsonError) {
            try {
                const errorText = await response.text();
                if (errorText) errorResponseMessage = errorText;
            } catch (textError) { /* Do nothing, stick with status code */ }
        }
        if (response.status === 401) {
            throw new Error('评价提交失败: 未授权或Token无效 (401)。请尝试重新登录。');
        }
        throw new Error(`评价提交失败: ${errorResponseMessage}`);
      }

      const newReview = await response.json();
      onReviewSubmit(newReview); // Call parent's handler to update review list
      setRating(0);
      setCommentText(''); // Clear commentText
      setHoverRating(0);
      setSubmitError(''); // Clear any previous error
    } catch (error) {
      console.error("提交评价错误 (catch block):", error);
      setSubmitError(error.message || '提交评价时发生未知错误，请稍后再试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) {
    return <div className="loading-text">商品信息加载中...</div>;
  }

  return (
    <div className="detail-card">
      <div className="detail-card-content">
        <div className="detail-image-container">
          <img
            src={item.image || '/default-preview.jpg'}
            alt={item.title}
            className="detail-item-image"
            onError={(e) => { e.target.onerror = null; e.target.src = '/default-preview.jpg'; }}
          />
        </div>
        <div className="detail-info">
          <h2 className="detail-item-title">{item.title}</h2>
          {/* CORRECTLY DISPLAY BRIEF AND DETAILS */}
          <p className="detail-item-category">
            简介: {item.brief || '暂无简介'}
          </p>
          <p className="detail-item-description">
            详细描述: {item.details || '暂无详细描述。'}
          </p>
        </div>
      </div>

      <div className="reviews-section">
        <h3>用户评价</h3>
        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <div className="form-group star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => handleHoverRating(star)}
                  onMouseLeave={() => handleHoverRating(0)}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <div className="form-group">
              <textarea
                id="commentText" // id matches state name
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写下你的评价..."
                rows="4"
              />
            </div>
            {submitError && <p className="error-text review-submit-error">{submitError}</p>}
            <button type="submit" className="submit-review-button" disabled={isSubmitting || rating === 0 || !commentText.trim()}>
              {isSubmitting ? '正在提交...' : '提交评价'}
            </button>
          </form>
        ) : (
          <p className="login-prompt">请<a href="/login">登录</a>后发表评价。</p>
        )}

        <div className="reviews-list">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => ( // Use review.id from backend as key
              <div key={review.id} className="review-item">
                <p className="review-author">
                  <strong>用户 {review.userId || review.user?.username || '匿名'}</strong>
                  {review.createdAt && (
                    <span className="review-date"> ({new Date(review.createdAt).toLocaleDateString()})</span>
                  )}
                </p>
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>&#9733;</span>
                  ))}
                </div>
                {/* USE review.content TO DISPLAY COMMENT TEXT */}
                <p className="review-comment">{review.content}</p>
              </div>
            ))
          ) : (
            <p>暂无评价。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailCard;
