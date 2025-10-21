package com.lucas.gabrielBarbershop.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lucas.gabrielBarbershop.entities.HorarioDisponivel;
import com.lucas.gabrielBarbershop.repositories.HorarioDisponivelRepository;

@Service
public class HorarioDisponivelService {

	@Autowired
    private HorarioDisponivelRepository horarioDisponivelRepository;

    public List<HorarioDisponivel> listarTodosHorarios() {
        return horarioDisponivelRepository.findAll();
    }

    public List<HorarioDisponivel> listarHorariosDisponiveis() {
        return horarioDisponivelRepository.findByDisponivelTrue();
    }

    public HorarioDisponivel salvarHorarioDisponivel(HorarioDisponivel horario) {
        return horarioDisponivelRepository.save(horario);
    }

    public void deletarHorarioDisponivel(Long id) {
        horarioDisponivelRepository.deleteById(id);
    }
}
