import React, { useState, useEffect } from 'react';
import WardrobeSection from '../components/WardrobeCard';

export default function Wardrobe() {
  const [wardrobeData, setWardrobeData] = useState({
    models: [
      // 模特测试数据
      { id: 1, preview: 'model_1.jpg' },
      { id: 2, preview: 'model_2.jpg' },
      { id: 3, preview: 'model_3.jpg' },
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
        
        const response = await fetch('http://localhost:8080/api/wardrobe'); 
        if (!response.ok) throw new Error('获取衣橱数据失败');
        
        const data = await response.json();
        
        setWardrobeData(prev => ({
          ...prev,
          clothes: data.clothes.map(item => ({
            id: item.id,
            preview: item.preview || 'default-preview.jpg'
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

  // 上传处理（示例）
  const handleUpload = async (type) => {
    if (type !== 'clothing') {
      alert('暂只支持衣物上传');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      try{
        const formData = new FormData();
        formData.append('file', file);
        
        // 上传到后端
        const uploadRes = await fetch('http://localhost:8080/api/items', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error('上传失败');
        
        // 更新前端状态
        const newItem = await uploadRes.json();
        
        setWardrobeData(prev => ({
          ...prev,
          clothes: [...prev.clothes, {
            id: newItem.id,
            preview: newItem.previewUrl || 'default-preview.jpg'
          }]
        }));
      }catch(err){
        setError(err.message);
      }
      // 此处添加实际上传逻辑
      // const newItem = {
      //   id: Date.now(),
      //   preview: URL.createObjectURL(file)
      // };
      
      // setWardrobeData(prev => ({
      //   ...prev,
      //   [type === 'model' ? 'models' : 'clothes']: [...prev[type === 'model' ? 'models' : 'clothes'], newItem]
      // }));
    };
    input.click();
  };

  // 处理图片加载失败
  const handleImageError = (e) => {
    e.target.src = 'default-preview.jpg';
  };

  if (loading) return <div className="loading-spinner">衣橱加载中...</div>;
  if (error) return <div className="error-alert">错误: {error}</div>;

  return (
    <div className="wardrobe-layout">
      <div className="wardrobe-main">
        <WardrobeSection 
          title="我的模特"
          type="model"
          items={wardrobeData.models}
          selectedId={selectedModel}
          onSelect={setSelectedModel}
          onUpload={handleUpload}
        />

        <WardrobeSection 
          title="我的衣物"
          type="clothing"
          // items={wardrobeData.clothes}
          items={wardrobeData.clothes.map(item => ({
            ...item,
            preview: item.preview.startsWith('http') ? 
              item.preview : 
              `/uploads/${item.preview}`
          }))}
          selectedId={selectedClothing}
          onSelect={setSelectedClothing}
          onUpload={handleUpload}
          onImageError={handleImageError}
        />

        <div className="try-on-panel">
          <h3 className="panel-title">试穿结果</h3>
          <div className="result-preview">
            {selectedModel && selectedClothing ? (
              <div className="virtual-tryon">
                <img 
                  src="/tryon-demo.jpg" 
                  alt="虚拟试穿" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <p className="hint-text">
                {!selectedModel && !selectedClothing 
                  ? "请先选择模特和衣物" 
                  : `请选择${!selectedModel ? '模特' : '衣物'}`}
              </p>
            )}
          </div>
          <button
            className="try-on-button"
            onClick={() => {/* 试穿逻辑 */}}
            disabled={!selectedModel || !selectedClothing}
          >
            立即试穿
          </button>
        </div>
      </div>
    </div>
  );
}