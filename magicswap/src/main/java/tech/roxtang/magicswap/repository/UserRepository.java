package tech.roxtang.magicswap.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import tech.roxtang.magicswap.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    User findByUsername(String username);
}