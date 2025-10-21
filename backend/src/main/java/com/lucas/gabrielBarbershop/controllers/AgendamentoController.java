package com.lucas.gabrielBarbershop.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucas.gabrielBarbershop.entities.Agendamento;
import com.lucas.gabrielBarbershop.services.AgendamentoService;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {
	
	@Autowired
    private AgendamentoService agendamentoService;

    @GetMapping
    public List<Agendamento> listarTodosAgendamentos() {
        return agendamentoService.getAllAgendamentos();
    }

    @GetMapping("/cliente/{id}")
    public List<Agendamento> listarAgendamentoPorCliente(@PathVariable Long id) {
        return agendamentoService.listarAgendamentoPorCliente(id);
    }

    @PostMapping
    public Agendamento salvarAgendamento(@RequestBody Agendamento agendamento) {
        return agendamentoService.salvarAgendamento(agendamento);
    }

    @DeleteMapping("/{id}")
    public void deletarAgendamento(@PathVariable Long id) {
        agendamentoService.deletarAgendamentoById(id);
    }
}
