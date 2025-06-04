package tech.roxtang.magicswap.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.Authentication; // 可以用 Authentication 或 Principal
import java.security.Principal; // 更通用的方式
import org.springframework.web.bind.annotation.*;
import tech.roxtang.magicswap.model.Review;
import tech.roxtang.magicswap.model.User;
import tech.roxtang.magicswap.repository.ReviewRepository;
import tech.roxtang.magicswap.repository.UserRepository;

import java.net.URI;
// import java.util.Date; // 不再需要手动设置Date，由 @CreatedDate 处理
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class); // 使用 SLF4J Logger

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    // 新增评论（POST方法）
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review, Principal principal) { // 使用 Principal
        logger.info("<<<<< ENTERED ReviewController.createReview with principal: {} >>>>>", (principal != null ? principal.getName() : "null"));
        // Assuming Review.toString() is now reasonable (e.g., doesn't print a full User object with avatar)
        logger.info("Review object received from request body: {}", review);

        // 数据验证
        if (review.getRating() < 1 || review.getRating() > 5) {
            logger.warn("Validation failed: Rating out of range - {}. For review: {}", review.getRating(), review);
            return ResponseEntity.badRequest().body(Map.of("error", "评分必须在1-5星之间"));
        }
        if (review.getContent() == null || review.getContent().trim().isEmpty()) {
            logger.warn("Validation failed: Content is empty. For review: {}", review);
            return ResponseEntity.badRequest().body(Map.of("error", "评价内容不能为空"));
        }
        if (review.getItemId() == null || review.getItemId().trim().isEmpty()) {
            logger.warn("Validation failed: ItemId is empty. For review: {}", review);
            return ResponseEntity.badRequest().body(Map.of("error", "商品ID不能为空"));
        }

        if (principal == null) {
            logger.error("Principal is null after entering method. This should not happen if JWT filter is configured correctly.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "用户未认证，无法评论"));
        }

        try {
            String userIdentifier = principal.getName();
            logger.info("Attempting to find user by identifier (e.g., email): {}", userIdentifier);
            User currentUser = userRepository.findByEmail(userIdentifier);

            if (currentUser == null) {
                logger.warn("User not found in database with identifier: {}. Review submission aborted.", userIdentifier);
                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "认证用户 '" + userIdentifier + "' 未找到"));
            }
            // Assuming User.toString() is now reasonable (e.g., excludes avatar or summarizes it)
            logger.info("User found: {}", currentUser);

            review.setUserId(currentUser.getId());
            logger.info("Setting userId ({}) on review. Review object before save: {}", currentUser.getId(), review);

            logger.info("Attempting to save review...");
            Review savedReview = reviewRepository.save(review);
            logger.info("Review saved successfully! Saved review: {}", savedReview);

            Map<String, Object> reviewData = new HashMap<>();
            reviewData.put("id", savedReview.getId());
            reviewData.put("itemId", savedReview.getItemId());
            reviewData.put("rating", savedReview.getRating());
            reviewData.put("content", savedReview.getContent()); // Content might still be garbled if encoding issue persists
            reviewData.put("createdAt", savedReview.getCreatedAt());

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", currentUser.getUsername());
            // Only include avatar if it's a manageable URL/path, not the full Base64 data in the response.
            // If currentUser.getAvatar() IS the Base64, you might want to omit it here or provide a flag.
            userInfo.put("avatar", currentUser.getAvatar() != null ? currentUser.getAvatar() : "/default-avatar.png");
            
            reviewData.put("user", userInfo);

            logger.info("Successfully created review. Response data structure (values might be summarized by toString): {}", reviewData);
            return ResponseEntity.created(URI.create("/api/reviews/" + savedReview.getId()))
                    .body(reviewData);

        } catch (Exception e) {
            logger.error("创建评论时发生意外错误. Review attempted: {}, Principal: {}", review, (principal != null ? principal.getName() : "null"), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "评论提交失败，请稍后重试。")
            );
        }
    }

    // 获取商品评论（GET方法）
    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getItemReviews(@PathVariable("itemId") String itemId) {
        logger.info("<<<<< ENTERED ReviewController.getItemReviews for itemId: {} >>>>>", itemId);
        if (itemId == null || itemId.trim().isEmpty()) {
             logger.warn("Validation failed: ItemId is null or empty in getItemReviews.");
             return ResponseEntity.badRequest().body(Map.of("error", "商品ID不能为空"));
        }
        try {
            logger.info("Attempting to find reviews by itemId: {}", itemId);
            List<Review> reviews = reviewRepository.findByItemId(itemId);
            logger.info("Found {} reviews for itemId: {}", reviews.size(), itemId);
            
            List<Map<String, Object>> response = reviews.stream()
                .map(review -> {
                    Map<String, Object> reviewData = new HashMap<>();
                    reviewData.put("id", review.getId());
                    reviewData.put("itemId", review.getItemId());
                    reviewData.put("rating", review.getRating());
                    reviewData.put("content", review.getContent());
                    reviewData.put("createdAt", review.getCreatedAt());

                    Map<String, Object> userInfo = new HashMap<>();
                    if (review.getUserId() != null && !review.getUserId().trim().isEmpty()) {
                        Optional<User> userOptional = userRepository.findById(review.getUserId());
                        User user = userOptional.orElseGet(() -> {
                            logger.warn("User not found for userId: {} (associated with reviewId: {}). Using default '已注销用户'.", review.getUserId(), review.getId());
                            User dummy = new User();
                            dummy.setUsername("已注销用户");
                            dummy.setAvatar("/default-avatar.png");
                            return dummy;
                        });
                        userInfo.put("username", user.getUsername());
                        // Again, be mindful of what user.getAvatar() returns for the response
                        userInfo.put("avatar", user.getAvatar() != null ? user.getAvatar() : "/default-avatar.png");
                    } else {
                        logger.warn("ReviewId: {} has null or empty userId. Using '未知用户'.", review.getId());
                        userInfo.put("username", "未知用户");
                        userInfo.put("avatar", "/default-avatar.png");
                    }
                    reviewData.put("user", userInfo);
                    return reviewData;
                })
                .collect(Collectors.toList());

            logger.info("Successfully prepared {} reviews for response for itemId: {}", response.size(), itemId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("为商品 {} 获取评论时出错:", itemId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "加载评论失败: " + e.getMessage()));
        }
    }
}
