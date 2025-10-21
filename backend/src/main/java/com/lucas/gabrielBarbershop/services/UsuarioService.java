package com.lucas.gabrielBarbershop.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.TipoUsuario;
import com.lucas.gabrielBarbershop.entities.Usuario;
import com.lucas.gabrielBarbershop.repositories.TipoUsuarioRepository;
import com.lucas.gabrielBarbershop.repositories.UsuarioRepository;

@Service
public class UsuarioService {
	
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private TipoUsuarioRepository tipoUsuarioRepository;
	
	public List<Usuario> getAllUsuarios() {
		return usuarioRepository.findAll();
	}
	
	public Optional<Usuario> getUsuarioById(Long id) {
		return usuarioRepository.findById(id);
	}
	
	public Usuario getUsuarioByEmail(String email) {
		return usuarioRepository.findByEmail(email);
	}
	
	public Usuario saveUsuario(Usuario usuario) {
		if(usuario.getTipoUsuario() == null) {
			TipoUsuario cliente = tipoUsuarioRepository.findById(1L)
					.orElseThrow(() -> new RuntimeException("Tipo CLIENTE não encontrado!"));
			usuario.setTipoUsuario(cliente);
		}
		return usuarioRepository.save(usuario);
	}
	
	public void deleteUsuarioById(Long id) {
		usuarioRepository.deleteById(id);
	}
	
	public Usuario autenticarUsuario(String email, String senha) {
		Usuario usuario = usuarioRepository.findByEmail(email);
		
		if(usuario != null && usuario.getSenha().equals(senha)) {
			return usuario;
		}
		return null;
	}
}
