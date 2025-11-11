package com.lucas.gabrielBarbershop.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.Servico;
import com.lucas.gabrielBarbershop.repositories.AgendamentoRepository;
import com.lucas.gabrielBarbershop.repositories.ServicoRepository;

@Service
public class ServicoService {

	@Autowired
	private ServicoRepository servicoRepository;
	
	@Autowired
	private AgendamentoRepository agendamentoRepository;
	
	public List<Servico> getAllServicos() {
		return servicoRepository.findAll();
	}
	
	public Servico salvarServico(Servico servico) {
		return servicoRepository.save(servico);
	}
	
	public void deleteServicoById(Long id) {
	    // 3. Verifica se o serviço existe
	    if (!servicoRepository.existsById(id)) {
	        throw new RuntimeException("Serviço não encontrado com ID: " + id);
	    }

	    // 4. VERIFICA SE EXISTE ALGUM AGENDAMENTO 'Pendente' COM ESTE SERVIÇO
	    // (O seu 'AgendamentoRepository' precisa ter este método 'existsByServicoIdServicoAndStatus')
	    boolean hasPendingAgendamentos = agendamentoRepository.existsByServicoIdServicoAndStatus(id, "Pendente");

	    if (hasPendingAgendamentos) {
	        // 5. Se houver, lança um erro que o front-end vai capturar
	        throw new DataIntegrityViolationException("Não é possível excluir o serviço, pois ele está vinculado a agendamentos Pendentes.");
	    }

	    // 6. Se não houver pendentes, permite a exclusão
	    servicoRepository.deleteById(id);
	}
}
