package com.lucas.gabrielBarbershop.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucas.gabrielBarbershop.entities.Usuario;
import com.lucas.gabrielBarbershop.services.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

	@Autowired
	private UsuarioService usuarioService;

	@PostMapping("/login")
	   public Usuario login(@RequestBody Usuario loginRequest) {
	       Usuario usuario = usuarioService
	               .autenticarUsuario(loginRequest.getEmail(), loginRequest.getSenha());
	       
	       if(usuario != null) {
	           return usuario;
	       }
	       return null;
	   }
	
	@GetMapping
	public List<Usuario> getAllUsuarios() {
		return usuarioService.getAllUsuarios();
	}
	
	@GetMapping("/{id}")
	public Optional<Usuario> getUsuario(@PathVariable Long id) {
		return usuarioService.getUsuarioById(id);
	}
	
	@PutMapping
	public Usuario editUsuario(@RequestBody Usuario usuario) {
		return usuarioService.saveUsuario(usuario);
	}
	 
	@DeleteMapping("/{id}")
	public void deleteUsuario(@PathVariable Long id) {
		usuarioService.deleteUsuarioById(id);
	}
	
	@PostMapping("/register")
	   public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
	       Usuario novoUsuario = usuarioService.saveUsuario(usuario);
	       return ResponseEntity.ok(novoUsuario);
	   }
}
