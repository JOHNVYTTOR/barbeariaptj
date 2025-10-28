package com.lucas.gabrielBarbershop.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lucas.gabrielBarbershop.entities.HorarioDisponivel;
import com.lucas.gabrielBarbershop.services.HorarioDisponivelService;

@RestController
@RequestMapping("/horarios")
public class HorarioDisponivelController {
	
	@Autowired
    private HorarioDisponivelService horarioService;

    @GetMapping
    public List<HorarioDisponivel> listarTodosHorarios() {
        return horarioService.listarTodosHorarios();
    }
    
    @GetMapping("/disponiveis/{data}") 
    public List<HorarioDisponivel> listarDisponiveis(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) { 
    	return horarioService.listarDisponiveisPorData(data);
    	}

    @PostMapping
    public HorarioDisponivel salvarHorarioDisponivel(@RequestBody HorarioDisponivel horario) {
        return horarioService.salvarHorarioDisponivel(horario);
    }

    @DeleteMapping("/{id}")
    public void deletarHorarioDisponivel(@PathVariable Long id) {
        horarioService.deletarHorarioDisponivel(id);
    }
    
    @PutMapping("/{id}/disponibilidade")
    public void alterarDisponibilidade(@PathVariable Long id, @RequestParam boolean disponivel) { 
    	horarioService.alterarDisponibilidade(id, disponivel); 
    	}
}
