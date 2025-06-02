import React, { useState, useEffect } from 'react';
import UploadFormSection from '../components/UploadFormSection';
import UploadedItemsSection from '../components/UploadedItemsSection';
import '../components/MyStore.css';

export default function MyStorePage() {
  const [title, setTitle] = useState('');
  const [itemBrief, setItemBrief] = useState('');
  const [itemDetail, setItemDetail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedItems, setUploadedItems] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const fetchUploadedItems = async () => {
    setIsLoadingImages(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://10.192.49.63:8080/api/items/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const itemsData = await response.json();
      setUploadedItems(itemsData.map(item => ({
        id: item.id,
        title: item.title,
        brief: item.brief,
        details: item.details,
        imageUrl: item.image ? `data:image/png;base64,${item.image}` : '/default-preview.jpg'
      })));
    } catch (error) {
      setUploadMessage(`获取商品失败: ${error.message}`);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchUploadedItems();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('图片大小不能超过5MB');
      event.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      setSelectedFile(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
  
    if (!title.trim()) {
      setUploadMessage('标题不能为空');
      return;
    }
  
    if (!itemBrief.trim()) {
      setUploadMessage('简介不能为空');
      return;
    }
  
    if (!itemDetail.trim()) {
      setUploadMessage('详细信息不能为空');
      return;
    }
  
    if (!selectedFile) {
      setUploadMessage('请选择商品图片');
      return;
    }
  
    // 所有检查通过，开始上传
    setIsUploading(true);
    setUploadMessage('');
  
    try {
      const response = await fetch('http://10.192.49.63:8080/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          brief: itemBrief,
          details: itemDetail,
          image: selectedFile.split(',')[1]
        }),
      });
  
      if (response.ok) {
        await fetchUploadedItems();
        setTitle('');
        setItemBrief('');
        setItemDetail('');
        setPreviewImage(null);
        setSelectedFile(null);
        setUploadMessage('商品上传成功');
      }
    } catch (error) {
      setUploadMessage(`上传失败: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`http://10.192.49.63:8080/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUploadedItems(prev => prev.filter(item => item.id !== itemId));
        setUploadMessage('商品删除成功');
      }
    } catch (error) {
      setUploadMessage(`删除失败: ${error.message}`);
    }
  };

  return (
    <div className="my-store-container">
      <UploadFormSection
        onSubmit={handleUploadSubmit}
        onImageChange={handleImageChange}
        previewImage={previewImage}
        title={title}
        onTitleChange={(e) => setTitle(e.target.value)}
        itemBrief={itemBrief}
        onItemBriefChange={(e) => setItemBrief(e.target.value)}
        itemDetail={itemDetail}
        onItemDetailChange={(e) => setItemDetail(e.target.value)}
        isUploading={isUploading}
        uploadMessage={uploadMessage}
      />
      <UploadedItemsSection
        items={uploadedItems}
        isLoading={isLoadingImages}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}