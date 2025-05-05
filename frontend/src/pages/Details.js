// // src/pages/Details.js
// import React, { useState, useEffect } from 'react';
// import DetailCard from '../components/DetailCard';

// export default function Details() {
//   const [itemData, setItemData] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // 实际API请求示例
//         const itemRes = await fetch(`/api/items/${itemId}`);
//         const reviewsRes = await fetch(`/api/items/${itemId}/reviews`);

//         if (!itemRes.ok || !reviewsRes.ok) throw new Error('数据加载失败');

//         const [item, reviews] = await Promise.all([
//           itemRes.json(),
//           reviewsRes.json()
//         ]);

//         setItemData(item);
//         setReviews(reviews);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return <div className="loading">商品加载中...</div>;
//   if (error) return <div className="error">错误: {error}</div>;

//   return (
//     <div className="details-container">
//       <DetailCard 
//         itemData={itemData}
//         reviews={reviews}
//       />
//     </div>
//   );
// }
// pages/Details.js
// 文档9 修改后的Details.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DetailCard from '../components/DetailCard';

export default function Details() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, reviewsRes] = await Promise.all([
          fetch(`/api/items/${itemId}`),
          fetch(`/api/reviews/item/${itemId}`)
        ]);

        if (!itemRes.ok) throw new Error('商品加载失败: ' + itemRes.status);
        if (!reviewsRes.ok) throw new Error('评价加载失败: ' + reviewsRes.status);

        const [itemData, reviewsData] = await Promise.all([
          itemRes.json(),
          reviewsRes.json()
        ]);

        setItem(itemData);
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const handleNewReview = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  if (loading) return <div className="loading">商品加载中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="details-page">
      <DetailCard 
        item={item} 
        reviews={reviews}
        itemId={itemId}
        onNewReview={handleNewReview}
      />
    </div>
  );
}