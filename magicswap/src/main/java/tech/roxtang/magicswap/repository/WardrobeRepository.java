package tech.roxtang.magicswap.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import tech.roxtang.magicswap.model.Wardrobe;

import java.util.List;
import java.util.Optional;

public interface WardrobeRepository extends MongoRepository<Wardrobe, String> {

    // 使用唯一索引快速定位
    @Query("{ 'userId' : ?0 }")
    Optional<Wardrobe> findByUserId(String userId);

    // 判断衣物是否存在于衣橱
    @Query(value = "{ 'userId' : ?0, 'clothingIds' : ?1 }", exists = true)
    boolean containsClothing(String userId, String clothingId);

    // 批量更新衣物列表（原子操作）
    @Query("{ 'userId' : ?0 }")
    void addClothingByIds(String userId, List<String> newClothingIds);
}
