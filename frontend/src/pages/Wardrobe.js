import React, { useState, useEffect } from 'react';
import WardrobeSection from '../components/WardrobeCard';
import '../components/Wardrobe.css';

export default function Wardrobe() {
  // 状态变量
  const [tryonResult, setTryonResult] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [wardrobeData, setWardrobeData] = useState({
    models: [
      { id: 1, preview: '/models/model_1.png' },
      { id: 2, preview: '/models/model_2.png' },
    ],
    clothes: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedClothing, setSelectedClothing] = useState(null);

  useEffect(() => {
    const fetchWardrobe = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/wardrobe', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('获取衣橱数据失败');
        
        const { clothes } = await response.json();
        
        setWardrobeData(prev => ({
          ...prev,
          clothes: clothes.map(item => ({
            id: item.id,
            preview: item.preview 
              ? `data:image/jpeg;base64,${item.preview}` 
              : '/default-preview.jpg'
          }))
        }));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWardrobe();
  }, []);
  const handleTryOn = async () => {
    try {
      setLoadingResults(true); // 新增加载状态
      setError('');
      setTryonResult(null); // 重置结果
      const token = localStorage.getItem('token');
      
      // 获取选中的图片数据
      const selectedModelData = wardrobeData.models.find(m => m.id === selectedModel);
      const selectedClothingData = wardrobeData.clothes.find(c => c.id === selectedClothing);
  
      // 构建传输数据
      const payload = {
        model: {
          id: selectedModel,
          image: selectedModelData.preview // 模特图片URL（如 '/models/model_1.png'）
        },
        clothing: {
          id: selectedClothing,
          image: selectedClothingData.preview // 衣物base64（如 'data:image/jpeg;base64,...'）
        }
      };
  
      // 发送到Python后端
      const response = await fetch('http://localhost:5000/api/try-on', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '试穿处理失败');
      }
          // 直接使用base64数据
      if (result.result?.base64) {
        setTryonResult({
          preview: result.result.base64,
          meta: result.meta
        });
      } else {
        throw new Error('未收到有效图片数据');
      }
    } catch (err) {
      setError(`试穿失败: ${err.message}`);
    }finally {
      setLoadingResults(false); // 清除加载状态
    }
  };

  // 新增下载处理函数
const handleDownload = () => {
  try {
    if (!tryonResult?.preview) {
      throw new Error('没有可下载的内容');
    }
    
    // 从base64提取数据部分
    const base64Data = tryonResult.preview.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    // 创建Blob并下载
    const blob = new Blob(byteArrays, { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    
    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `virtual-tryon-${timestamp}.png`;
    
    // 创建隐藏的下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (err) {
    setError(`下载失败: ${err.message}`);
  }
};
  const handleImageError = (e) => {
    e.target.src = '/default-preview.jpg';
    e.target.alt = '图片加载失败';
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-alert">⚠️ {error}</div>;

  return (
    <div className="wardrobe-layout">
      <div className="wardrobe-main">
        <WardrobeSection 
          title="虚拟模特"
          type="model"
          items={wardrobeData.models}
          selectedId={selectedModel}
          onSelect={setSelectedModel}
        />

        <WardrobeSection
          title="我的收藏"
          type="clothing"
          items={wardrobeData.clothes}
          selectedId={selectedClothing}
          onSelect={setSelectedClothing}
          onImageError={handleImageError}
        />

        <div className="try-on-panel">
          <div className="preview-area">
            {loadingResults ? (
              <div className="tryon-loading">
                <div className="loading-spinner"></div>
                <p>正在生成试穿效果...</p>
              </div>
            ) : tryonResult ? (
              <div className="result-container">
                <img
                  src={tryonResult.preview}
                  alt="虚拟试穿效果"
                  className="tryon-result"
                  onError={(e) => {
                    e.target.src = '/tryon-error.jpg';
                    e.target.alt = '效果图加载失败';
                  }}
                />
                <div className="image-meta">
                  <p>分辨率: {tryonResult.meta?.resolution}</p>
                  <p>文件大小: {tryonResult.meta?.size}</p>
                </div>
              </div>
            ) : selectedModel && selectedClothing ? (
              <div className="action-prompt">
                <p>🖱️ 请点击下方按钮开始试穿</p>
              </div>
            ) : (
              <div className="placeholder">
                <p>{
                  !selectedModel && !selectedClothing 
                    ? "请选择模特和衣物进行试穿" 
                    : `请选择${!selectedModel ? '模特' : '衣物'}`
                }</p>
              </div>
            )}
          </div>
            <div className="button-group">
            <button 
              className={`tryon-button ${loadingResults ? 'tryon-button--loading' : ''}`}
              onClick={handleTryOn}
              disabled={!selectedModel || !selectedClothing || loadingResults}
            >
              {loadingResults ? '🔄 处理中...' : '🎨 开始虚拟试穿'}
            </button>
              
              <button
                className="download-button"
                onClick={handleDownload}
                disabled={!tryonResult}
              >
                ⬇️ 下载效果图
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}