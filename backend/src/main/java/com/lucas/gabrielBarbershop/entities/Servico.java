package com.lucas.gabrielBarbershop.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_servicos")
public class Servico {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idServico", nullable = false)
	private Long idServico;
	
	@Column(name = "nomeServico", length = 50)
	private String nomeServico;
	
	@Column(name = "preco", nullable = false, precision = 5, scale = 2)
	private BigDecimal preco;
	
	@Column(name = "duracao")
	private Integer duracao;

	public Servico(Long idServico, String nomeServico, BigDecimal preco, Integer duracao) {
		super();
		this.idServico = idServico;
		this.nomeServico = nomeServico;
		this.preco = preco;
		this.duracao = duracao;
	}
	
	public Servico() {
		
	}

	public Long getIdServico() {
		return idServico;
	}

	public void setIdServico(Long idServico) {
		this.idServico = idServico;
	}

	public String getNomeServico() {
		return nomeServico;
	}

	public void setNomeServico(String nomeServico) {
		this.nomeServico = nomeServico;
	}
	
	public BigDecimal getPreco() {
		return preco;
	}

	public void setPreco(BigDecimal preco) {
		this.preco = preco;
	}

	public Integer getDuracao() {
		return duracao;
	}

	public void setDuracao(Integer duracao) {
		this.duracao = duracao;
	}
}
