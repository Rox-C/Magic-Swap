package tech.roxtang.magicswap.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String email;
    private String username;
    private String password;
    private String signature;
    private String description;
    private String avatar;
    private boolean isMerchant = false;
    private String shopName;

    // Getters and Setters
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public boolean getIsMerchant() { return isMerchant; }
    public void setIsMerchant(boolean isMerchant) { this.isMerchant = isMerchant; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}