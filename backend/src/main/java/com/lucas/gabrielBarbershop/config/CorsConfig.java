package com.lucas.gabrielBarbershop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
	/*
	 * @Bean public WebMvcConfigurer corsConfigurer() { return new
	 * WebMvcConfigurer() {
	 * 
	 * @Override public void addCorsMappings(CorsRegistry registry) {
	 * registry.addMapping("/**") .allowedOrigins("http://localhost:5173")
	 * .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
	 * .allowedHeaders("*") .allowCredentials(true); } };
	 * 
	 * }
	 */

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**").allowedOrigins("*") // Permitir qualquer origem
						.allowedMethods("POST", "GET", "OPTIONS", "PUT", "DELETE", "HEAD"); // Métodos permitidos
			}
		};
	}
}
