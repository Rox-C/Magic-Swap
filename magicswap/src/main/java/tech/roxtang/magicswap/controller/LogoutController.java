package tech.roxtang.magicswap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
public class LogoutController {
    
    @PostMapping("/api/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // 实际项目需实现令牌失效逻辑（如加入黑名单）
            return ResponseEntity.ok("退出成功");
        }
        return ResponseEntity.badRequest().body("无效请求");
    }
}