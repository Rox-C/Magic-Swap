import React from 'react';

// 这个组件负责展示单个已上传物品的卡片
export default function UploadedItemCard({ item, onDeleteItem }) {
  return (
    <div className="item-card">
      <div className="item-image-frame">
        <img
          src={item.imageUrl}
          alt={item.title || '物品图片'} // 使用 item.title 作为 alt 文本的一部分
          className="item-image"
          onError={(e) => {
            e.target.onerror = null; // 防止无限循环
            e.target.src = 'https://placehold.co/200x250/eee/aaa?text=Image+Error'; // 占位图
            e.target.alt = `图片加载失败: ${item.title || '未知物品'}`; // 也在这里使用 item.title
          }}
        />
      </div>
      {/* 修改或添加以下行来显示标题 */}
      <p className="item-title">{item.title}</p> {/* 显示衣物标题 */}
      {/* 如果 item.name 仍然相关且不同于 item.title，你可以保留或调整 */}
      {/* <p className="item-name">{item.name}</p> */} 
      {onDeleteItem && ( // 只有当 onDeleteItem 函数被传递时才显示按钮
              <button 
                onClick={() => onDeleteItem(item.id)} 
                className="delete-item-button"
                style={{backgroundColor: 'red', color: 'white', marginTop: '10px', padding: '5px 10px', fontSize: '12px'}} // 简单样式
              >
                删除
              </button>
        )}
    </div>
  );
}