package tech.roxtang.magicswap.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import tech.roxtang.magicswap.model.Review;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByItemId(String itemId);
}
