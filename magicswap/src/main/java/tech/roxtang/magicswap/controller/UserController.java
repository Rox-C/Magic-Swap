package tech.roxtang.magicswap.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import tech.roxtang.magicswap.dto.UserUpdateDTO;
import tech.roxtang.magicswap.model.User;
import tech.roxtang.magicswap.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @PostMapping("/user/update")
    public ResponseEntity<?> updateUser(Authentication authentication, @RequestBody UserUpdateDTO userUpdateDTO) {
        try{
            String email = authentication.getName();
            User user = userRepository.findByEmail(email); 
            if(user == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            if(userUpdateDTO.getUsername() != null){
                user.setUsername(userUpdateDTO.getUsername());
            }
            if(userUpdateDTO.getSignature() != null){
                user.setSignature(userUpdateDTO.getSignature());
            }
            if(userUpdateDTO.getDescription()!= null){
                user.setDescription(userUpdateDTO.getDescription());
            }
            if(userUpdateDTO.getAvatar()!= null){
                user.setAvatar(userUpdateDTO.getAvatar());
            }

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user");
        }
    }
    @GetMapping("/user")
    public User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        if(user.getAvatar() == null) user.setAvatar("");
        if(user.getSignature() == null) user.setSignature("");
        if(user.getDescription() == null) user.setDescription("");
        if(user.getShopName() == null) user.setShopName("");
        return user;
    }

    @PutMapping("/user/avatar")
    public User updateUserAvatar(Authentication authentication, @RequestBody String avatar) {
        if (avatar == null || avatar.isBlank()) {
            throw new IllegalArgumentException("头像数据不能为空");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username);
        user.setAvatar(avatar);
        return userRepository.save(user);
    }
}