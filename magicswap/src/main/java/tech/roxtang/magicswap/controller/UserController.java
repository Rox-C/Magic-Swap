package tech.roxtang.magicswap.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    @GetMapping("/user")
    public User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        if(user.getAvatar() == null) user.setAvatar("");
        if(user.getSignature() == null) user.setSignature("");
        if(user.getDescription() == null) user.setDescription("");
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