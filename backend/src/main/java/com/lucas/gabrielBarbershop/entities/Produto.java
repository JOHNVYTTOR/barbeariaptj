package com.lucas.gabrielBarbershop.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_produtos")
public class Produto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idProduto", nullable = false)
	private Long idProduto;

	@Column(name = "nomeProduto", nullable = false)
	private String nome;

	@Column(name = "preco", precision = 10, scale = 2, nullable = false)
	private BigDecimal preco;

	@Column(name = "estoque", nullable = false)
	private Integer estoque;

	public Produto(Long idProduto, String nome, BigDecimal preco, Integer estoque) {
		super();
		this.idProduto = idProduto;
		this.nome = nome;
		this.preco = preco;
		this.estoque = estoque;
	}
	
	public Produto() {
		
	}
	
	public Long getIdProduto() {
		return idProduto;
	}

	public void setIdProduto(Long idProduto) {
		this.idProduto = idProduto;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public BigDecimal getPreco() {
		return preco;
	}

	public void setPreco(BigDecimal preco) {
		this.preco = preco;
	}

	public Integer getEstoque() {
		return estoque;
	}

	public void setEstoque(Integer estoque) {
		this.estoque = estoque;
	}
}
