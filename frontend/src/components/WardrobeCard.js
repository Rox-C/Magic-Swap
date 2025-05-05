// WardrobeCard.js
import React from 'react';
import './WardrobeCard.css';

function WardrobeSection({ title, items, type, selectedId, onSelect, onUpload }) {
  const displayItems = items.slice();

  return (
    <div className="wardrobe-section">
      {/* 图片展示区域 */}
      <div className="content-card">
        <h2 className="section-title">{title}</h2>
        <div className={`${type}-grid`}>
          {displayItems.map((item) => (
            <div
              key={item.id}
              className={`${type}-item ${selectedId === item.id ? 'selected' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <img src={item.preview} alt={type} className="preview-image" />
            </div>
          ))}
        </div>
      </div>

      {/* 独立上传区域 */}
      <div className="upload-container" onClick={() => onUpload(type)}>
        <div className="upload-content">
          <svg className="upload-icon" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <div className="upload-text">上传新{type === 'model' ? '模特' : '衣物'}</div>
        </div>
      </div>
    </div>
  );
}

export default WardrobeSection;
