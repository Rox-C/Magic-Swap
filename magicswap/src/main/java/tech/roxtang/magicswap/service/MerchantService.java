package tech.roxtang.magicswap.service;
import tech.roxtang.magicswap.model.User;
public interface MerchantService {
    User registerAsMerchant(String userId, String shopName);
}
