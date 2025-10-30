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
	private String nomeProduto;
	
	@Column(name = "descricao")
	private String descricao;

	@Column(name = "preco", precision = 10, scale = 2, nullable = false)
	private BigDecimal preco;

	@Column(name = "estoque", nullable = false)
	private Integer estoque;
	
	@Column(name = "fotoProduto")
	private String imgUrl;

	public Produto(Long idProduto, String nomeProduto, BigDecimal preco, Integer estoque, String imgUrl) {
		super();
		this.idProduto = idProduto;
		this.nomeProduto = nomeProduto;
		this.preco = preco;
		this.estoque = estoque;
		this.imgUrl = imgUrl;
	}
	
	public Produto() {
		
	}
	
	public Long getIdProduto() {
		return idProduto;
	}

	public void setIdProduto(Long idProduto) {
		this.idProduto = idProduto;
	}

	public String getNomeProduto() {
		return nomeProduto;
	}

	public void setNomeProduto(String nomeProduto) {
		this.nomeProduto = nomeProduto;
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

	public String getImgUrl() {
		return imgUrl;
	}

	public void setImgUrl(String imgUrl) {
		this.imgUrl = imgUrl;
	}
}
