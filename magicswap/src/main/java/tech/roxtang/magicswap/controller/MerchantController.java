package tech.roxtang.magicswap.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
    public ResponseEntity<?> registerMerchant(
        Authentication authentication,
        @RequestBody Map<String, String> request
    ) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            String shopName = request.get("shopName");
            
            User updatedUser = merchantService.registerAsMerchant(
                currentUser.getId(), 
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
