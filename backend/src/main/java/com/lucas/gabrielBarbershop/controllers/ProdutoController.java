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

import com.lucas.gabrielBarbershop.entities.Produto;
import com.lucas.gabrielBarbershop.services.ProdutoService;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

	 @Autowired
	    private ProdutoService produtoService;

	    @GetMapping
	    public List<Produto> listar() {
	        return produtoService.listarTodosProdutos();
	    }

	    @GetMapping("/{id}")
	    public Produto buscar(@PathVariable Long id) {
	        return produtoService.buscarProdutoPorId(id).orElse(null);
	    }

	    @PostMapping
	    public Produto salvarProduto(@RequestBody Produto produto) {
	        return produtoService.salvarProduto(produto);
	    }

	    @DeleteMapping("/{id}")
	    public void deletar(@PathVariable Long id) {
	        produtoService.deletarProduto(id);
	    }
}
