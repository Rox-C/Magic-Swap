package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.roxtang.magicswap.model.Item;
import tech.roxtang.magicswap.repository.ItemRepository;

import java.util.List;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final ItemRepository itemRepository;

    public HomeController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    /**
     * 获取所有商品用于首页展示
     * 返回字段：
     * - id: 商品ID
     * - title: 标题
     * - brief: 简介
     * - preview: 首张图片（Base64）
     */
    @GetMapping("/items")
    public ResponseEntity<List<Item>> getAllItemsForHome() {
        List<Item> items = itemRepository.findAll();
        return ResponseEntity.ok(items);
    }
}