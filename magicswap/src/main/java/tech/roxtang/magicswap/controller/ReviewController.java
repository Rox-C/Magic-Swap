package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.roxtang.magicswap.model.Review;
import tech.roxtang.magicswap.model.User;
import tech.roxtang.magicswap.repository.ReviewRepository;
import tech.roxtang.magicswap.repository.UserRepository;
import java.net.URI;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    // 构造函数依赖注入
    public ReviewController(ReviewRepository reviewRepository, 
                           UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // 新增评论（POST方法）
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        // 数据验证
        if (review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "评分必须在1-5星之间")
            );
        }
        if (review.getContent() == null || review.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "评价内容不能为空")
            );
        }
        
        // 设置创建时间
        // review.setCreatedAt(new Date());
        
        try {
            // 验证用户存在性
            User user = userRepository.findById(review.getUserId())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
            
            // 持久化到数据库
            Review savedReview = reviewRepository.save(review);
            
            // 返回201 Created响应
            return ResponseEntity.created(URI.create("/api/reviews/" + savedReview.getId()))
                    .body(savedReview);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "评论提交失败: " + e.getMessage())
            );
        }
    }

    // 获取商品评论（GET方法）
    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getItemReviews(
        @PathVariable("itemId") String itemId
    ) {
        List<Review> reviews = reviewRepository.findByItemId(itemId);
        
        // 流处理构建响应数据
        List<Map<String, Object>> response = reviews.stream()
            .map(review -> {
                Map<String, Object> reviewData = new HashMap<>();
                reviewData.put("id", review.getId());
                reviewData.put("rating", review.getRating());
                reviewData.put("content", review.getContent());
                reviewData.put("createdAt", review.getCreatedAt());

                // 用户信息处理
                User user = userRepository.findById(review.getUserId())
                    .orElseGet(() -> {
                        User dummy = new User();
                        dummy.setUsername("已注销用户");
                        dummy.setAvatar("/default-avatar.png");
                        return dummy;
                    });

                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("username", user.getUsername());
                userInfo.put("avatar", user.getAvatar());
                
                reviewData.put("user", userInfo);
                return reviewData;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}