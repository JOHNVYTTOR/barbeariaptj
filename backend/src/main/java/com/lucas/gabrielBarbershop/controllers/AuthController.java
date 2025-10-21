package com.lucas.gabrielBarbershop.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucas.gabrielBarbershop.config.JwtService;
import com.lucas.gabrielBarbershop.entities.Usuario;
import com.lucas.gabrielBarbershop.services.CustomUserDetailsService;
import com.lucas.gabrielBarbershop.services.UsuarioService;

import java.util.Map;

// --- DTOs (Data Transfer Objects) ---
// Você pode criar estas classes em arquivos separados se preferir

class LoginRequest {
    private String email;
    private String password;
    // Getters e Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class AuthResponse {
    private String token;
    private Usuario user; 

    public AuthResponse(String token, Usuario user) {
        this.token = token;
        this.user = user;
    }
    // Getters
    public String getToken() { return token; }
    public Usuario getUser() { return user; }
}

// --- Fim dos DTOs ---


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UsuarioService usuarioService; 

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
            String token = jwtService.generateToken(userDetails);

            Usuario usuarioCompleto = usuarioService.getUsuarioByEmail(loginRequest.getEmail());
            if (usuarioCompleto != null) {
                usuarioCompleto.setSenha(null); // NUNCA retorne a senha
            }

            return ResponseEntity.ok(new AuthResponse(token, usuarioCompleto)); 

        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                  .body(Map.of("message", "E-mail ou senha inválidos."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Usuario> registerUser(@RequestBody Usuario usuario) {
        // A lógica de definir o TipoUsuario como "Cliente" já está no seu UsuarioService
        Usuario novoUsuario = usuarioService.saveUsuario(usuario);
        novoUsuario.setSenha(null); // Nunca retorne a senha
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }
}