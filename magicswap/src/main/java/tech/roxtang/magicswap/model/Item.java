package tech.roxtang.magicswap.model;

import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.web.multipart.MultipartFile;
import javax.validation.constraints.*;
import java.io.IOException;
import java.time.LocalDateTime;

@Document(collection = "items")
public class Item {
    @Id
    private String id;

    @NotNull(message = "标题不能为空")
    @Size(min = 1, max = 100)
    private String title;

    @NotNull(message = "简介不能为空")
    @Size(min = 10, max = 500)
    private String brief;

    @NotNull(message = "详细信息不能为空")
    // 移除了 @Lob 注解，因为 MongoDB 不需要
    private String details;

    @NotNull(message = "图片不能为空")
    private String image;

    private String userId;

    @CreatedDate
    private LocalDateTime createTime;

    @LastModifiedDate
    private LocalDateTime updateTime;

    // 图片处理方法
    public void setImage(String image) {
        this.image = image;
    }

    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getBrief() { return brief; }
    public String getDetails() { return details; }
    public String getImage() { return image; }
    public String getUserId() { return userId; }
    public LocalDateTime getCreateTime() { return createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setBrief(String brief) { this.brief = brief; }
    public void setDetails(String details) { this.details = details; }
    public void setUserId(String userId) { this.userId = userId; }
}