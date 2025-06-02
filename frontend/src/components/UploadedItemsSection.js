import React from 'react';
import UploadedItemCard from './UploadedItemCard'; // 引入子组件

// 这个组件负责展示已上传物品的整个区域
export default function UploadedItemsSection({ items, isLoading, onDeleteItem }) {
  if (isLoading) {
    return (
      <div className="uploaded-items-section card-panel">
        <h2 className="section-title">已上传衣物</h2>
        <p>正在加载衣物列表...</p>
      </div>
    );
  }

  return (
    <div className="uploaded-items-section card-panel">
      <h2 className="section-title">已上传衣物 ({items.length})</h2>
      {items.length === 0 ? (
        <p>还没有上传任何衣物哦。</p>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <UploadedItemCard key={item.id} item={item} onDeleteItem={onDeleteItem}/>
          ))}
        </div>
      )}
    </div>
  );
}