import React from 'react';
import './WardrobeCard.css';

export default function WardrobeSection({ 
  title, 
  items, 
  selectedId, 
  onSelect, 
  onImageError 
}) {
  return (
    <div className="wardrobe-section">
      <h3 className="section-title">{title}</h3>
      <div className="grid-container">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`card ${selectedId === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <img
              src={item.preview}
              alt={item.title || '衣物预览'}
              className="preview-image"
              onError={onImageError}
            />
          </div>
        ))}
      </div>
    </div>
  );
}