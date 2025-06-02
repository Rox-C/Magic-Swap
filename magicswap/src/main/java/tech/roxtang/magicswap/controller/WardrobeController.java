package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tech.roxtang.magicswap.model.Wardrobe;
import tech.roxtang.magicswap.model.Item;
import tech.roxtang.magicswap.repository.ItemRepository;
import tech.roxtang.magicswap.repository.WardrobeRepository;

import java.util.*;

@RestController
@RequestMapping("/api/wardrobe")
public class WardrobeController {

    private final WardrobeRepository wardrobeRepository;
    private final ItemRepository itemRepository;

    public WardrobeController(WardrobeRepository wardrobeRepository,
                             ItemRepository itemRepository) {
        this.wardrobeRepository = wardrobeRepository;
        this.itemRepository = itemRepository;
    }

    // 收藏衣物接口
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addClothing(
        @RequestBody Map<String, String> request,
        @AuthenticationPrincipal String userId
    ) {
        try {
            String clothingId = request.get("clothingId");
            
            // 基础参数校验
            if (clothingId == null || clothingId.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", "无效的商品ID")
                );
            }

            // 获取或创建衣橱
            Wardrobe wardrobe = wardrobeRepository.findByUserId(userId)
                .orElseGet(() -> wardrobeRepository.save(new Wardrobe(userId)));

            // 直接添加衣物ID
            wardrobe.getClothingIds().add(clothingId);
            wardrobeRepository.save(wardrobe);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Collections.singletonMap("error", "服务器内部错误")
            );
        }
    }

    // 获取完整衣橱数据
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserWardrobe(@AuthenticationPrincipal String userId) {
        Map<String, Object> response = new HashMap<>();
        
        // 获取衣橱信息
        Wardrobe wardrobe = wardrobeRepository.findByUserId(userId)
            .orElseGet(() -> new Wardrobe(userId));
        
        // 获取衣物详情（包含图片）
        List<Item> clothes = itemRepository.findAllById(wardrobe.getClothingIds());
        
        // 构建响应数据
        List<Map<String, String>> clothesData = new ArrayList<>();
        for (Item item : clothes) {
            Map<String, String> cloth = new HashMap<>();
            cloth.put("id", item.getId());
            cloth.put("preview", item.getImage()); // 直接返回Base64图片数据
            clothesData.add(cloth);
        }

        response.put("wardrobeId", wardrobe.getId());
        response.put("clothes", clothesData);
        
        return ResponseEntity.ok(response);
    }

    // 异常处理
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralException(Exception ex) {
        return ResponseEntity.internalServerError().body(
            Collections.singletonMap("error", "服务器处理请求时发生错误")
        );
    }
}