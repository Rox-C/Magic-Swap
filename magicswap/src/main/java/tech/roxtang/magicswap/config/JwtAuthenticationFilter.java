package tech.roxtang.magicswap.config;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import tech.roxtang.magicswap.utils.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain chain)
            throws ServletException, IOException {
        // 获取请求头中的Authorization字段
        
        String header = request.getHeader("Authorization");
        String token = null;
        String email = null;
        logger.info("Into  JwtAuthenticationFilter");
        logger.info("请求 URI: {}", request.getRequestURI());
        logger.info("请求方法: {}", request.getMethod());
        logger.info("请求头中的 Authorization: {}", header);
        // 检查Authorization头是否以"Bearer "开头
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7); // 去掉"Bearer "前缀
            try {
                // 尝试解析JWT令牌
                logger.info("JWT token : {}", token);
                Claims claims = jwtUtil.parseToken(token);
                if (claims != null) {
                    email = claims.getSubject(); // 获取用户名
                }
            } catch (Exception e) {
                logger.error("JWT Token parsing failed: {}", e.getMessage());
            }
        }

        // 如果用户名存在且SecurityContext中未设置认证信息
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // 创建认证对象
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email, null, null);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            // 设置认证信息到SecurityContext
            logger.info("successfully: {}", email);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 继续过滤器链
        chain.doFilter(request, response);
        logger.info("Final authentication: {}", SecurityContextHolder.getContext().getAuthentication());
    }
}