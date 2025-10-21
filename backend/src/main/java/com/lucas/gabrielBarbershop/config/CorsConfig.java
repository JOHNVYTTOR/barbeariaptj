package com.lucas.gabrielBarbershop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**") // Permite CORS para todas as rotas
						.allowedOrigins("http://localhost:8080") // <-- MUDE AQUI PARA A PORTA DO VITE
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") 
						.allowedHeaders("*")
						.allowCredentials(true);
			}
		};

	}
}