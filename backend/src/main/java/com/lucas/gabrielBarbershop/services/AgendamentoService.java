package com.lucas.gabrielBarbershop.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.Agendamento;
import com.lucas.gabrielBarbershop.repositories.AgendamentoRepository;

@Service
public class AgendamentoService {

	@Autowired
	private AgendamentoRepository agendamentoRepository;
	
	public List<Agendamento> getAllAgendamentos() {
		return agendamentoRepository.findAll();
	}
	
	 public List<Agendamento> listarAgendamentoPorCliente(Long usuario_idUsuario) {
	        return agendamentoRepository.findByUsuarioIdUsuario(usuario_idUsuario);
	    }
	 
	    public Agendamento salvarAgendamento(Agendamento agendamento) {
	        return agendamentoRepository.save(agendamento);
	    }

	    public void deletarAgendamentoById(Long id) {
	        agendamentoRepository.deleteById(id);
	    }
}
