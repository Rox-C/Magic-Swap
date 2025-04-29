package tech.roxtang.magicswap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.bson.Document;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Slf4j
@SpringBootApplication
@RequiredArgsConstructor
public class MagicswapApplication implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Autowired
    private MongoProperties mongoProperties; // 注入MongoProperties以获取连接字符串

    public static void main(String[] args) {
        SpringApplication.run(MagicswapApplication.class, args);
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // 测试MongoDB连接
            mongoTemplate.getDb().runCommand(new Document("ping", 1));
            
            // 获取连接字符串
            String connectionString = mongoProperties.getUri(); // 使用MongoProperties获取URI
            log.info("成功连接到MongoDB数据库，URI: {}", connectionString);
        } catch (Exception e) {
            log.error("数据库连接失败: {}", e.getMessage());
        }
    }

    @Component
    @ConfigurationProperties(prefix = "spring.data.mongodb") // 配置MongoProperties
    public static class MongoProperties {
        private String uri;

        public String getUri() {
            return uri;
        }

        public void setUri(String uri) {
            this.uri = uri;
        }
    }
}