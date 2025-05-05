package tech.roxtang.magicswap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import tech.roxtang.magicswap.utils.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
            // 允许公开访问的路径 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
            .requestMatchers("/api/auth/**").permitAll()               // 保留原登录注册
            .requestMatchers(HttpMethod.GET, "/api/user").permitAll()   // 保留原用户信息
            .requestMatchers(HttpMethod.GET, "/api/items/{itemId}").permitAll()      // 新增：商品详情页
            .requestMatchers(HttpMethod.GET, "/api/reviews/item/**").permitAll()     // 新增：商品评价列表
            // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
            // 其他所有请求需要认证 ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
            .requestMatchers(HttpMethod.GET, "/api/wardrobe").permitAll()
            .anyRequest().authenticated()
            )
        .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
        return http.build();
        // http
        //     // 配置CORS（可选）
        //     //.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        //     // 禁用CSRF保护
        //     .csrf(csrf -> csrf.disable())
        //     // 配置请求权限
        //     .authorizeHttpRequests(auth -> auth
        //         // 允许所有请求无需认证
        //         .anyRequest().permitAll()
        //     );
        
        // return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token", "*"));
        configuration.addExposedHeader("Authorization");
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}