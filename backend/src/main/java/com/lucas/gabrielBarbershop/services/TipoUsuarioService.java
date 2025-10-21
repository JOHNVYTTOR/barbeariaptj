package com.lucas.gabrielBarbershop.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.TipoUsuario;
import com.lucas.gabrielBarbershop.repositories.TipoUsuarioRepository;

@Service
public class TipoUsuarioService {

	@Autowired
	private TipoUsuarioRepository tipoUsuarioRepository;
	
	public TipoUsuario saveTipoUsuario(TipoUsuario tipoUsuario) {
		return tipoUsuarioRepository.save(tipoUsuario);
	}
	
	public List<TipoUsuario> getAllTipoUsuario() {
		return tipoUsuarioRepository.findAll();
	}
	
	public TipoUsuario getTipoUsuarioById(Long id) {
		return tipoUsuarioRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Tipo usuário não encontrado"));
	}
	
	public void deleteTipoUsuario(Long id) {
		tipoUsuarioRepository.deleteById(id);
	}
	
}
