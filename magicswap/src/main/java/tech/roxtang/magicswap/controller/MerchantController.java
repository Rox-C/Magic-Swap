package tech.roxtang.magicswap.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import tech.roxtang.magicswap.repository.UserRepository;
import java.util.Collections;
import java.util.Map;

import tech.roxtang.magicswap.service.MerchantService;
import tech.roxtang.magicswap.model.User;
import tech.roxtang.magicswap.repository.*;

@RestController
@RequestMapping("/api/merchant")
public class MerchantController {
    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @PostMapping("/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> registerMerchant(
        @RequestBody Map<String, String> request , 
        @AuthenticationPrincipal String userId
    ) {
        try {
            // String userEmail = authentication.getName();
            // User currentUser = userRepository.findByEmail(userEmail);
            String shopName = request.get("shopName");
            
            System.out.println("更新商铺Updated User: " + userId);
            User updatedUser = merchantService.registerAsMerchant(
                userId,
                shopName
            );
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Collections.singletonMap("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
