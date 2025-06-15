package tech.roxtang.magicswap.impl;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tech.roxtang.magicswap.repository.UserRepository;
import tech.roxtang.magicswap.service.MerchantService;
import tech.roxtang.magicswap.model.User;
import tech.roxtang.magicswap.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@Service
public class MerchantImpl implements MerchantService {
    private UserRepository userRepository;

    @Autowired
    public MerchantImpl(UserRepository uR) {
        this.userRepository = uR;
    }

    @Override
    @Transactional
    public User registerAsMerchant(String userId, String shopName) {
        try{
            User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
            
            // System.out.println("更新商铺Updated User: " + user.getId() + ", shopName: " + shopName);
            if (user.getIsMerchant()) {
                throw new IllegalStateException("用户已经是商家");
            }
            
            if (shopName == null || shopName.trim().isEmpty()) {
                throw new IllegalArgumentException("店铺名称不能为空");
            }
            
            user.setIsMerchant(true);
            user.setShopName(shopName);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("注册商家失败: " + e.getMessage());
        } catch (IllegalStateException e) {
            throw new IllegalStateException("注册商家失败: " + e.getMessage());
        }

    }
}
