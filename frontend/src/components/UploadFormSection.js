import React from 'react';

export default function UploadFormSection({
  onSubmit,
  onImageChange,
  previewImage,
  title,
  onTitleChange,
  itemBrief,
  onItemBriefChange,
  itemDetail,
  onItemDetailChange,
  isUploading,
  uploadMessage,
}) {
  return (
    <div className="upload-section card-panel">
      <form onSubmit={onSubmit} className="upload-form">
        {/* 左侧图片上传区域 */}
        <div className="image-upload-area">
          <input
            type="file"
            id="imageUploadInput"
            accept="image/jpeg, image/png, image/gif"
            onChange={onImageChange}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          <label htmlFor="imageUploadInput" className="image-upload-box">
            {previewImage ? (
              <img src={previewImage} alt="预览" className="image-preview" />
            ) : (
              <span className="plus-icon">+</span>
            )}
          </label>
        </div>

        {/* 右侧信息输入区域 */}
        <div className="info-input-area">
          <input
            type="text"
            placeholder="请输入标题"
            className="input-field"
            value={title}
            onChange={onTitleChange}
            required
            disabled={isUploading}
          />
          <input
            type="text"
            placeholder="请输入简介"
            className="input-field"
            value={itemBrief}
            onChange={onItemBriefChange}
            disabled={isUploading}
          />
          <textarea
            placeholder="请输入详细信息"
            className="textarea-field"
            value={itemDetail}
            onChange={onItemDetailChange}
            disabled={isUploading}
          />
        </div>

        {/* 发布操作区域 */}
        <div className="publish-action-area">
          {/* 按钮始终显示，但根据条件给出提示 */}
          <button type="submit" className="publish-button" disabled={isUploading}>
            {isUploading ? '上传中...' : '立即发布'}
          </button>

          {/* 错误提示统一显示 */}
          {uploadMessage && (
            <p className={`upload-status-message ${
              uploadMessage.includes('失败') || uploadMessage.includes('出错') ? 'error' : 'success'
            }`}>
              {uploadMessage}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}