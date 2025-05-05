package tech.roxtang.magicswap.model;

import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.web.multipart.MultipartFile;
import javax.validation.constraints.*;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "items")
public class Item {
    @Id
    private String id;

    @NotNull(message = "商品标题不能为空")
    @Size(min = 1, max = 100, message = "标题长度应在1-100个字符之间")
    private String title;

    @NotNull(message = "商品描述不能为空")
    @Size(min = 10, max = 1000, message = "描述长度应在10-1000个字符之间")
    private String description;

    @DecimalMin(value = "0.01", message = "价格必须大于0")
    private Double price;

    @NotNull
    @Size(min = 1, max = 5, message = "至少1张，最多5张图片")
    private List<String> images = new ArrayList<>();  // Base64编码字符串列表

    private List<String> imageTypes = new ArrayList<>(); // 图片MIME类型列表

    private String userId;

    @CreatedDate
    private LocalDateTime createTime;

    @LastModifiedDate
    private LocalDateTime updateTime;

    // 核心Base64编码方法
    public void setImages(MultipartFile[] files) throws IOException {
        this.images.clear();
        this.imageTypes.clear();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            
            // 编码为Base64字符串
            String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            this.images.add(base64);
            
            // 记录图片类型
            this.imageTypes.add(file.getContentType());
        }
    }

    // 其他字段的getter/setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; } // 兼容直接设置

    public List<String> getImageTypes() { return imageTypes; }
    public void setImageTypes(List<String> imageTypes) { this.imageTypes = imageTypes; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getCreateTime() { return createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
}