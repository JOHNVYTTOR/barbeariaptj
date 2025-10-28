package com.lucas.gabrielBarbershop.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.HorarioDisponivel;
import com.lucas.gabrielBarbershop.repositories.HorarioDisponivelRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class HorarioDisponivelService {

	@Autowired
    private HorarioDisponivelRepository horarioDisponivelRepository;

    public List<HorarioDisponivel> listarTodosHorarios() {
        return horarioDisponivelRepository.findAll();
    }

    public List<HorarioDisponivel>listarDisponiveisPorData(LocalDate data) { LocalDateTime inicio = data.atStartOfDay();
    LocalDateTime fim = data.atTime(23, 59, 59); return
    horarioDisponivelRepository.findByDisponivelTrueAndHorariosBetween(inicio, fim); } 
    
    public HorarioDisponivel salvarHorarioDisponivel(HorarioDisponivel horario) {
        return horarioDisponivelRepository.save(horario);
    }

    public void deletarHorarioDisponivel(Long id) {
        horarioDisponivelRepository.deleteById(id);
    }
    
    public void alterarDisponibilidade(Long id, boolean disponivel) { 
    		HorarioDisponivel horario = horarioDisponivelRepository.findById(id) 
    				.orElseThrow(() -> new RuntimeException("Horário não encontrado"));
    		horario.setDisponivel(disponivel); 
    		horarioDisponivelRepository.save(horario); }
}
