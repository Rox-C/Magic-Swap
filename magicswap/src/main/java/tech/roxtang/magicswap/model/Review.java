package tech.roxtang.magicswap.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    private String itemId;      // 关联商品ID
    private String userId;      // 评价用户ID
    private String content;     // 评价内容
    private int rating;         // 评分（1-5星）
    
    @CreatedDate
    private Date createdAt;    // 创建时间（新增关键字段）

    // 必须的getter/setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getRating() { return rating; }
    public void setRating(int rating) { 
        this.rating = Math.max(1, Math.min(rating, 5)); // 强制1-5分范围
    }

    public Date getCreatedAt() { return createdAt; }
    // public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Review() {}
}