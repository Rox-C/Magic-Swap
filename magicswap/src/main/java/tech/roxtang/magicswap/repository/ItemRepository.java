package tech.roxtang.magicswap.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import tech.roxtang.magicswap.model.Item;
import java.util.List;

public interface ItemRepository extends MongoRepository<Item, String> {
    List<Item> findByUserId(String userId);
}