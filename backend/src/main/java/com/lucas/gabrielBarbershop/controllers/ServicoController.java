package com.lucas.gabrielBarbershop.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lucas.gabrielBarbershop.entities.Servico;
import com.lucas.gabrielBarbershop.services.ServicoService;

@RestController
@RequestMapping("/servicos")
public class ServicoController {
	
	@Autowired
    private ServicoService servicoService;

    @GetMapping
    public List<Servico> listarTodosServicos() {
        return servicoService.getAllServicos();
    }

    @PostMapping
    public Servico salvarServico(@RequestBody Servico servico) {
        return servicoService.salvarServico(servico);
    }

    @DeleteMapping("/{id}")
    public void deletarServico(@PathVariable Long id) {
        servicoService.deleteServicoById(id);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Servico> updateServico(@PathVariable Long id, @RequestBody Servico servicoDetails) {
        // (Assumindo que seu ServicoService tem um método 'saveServico'
        //  baseado no arquivo 'ServicoService-Logic.java.txt')
        
        servicoDetails.setIdServico(id); // Garante o ID
        
        Servico servicoAtualizado = servicoService.salvarServico(servicoDetails);
        return ResponseEntity.ok(servicoAtualizado);
    }
}
