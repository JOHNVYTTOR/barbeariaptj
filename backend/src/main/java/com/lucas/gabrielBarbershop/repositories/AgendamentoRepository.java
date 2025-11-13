package com.lucas.gabrielBarbershop.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lucas.gabrielBarbershop.entities.Agendamento;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

	List<Agendamento> findByUsuarioIdUsuario(Long idUsuario);
	
	boolean existsByServicoIdServicoAndStatus(Long idServico, String status);
	
	boolean existsByProfissionalIdUsuarioAndStatus(Long idUsuario, String status);

    // 👇 ADICIONE ESTE MÉTODO (para encontrar todos os agendamentos dele)
    List<Agendamento> findAllByProfissionalIdUsuario(Long idUsuario);	
    
 boolean existsByUsuarioIdUsuarioAndStatus(Long idUsuario, String status);
    
    // 👇 ADICIONE ESTE MÉTODO (para encontrar todos os agendamentos dele como cliente)
    List<Agendamento> findAllByUsuarioIdUsuario(Long idUsuario);
}
