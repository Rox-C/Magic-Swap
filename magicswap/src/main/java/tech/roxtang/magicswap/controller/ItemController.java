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
import java.util.Base64; 
@RestController
@RequestMapping("/api/items")
public class ItemController {
    
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemController(ItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    // 创建商品（不支持多图上传）
    @PostMapping
    public ResponseEntity<?> createItem(
        Authentication authentication,
        @RequestBody Item item
    ) {
        try {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail);
    
            // 设置用户ID
            item.setUserId(user.getId());
    
            // 保存商品到数据库
            Item savedItem = itemRepository.save(item);
            return ResponseEntity.ok(savedItem);
    
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<?> getItem(@PathVariable String itemId) {
        return ResponseEntity.of(itemRepository.findById(itemId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyItems(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName());
        return ResponseEntity.ok(itemRepository.findByUserId(user.getId()));
    }

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