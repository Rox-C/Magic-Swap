package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tech.roxtang.magicswap.model.Wardrobe;
import tech.roxtang.magicswap.model.Item; // Assuming Item class is correctly defined
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

            // 检查衣物是否已存在，避免重复添加 (可选，但推荐)
            if (!wardrobe.getClothingIds().contains(clothingId)) {
                wardrobe.getClothingIds().add(clothingId);
                wardrobeRepository.save(wardrobe);
            } else {
                // 可以选择返回一个特定的响应表明物品已存在，或静默处理
                return ResponseEntity.ok().body(Collections.singletonMap("message", "衣物已在收藏中"));
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            // Log the exception e.g., using a logger
            return ResponseEntity.internalServerError().body(
                Collections.singletonMap("error", "服务器内部错误，添加衣物失败")
            );
        }
    }

    // 新增：移除衣物接口
    @PostMapping("/remove")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeClothing(
        @RequestBody Map<String, String> request,
        @AuthenticationPrincipal String userId
    ) {
        try {
            String clothingId = request.get("clothingId");
            System.out.println("Removing clothing with ID: " + clothingId);
            // 基础参数校验
            if (clothingId == null || clothingId.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", "无效的商品ID")
                );
            }

            // 获取衣橱
            Optional<Wardrobe> wardrobeOpt = wardrobeRepository.findByUserId(userId);

            if (wardrobeOpt.isPresent()) {
                Wardrobe wardrobe = wardrobeOpt.get();
                // 检查衣物是否在衣橱中
                if (wardrobe.getClothingIds().contains(clothingId)) {
                    wardrobe.getClothingIds().remove(clothingId);
                    wardrobeRepository.save(wardrobe);
                    return ResponseEntity.ok().build();
                } else {
                    // 衣物不在衣橱中，无法移除
                    return ResponseEntity.badRequest().body(
                        Collections.singletonMap("error", "衣物未在收藏中，无法移除")
                    );
                }
            } else {
                // 用户没有衣橱，自然也无法移除其中的衣物
                return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", "用户衣橱不存在")
                );
            }

        } catch (Exception e) {
            // Log the exception
            return ResponseEntity.internalServerError().body(
                Collections.singletonMap("error", "服务器内部错误，移除衣物失败")
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
            .orElseGet(() -> {
                // If wardrobe doesn't exist, create and save an empty one
                // Or simply return an empty response, depending on desired behavior
                Wardrobe newWardrobe = new Wardrobe(userId);
                // wardrobeRepository.save(newWardrobe); // Optionally save it immediately
                return newWardrobe; // Return the new, possibly unsaved, empty wardrobe
            });
        
        // 获取衣物详情（包含图片）
        List<Item> clothes = new ArrayList<>();
        if (wardrobe.getClothingIds() != null && !wardrobe.getClothingIds().isEmpty()) {
            clothes = itemRepository.findAllById(wardrobe.getClothingIds());
        }
        
        // 构建响应数据
        List<Map<String, String>> clothesData = new ArrayList<>();
        for (Item item : clothes) {
            Map<String, String> cloth = new HashMap<>();
            cloth.put("id", item.getId());
            cloth.put("preview", item.getImage()); // 直接返回Base64图片数据
            // Consider adding other item details if needed by the wardrobe view
            // cloth.put("title", item.getTitle()); 
            clothesData.add(cloth);
        }

        response.put("wardrobeId", wardrobe.getId()); // May be null if new and unsaved
        response.put("clothes", clothesData);
        
        return ResponseEntity.ok(response);
    }

    // 异常处理
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralException(Exception ex) {
        // Log the exception ex
        return ResponseEntity.internalServerError().body(
            Collections.singletonMap("error", "服务器处理请求时发生错误")
        );
    }
}