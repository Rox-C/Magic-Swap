// tech.roxtang.magicswap.dto.UserUpdateDTO.java
package tech.roxtang.magicswap.dto;

public class UserUpdateDTO {
    private String username;
    private String signature;
    private String description;
    private String avatar;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}