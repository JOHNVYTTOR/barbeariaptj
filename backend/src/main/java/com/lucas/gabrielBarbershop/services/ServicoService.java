package com.lucas.gabrielBarbershop.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.Servico;
import com.lucas.gabrielBarbershop.repositories.ServicoRepository;

@Service
public class ServicoService {

	@Autowired
	private ServicoRepository servicoRepository;
	
	public List<Servico> getAllServicos() {
		return servicoRepository.findAll();
	}
	
	public Servico salvarServico(Servico servico) {
		return servicoRepository.save(servico);
	}
	
	public void deleteServicoById(Long id) {
		servicoRepository.deleteById(id);
	}
}
