package com.lucas.gabrielBarbershop.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.Agendamento;
import com.lucas.gabrielBarbershop.entities.TipoUsuario;
import com.lucas.gabrielBarbershop.entities.Usuario;
import com.lucas.gabrielBarbershop.repositories.AgendamentoRepository;
import com.lucas.gabrielBarbershop.repositories.TipoUsuarioRepository;
import com.lucas.gabrielBarbershop.repositories.UsuarioRepository;

@Service
public class UsuarioService {
	
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private AgendamentoRepository agendamentoRepository;
	
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
	
	public Usuario saveUsuarioAdmin(Usuario usuario) {
	    if (usuario.getTipoUsuario() == null || usuario.getTipoUsuario().getIdTipoUsuario() == null) {
	        throw new RuntimeException("O tipoUsuario deve ser enviado com um ID válido!");
	    }

	    // Captura o ID enviado no JSON: "tipoUsuario": { "tipoUsuario": 2 }
	    Long tipoId = usuario.getTipoUsuario().getIdTipoUsuario(); // ou getTipoUsuario() se seu getter tiver esse nome

	    // Busca no banco o TipoUsuario correspondente
	    TipoUsuario tipo = tipoUsuarioRepository.findById(tipoId)
	            .orElseThrow(() -> new RuntimeException("TipoUsuario com ID " + tipoId + " não existe no banco."));

	    // Substitui o objeto enviado no JSON pelo existente no banco
	    usuario.setTipoUsuario(tipo);

	    // Agora salva com segurança
	    return usuarioRepository.save(usuario);
	}
	
	public void deleteUsuarioById(Long id) {
        // Verifica se o usuário existe
		if (!usuarioRepository.existsById(id)) {
			throw new RuntimeException("Usuário não encontrado com ID: " + id);
		}

        // VERIFICA SE O USUÁRIO (PROFISSIONAL) TEM AGENDAMENTOS PENDENTES
		boolean hasPendingAgendamentos = agendamentoRepository.existsByProfissionalIdUsuarioAndStatus(id, "Pendente");

		if (hasPendingAgendamentos) {
			// Se tiver pendente, bloqueia a exclusão
			throw new DataIntegrityViolationException("Não é possível excluir. Este profissional ainda possui agendamentos Pendentes.");
		}

        // Se não tem pendente, precisamos "desvincular" os agendamentos concluídos/cancelados
        // ANTES de excluir o usuário, para evitar o erro do banco de dados.

        // 3. Encontra todos os agendamentos (concluídos/cancelados) ligados a ele
        List<Agendamento> agendamentosDoProfissional = agendamentoRepository.findAllByProfissionalIdUsuario(id);

        // 4. "Desvincula" o profissional de cada agendamento
        for (Agendamento ag : agendamentosDoProfissional) {
            ag.setProfissional(null); // Define o profissional_id como NULL
            agendamentoRepository.save(ag); // Salva a alteração
        }

        // 5. AGORA que não há mais vínculos, exclui o usuário (profissional)
		usuarioRepository.deleteById(id);
	}
	
	public Usuario autenticarUsuario(String email, String senha) {
		Usuario usuario = usuarioRepository.findByEmail(email);
		
		if(usuario != null && usuario.getSenha().equals(senha)) {
			return usuario;
		}
		return null;
	}

	public Usuario updateUsuario(Long id, Usuario usuarioDetails) {
        // 1. Busca o usuário que já existe no banco
        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));

        // 2. Atualiza os campos simples
        usuarioExistente.setNomeUsuario(usuarioDetails.getNomeUsuario());
        usuarioExistente.setEmail(usuarioDetails.getEmail());
        usuarioExistente.setCpf(usuarioDetails.getCpf());
        usuarioExistente.setTelefone(usuarioDetails.getTelefone());
        usuarioExistente.setFotoUrl(usuarioDetails.getFotoUrl());

        // 3. Lógica da Senha:
        // O front-end (Dashboard) envia a senha como NULL ou VAZIA se não quiser alterar.
        if (usuarioDetails.getSenha() != null && !usuarioDetails.getSenha().isEmpty()) {
            // (Se você usa BCRIPT, a lógica de encode viria aqui)
            usuarioExistente.setSenha(usuarioDetails.getSenha());
        }
        // Se a senha vier vazia, ele NÃO FAZ NADA (preserva a senha antiga).

        // 4. Lógica do TipoUsuario (para garantir que é um Admin)
        if (usuarioDetails.getTipoUsuario() != null && usuarioDetails.getTipoUsuario().getIdTipoUsuario() != null) {
            Long tipoId = usuarioDetails.getTipoUsuario().getIdTipoUsuario();
            
            TipoUsuario tipo = tipoUsuarioRepository.findById(tipoId)
                    .orElseThrow(() -> new RuntimeException("TipoUsuario com ID " + tipoId + " não existe."));
            
            usuarioExistente.setTipoUsuario(tipo);
        } else {
            // Isso não deve acontecer se o front-end enviar o payload correto
            throw new RuntimeException("O TipoUsuario é obrigatório para atualização.");
        }

        // 5. Salva o usuário mesclado
        return usuarioRepository.save(usuarioExistente);
    }

}


