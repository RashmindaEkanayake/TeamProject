package com.inventory.system.config;

import com.inventory.system.security.CustomUserDetailsService;
import com.inventory.system.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
  @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}")
  private String allowedOrigins;

  @Autowired private CustomUserDetailsService customUserDetailsService;

  @Autowired private JwtAuthenticationFilter jwtAuthenticationFilter;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(customUserDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig)
      throws Exception {
    return authConfig.getAuthenticationManager();
  }

@Bean
public CorsConfigurationSource corsConfigurationSource() {

    System.out.println("CORS ALLOWED ORIGINS LOADED: " + allowedOrigins);

    CorsConfiguration configuration = new CorsConfiguration();

    // Read allowed origins directly from Railway environment variable
    configuration.setAllowedOrigins(
        java.util.Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList()
    );

    configuration.setAllowedMethods(
        List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
    );

    configuration.setAllowedHeaders(List.of("*"));

    configuration.setAllowCredentials(false);

    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(HttpMethod.POST, "/api/auth/login")
                    .permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/api/sales-reps/**",
                        "/api/suppliers/**",
                        "/api/goods-receiving/**",
                        "/api/reports/**",
                        "/api/orders/pending",
                        "/api/price-approvals/pending")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/inventory/*/adjust")
                    .hasRole("ADMIN")
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/orders/*/approve",
                        "/api/orders/*/reject",
                        "/api/price-approvals/*/approve",
                        "/api/price-approvals/*/reject")
                    .hasRole("ADMIN")
                    .anyRequest()
                    .hasAnyRole("ADMIN", "SALES_REP"))
        .exceptionHandling(
            errors ->
                errors
                    .authenticationEntryPoint(
                        (req, res, ex) -> {
                          res.setStatus(401);
                          res.setContentType("application/json");
                          res.getWriter()
                              .write(
                                  "{\"status\":401,\"message\":\"Authentication required or token"
                                      + " expired\"}");
                        })
                    .accessDeniedHandler(
                        (req, res, ex) -> {
                          res.setStatus(403);
                          res.setContentType("application/json");
                          res.getWriter().write("{\"status\":403,\"message\":\"Access denied\"}");
                        }))
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
