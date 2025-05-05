package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tech.roxtang.magicswap.model.Wardrobe;
import tech.roxtang.magicswap.model.Item;
import tech.roxtang.magicswap.repository.ItemRepository;
import tech.roxtang.magicswap.repository.WardrobeRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

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

    // 获取用户衣橱数据
    @GetMapping
    public ResponseEntity<?> getUserWardrobe(@AuthenticationPrincipal String userId) {
        Map<String, Object> response = new HashMap<>();
        
        // 1. 获取衣橱信息
        Wardrobe wardrobe = wardrobeRepository.findByUserId(userId)
                .orElseGet(() -> new Wardrobe(userId));
        
        // 2. 获取衣物详情
        List<Item> items = itemRepository.findAllById(wardrobe.getClothingIds());
        
        // 3. 构建响应数据（包含首图预览）
        List<Map<String, String>> clothesData = items.stream()
            .map(item -> {
                Map<String, String> cloth = new HashMap<>();
                cloth.put("id", item.getId());
                
                // 获取首张图片路径，带空值保护
                // String[] images = item.getImages();
                // String preview = (images != null && images.length > 0) 
                //     ? images[0] 
                //     : "default-preview.jpg";
                
                // cloth.put("preview", preview);
                return cloth;
            })
            .collect(Collectors.toList());

        response.put("wardrobeId", wardrobe.getId());
        response.put("clothes", clothesData);
        
        return ResponseEntity.ok(response);
    }
}
