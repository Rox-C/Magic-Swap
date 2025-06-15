from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import io
import os
import base64
from functools import wraps
from datetime import datetime
from flask_cors import CORS
import logging
from gradio_ootd import process_dc, process_hd

# 初始化Flask应用
app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# 配置参数
EXTERNAL_MODELS_ROOT = r'D:\Code\Java\MagicSwap\frontend\public'
GENERATED_DIR = os.path.join(os.path.dirname(__file__), 'generated_images')
os.makedirs(GENERATED_DIR, exist_ok=True)

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('VTON-API')

# 授权验证装饰器
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify(success=True), 200
            
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning('缺少或无效的授权头')
            return jsonify(success=False, error="Missing or invalid token"), 401
            


            
        return f(*args, **kwargs)
    return decorated

@app.route('/api/try-on', methods=['POST', 'OPTIONS'])
@token_required
def try_on():
    logger.info('接收到试衣请求')
    try:
        # 验证请求格式
        if not request.is_json:
            logger.error('请求不是JSON格式')
            return jsonify(success=False, error="Request must be JSON"), 400
            
        data = request.get_json()
        logger.debug(f"请求数据: {str(data)[:200]}...")  # 限制日志长度

        # 验证必需字段
        required_fields = ['model', 'clothing']
        if missing := [field for field in required_fields if field not in data]:
            logger.error(f"缺失必要字段: {missing}")
            return jsonify(success=False, error=f"Missing fields: {missing}"), 400

        # ================= 处理模特图片 =================
        model_path = data['model']['image'].lstrip('/')
        full_model_path = os.path.join(EXTERNAL_MODELS_ROOT, model_path)
        
        logger.info(f"模特图片路径: {full_model_path}")
        if not os.path.exists(full_model_path):
            logger.error(f"模特图片不存在: {full_model_path}")
            return jsonify(success=False, error="Model image not found"), 404

        # ================= 处理衣物图片 =================
        clothing_image = data['clothing']['image']
        
        # 验证base64格式
        if 'base64,' not in clothing_image:
            logger.error("Base64缺少前缀")
            return jsonify(success=False, error="Invalid base64 format: missing prefix"), 400
            
        parts = clothing_image.split("base64,")
        if len(parts) < 2:
            logger.error("Base64格式错误")
            return jsonify(success=False, error="Invalid base64 format"), 400
            
        base64_data = parts[1]
        
        # 自动补全padding
        missing_padding = len(base64_data) % 4
        if missing_padding:
            base64_data += '=' * (4 - missing_padding)
            
        try:
            decoded_data = base64.b64decode(base64_data)
            if len(decoded_data) < 1024:
                raise ValueError("图像数据过小（需大于1KB）")
                
            # 验证图像格式
            garm_img = Image.open(io.BytesIO(decoded_data))
            if garm_img.format not in ['JPEG', 'PNG', 'WEBP']:
                raise ValueError(f"不支持的图像格式: {garm_img.format}")
                
            garm_img = garm_img.convert("RGB").resize((768, 1024))
            
        except Exception as e:
            logger.error(f"衣物图像处理失败: {str(e)}")
            return jsonify(success=False, error=f"Clothing image error: {str(e)}"), 400

        # ================= 处理模特图片 =================
        try:
            vton_img = Image.open(full_model_path).convert("RGB").resize((768, 1024))
        except Exception as e:
            logger.error(f"模特图片处理失败: {str(e)}")
            return jsonify(success=False, error=f"Model image error: {str(e)}"), 400

        # ================= 调用处理函数 =================
        logger.info("开始图像生成处理")
        try:
            images = process_hd(
                vton_img=vton_img,
                garm_img=garm_img,
                # category="Upper-body",
                n_samples=1,
                n_steps=20,
                image_scale=2.0,
                seed=-1
            )
        except Exception as e:
            logger.error(f"图像生成失败: {str(e)}")
            return jsonify(success=False, error="Image generation failed"), 500

        # ================= 保存结果 =================
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        result_data = []
        try:
            # 确保images是单个图像（根据你的说明）
            if len(images) != 1:
                raise ValueError("生成结果数量异常")
                
            img = images[0]
            
            # === 保存到本地 ===
            filename = f"{timestamp}_result.png"
            save_path = os.path.join(GENERATED_DIR, filename)
            
            # 验证图像类型
            if not isinstance(img, Image.Image):
                raise TypeError("生成的图像对象类型错误")
            
            # 保存文件
            img.save(save_path, format="PNG")
            logger.info(f"已保存调试文件: {save_path}")
            
            # === 生成Base64 ===
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            img_bytes = buffer.getvalue()
            base64_str = base64.b64encode(img_bytes).decode('utf-8')
            data_uri = f"data:image/png;base64,{base64_str}"
            
            # 构建返回数据
            result_data.append({
                "debug_path": save_path,  # 保留本地路径用于调试
                "base64": data_uri,       # 前端展示用
                "resolution": f"{img.width}x{img.height}",
                "size": f"{len(img_bytes)//1024}KB"
            })
            
        except Exception as save_error:
            logger.error(f"结果处理失败: {str(save_error)}")
            return jsonify(success=False, error="Result processing failed"), 500

        return jsonify(
            success=True,
            result=result_data[0],  # 直接返回单个结果
            meta={
                "timestamp": timestamp,
                "model_path": full_model_path,
                "garment_format": garm_img.format
            }
        )

    except Exception as e:
        logger.error(f"全局异常: {str(e)}", exc_info=True)
        return jsonify(success=False, error="Internal server error"), 500

# ================= 其他路由 =================
@app.route('/generated/<path:filename>')
def serve_generated(filename):
    return send_from_directory(GENERATED_DIR, filename)

@app.route('/')
def index():
    return send_from_directory('static', 'Web.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.after_request
def add_headers(response):
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition'
    return response

if __name__ == '__main__':
    # 启动前验证目录
    if not os.path.isdir(EXTERNAL_MODELS_ROOT):
        logger.critical(f"模特目录不存在: {EXTERNAL_MODELS_ROOT}")
        exit(1)
        
    if not os.access(GENERATED_DIR, os.W_OK):
        logger.critical(f"生成目录不可写: {GENERATED_DIR}")
        exit(1)

    app.run(host='0.0.0.0', port=5000, debug=True)