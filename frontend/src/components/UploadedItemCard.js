import React from 'react';

// 这个组件负责展示单个已上传物品的卡片
export default function UploadedItemCard({ item, onDeleteItem }) {
  return (
    <div className="item-card">
      <div className="item-image-frame">
        <img
          src={item.imageUrl}
          alt={item.imageAlt || item.name}
          className="item-image"
          onError={(e) => {
            e.target.onerror = null; // 防止无限循环
            e.target.src = '[https://placehold.co/200x250/eee/aaa?text=Image+Error](https://placehold.co/200x250/eee/aaa?text=Image+Error)'; // 占位图
            e.target.alt = `图片加载失败: ${item.name || '未知物品'}`;
          }}
        />
      </div>
      <p className="item-name">{item.name}</p>
      {onDeleteItem && ( // 只有当 onDeleteItem 函数被传递时才显示按钮
              <button 
                onClick={() => onDeleteItem(item.id)} 
                className="delete-item-button"
                style={{backgroundColor: 'red', color: 'white', marginTop: '10px'}} // 简单样式
              >
                删除
              </button>
        )}
    </div>
  );
}