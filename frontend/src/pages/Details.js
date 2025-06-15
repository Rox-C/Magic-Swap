// src/pages/Details.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams } from 'react-router-dom';
import DetailCard from '../components/DetailCard';

const API_BASE_URL = 'http://10.192.217.208:8080';

export default function Details() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Using useCallback for fetchReviews to stabilize its identity if passed as prop or used in useEffect dependency
  const fetchReviews = useCallback(async () => {
    if (!itemId) return;
    try {
      // Ensure this endpoint is correct for fetching reviews for a specific item
      const res = await fetch(`${API_BASE_URL}/api/reviews/item/${itemId}`, {
        headers: {
          // Authorization might be needed if reviews are protected
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        // No need to check for 401 here if reviews are public,
        // or handle it gracefully allowing item details to still show
        const errorData = await res.json().catch(() => ({ message: `获取评价失败: HTTP ${res.status} (无法解析响应体)` }));
        console.error('Review fetch error response data:', errorData);
        throw new Error(errorData.message || `获取评价失败: HTTP ${res.status}`);
      }
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      // Append review-specific errors, don't overwrite item errors
      setError(prevError => {
        const reviewErrorMessage = `恭喜发财`;
        if (prevError && !prevError.includes(reviewErrorMessage)) {
          return `${prevError}\n${reviewErrorMessage}`;
        }
        return reviewErrorMessage;
      });
    }
  }, [itemId]); // Dependency: itemId

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const fetchItemDetails = async () => {
      if (!itemId) {
        setError("未提供商品ID");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
          headers: {
            // Authorization might be needed if item details are protected
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error('商品未找到 (404)');
          throw new Error(`获取商品详情失败: HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log('Backend raw data for item detail:', data);

        // The spread operator ...data should include brief, details, etc.
        // if the backend sends them.
        setItem({
          ...data,
          image: data.image ? `data:image/jpeg;base64,${data.image}` : '/default-preview.jpg'
        });
      } catch (err) {
        console.error("Error fetching item details:", err);
        setError(prevError => {
          const itemErrorMessage = `商品详情加载错误: ${err.message}`;
          if (prevError && !prevError.includes(itemErrorMessage)) {
            return `${prevError}\n${itemErrorMessage}`;
          }
          return itemErrorMessage;
        });
      }
    };

    const fetchAllDetails = async () => {
      setLoading(true);
      setError(''); // Reset errors at the beginning of a full fetch
      await fetchItemDetails();
      await fetchReviews(); // Fetch reviews after item details
      setLoading(false);
    };

    fetchAllDetails();

  }, [itemId, fetchReviews]); // fetchReviews is now stable due to useCallback

  const handleReviewSubmitted = (newReview) => {
    // Add the new review to the top of the list
    setReviews(prevReviews => [newReview, ...prevReviews]);
    // Optionally, you could re-fetch all reviews to ensure consistency,
    // but optimistic update is usually preferred for responsiveness.
    // fetchReviews();
  };

  if (loading && !item) return <div className="loading-text">正在加载详情...</div>; // Show loading only if item isn't there yet
  
  // Display errors more granularly
  let itemError = null;
  let reviewError = null;
  if (error) {
    const errors = error.split('\n');
    errors.forEach(err => {
      if (err.includes("商品详情加载错误")) itemError = err;
      if (err.includes("评价加载错误")) reviewError = err;
    });
  }

  if (itemError && !item) return <div className="error-text">加载失败: {itemError}</div>;
  if (!item && !loading) return <div className="error-text">未找到商品信息或加载失败。</div>;

  return (
    <div className="details-page-container">
      {item && ( // Only render DetailCard if item is loaded
        <DetailCard
          item={item}
          reviews={reviews}
          onReviewSubmit={handleReviewSubmitted}
          isAuthenticated={isAuthenticated}
          itemId={itemId} // Pass itemId for review submission
          apiBaseUrl={API_BASE_URL}
        />
      )}
      {reviewError && ( // Display review loading error separately if item loaded
        <div className="error-text" style={{marginTop: '20px', textAlign: 'center'}}>
          {reviewError}
        </div>
      )}
      {/* Display general loading or item-specific error if item itself failed to load */}
      {loading && !item && <div className="loading-text">仍在加载商品详情...</div>}

    </div>
  );
}
