package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.roxtang.magicswap.model.Item;
import tech.roxtang.magicswap.model.User;
import tech.roxtang.magicswap.repository.ItemRepository;
import tech.roxtang.magicswap.repository.UserRepository;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemController(ItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    // 创建商品（支持多图上传）
    @PostMapping
    public ResponseEntity<?> createItem(
        Authentication authentication,
        @RequestPart("item") Item item,
        @RequestPart("images") MultipartFile[] files
    ) {
        try {
            User user = userRepository.findByEmail(authentication.getName());
            
            // 处理图片上传
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body("至少上传一张图片");
            }
            item.setImages(files); // 调用Item的setImages方法处理Base64编码
            
            // 关联用户
            item.setUserId(user.getId());
            Item savedItem = itemRepository.save(item);
            
            return ResponseEntity.ok(savedItem);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("图片处理失败");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 获取商品详情
    @GetMapping("/{itemId}")
    public ResponseEntity<?> getItem(@PathVariable String itemId) {
        return ResponseEntity.of(itemRepository.findById(itemId));
    }

    // 获取当前用户的商品列表
    @GetMapping("/my")
    public ResponseEntity<?> getMyItems(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName());
        return ResponseEntity.ok(itemRepository.findByUserId(user.getId()));
    }

    // 删除商品（新增方法）
    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteItem(
        Authentication authentication, 
        @PathVariable String itemId
    ) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        User user = userRepository.findByEmail(authentication.getName());
        if (!item.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).body("无权操作他人商品");
        }
        
        itemRepository.delete(item);
        return ResponseEntity.ok().build();
    }
}