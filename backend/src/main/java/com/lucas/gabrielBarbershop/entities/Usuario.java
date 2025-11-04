package com.lucas.gabrielBarbershop.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_usuario")
public class Usuario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idUsuario", nullable = false)
	private Long idUsuario;
	
	@Column(name = "nomeUsuario", nullable = false, length = 100)
	private String nomeUsuario;
	
	@Column(name = "cpf", nullable = false, unique = true, length = 11)
	private String cpf;
	
	@Column(name = "email", nullable = false, length = 50, unique = true)
	private String email;
	
	@Column(name = "senha", nullable = false, length = 255)
	private String senha;
	
	@Column(name = "telefone", nullable = false)
	private String telefone;
	
	@ManyToOne
	@JoinColumn(name = "tipo_usuario_id", nullable = false)
	@JsonIgnoreProperties("usuarios")
	private TipoUsuario tipoUsuario;

	public Usuario(Long idUsuario, String nomeUsuario, String cpf, String email, String senha, String telefone, TipoUsuario tipoUsuario) {
		super();
		this.idUsuario = idUsuario;
		this.nomeUsuario = nomeUsuario;
		this.cpf = cpf;
		this.email = email;
		this.senha = senha;
		this.tipoUsuario = tipoUsuario;
		this.telefone = telefone;
	}
	
	public Usuario() {
		
	}

	public Long getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(Long idUsuario) {
		this.idUsuario = idUsuario;
	}

	public String getNomeUsuario() {
	    return nomeUsuario;
	}

	public void setNomeUsuario(String nomeUsuario) {
	    this.nomeUsuario = nomeUsuario;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public TipoUsuario getTipoUsuario() {
		return tipoUsuario;
	}

	public void setTipoUsuario(TipoUsuario tipoUsuario) {
		this.tipoUsuario = tipoUsuario;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}
}
