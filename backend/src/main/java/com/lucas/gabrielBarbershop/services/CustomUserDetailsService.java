package com.lucas.gabrielBarbershop.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.Usuario;
import com.lucas.gabrielBarbershop.repositories.UsuarioRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	 @Autowired
	    private UsuarioRepository usuarioRepository;

	    @Override
	    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
	        Usuario usuario = usuarioRepository.findByEmail(email);
	        
	        		if(usuario == null) {
	        			throw new UsernameNotFoundException("Usuário não encontrado " + email);
	        		}

	        // Aqui usamos o nome do tipo de usuário como role
	        String roleName = usuario.getTipoUsuario().getNomeTipoUsuario();

	        return User.builder()
	                .username(usuario.getEmail())
	                .password(usuario.getSenha())
	                .roles(roleName.toUpperCase()) // Ex: ADMIN, CLIENTE, BARBEIRO
	                .build();
	    }
}