package tech.roxtang.magicswap.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "wardrobes")
public class Wardrobe {
    
    @Id
    private String id;  // MongoDB自动生成的_id
    
    @Indexed(unique = true)
    private String userId;
    
    private List<String> clothingIds = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    // 构造方法
    public Wardrobe() {}  // 无参构造器
    
    public Wardrobe(String userId) {
        this.userId = userId;
    }

    // 辅助方法
    public void addClothing(String clothingId) {
        if (!clothingIds.contains(clothingId)) {
            clothingIds.add(clothingId);
        }
    }

    public void removeClothing(String clothingId) {
        clothingIds.remove(clothingId);
    }

    // Getters & Setters
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<String> getClothingIds() { return clothingIds; }
    public void setClothingIds(List<String> clothingIds) { this.clothingIds = clothingIds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
