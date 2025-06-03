package tech.roxtang.magicswap.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.roxtang.magicswap.model.Item;
import tech.roxtang.magicswap.model.Wardrobe;
import tech.roxtang.magicswap.repository.ItemRepository;
import tech.roxtang.magicswap.repository.WardrobeRepository;
import java.io.IOException;
import java.security.Principal;
import java.util.Base64;

@RestController
@RequestMapping("/api/wardrobe")
public class UploadController {
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private WardrobeRepository wardrobeRepository;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadClothing(@RequestParam("image") MultipartFile file, Principal principal) {
        String userId = principal.getName();
        
        try {
            // 验证图片
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("请选择图片文件");
            }
            if (file.getSize() > 2 * 1024 * 1024) { // 2MB限制
                return ResponseEntity.badRequest().body("图片大小不能超过2MB");
            }
            String contentType = file.getContentType();
            if (contentType == null || 
                !(contentType.equals("image/jpeg") || contentType.equals("image/png"))) {
                return ResponseEntity.badRequest().body("只支持JPEG或PNG格式图片");
            }
            
            // 转换为Base64
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            // 创建衣物Item
            Item newItem = new Item();
            newItem.setUserId(userId);
            newItem.setImage(base64Image);
            newItem.setTitle(file.getOriginalFilename());
            newItem.setBrief("通过上传添加的衣物");
            newItem.setDetails("");
            
            itemRepository.save(newItem);
            
            // 添加到用户衣橱
            Wardrobe wardrobe = wardrobeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wardrobe newWardrobe = new Wardrobe(userId);
                    return wardrobeRepository.save(newWardrobe);
                });
            
            wardrobe.addClothing(newItem.getId());
            wardrobeRepository.save(wardrobe);
            
            // 返回新创建的Item
            return ResponseEntity.ok(newItem);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body("图片处理失败: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("上传失败: " + e.getMessage());
        }
    }
}
