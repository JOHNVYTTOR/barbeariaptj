package com.lucas.gabrielBarbershop.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_horarioDisponivel")
public class HorarioDisponivel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "idHorarioDisponivel", nullable = false)
	private Long idHorarioDisponivel;
	
	@Column(name = "horarios", nullable = false, unique = true)
	private LocalDateTime horarios;
	
	@Column(name= "disponivel")
	private boolean disponivel = true;
	
	private boolean isBooked;
	
	public HorarioDisponivel(Long idHorarioDisponivel, LocalDateTime horarios, boolean disponivel, boolean isBooked) {
		super();
		this.idHorarioDisponivel = idHorarioDisponivel;
		this.horarios = horarios;
		this.disponivel = disponivel;
		this.isBooked = isBooked;
	}

	public HorarioDisponivel() {
		
	}

	public Long getIdHorarioDisponivel() {
		return idHorarioDisponivel;
	}

	public void setIdHorarioDisponivel(Long idHorarioDisponivel) {
		this.idHorarioDisponivel = idHorarioDisponivel;
	}

	public LocalDateTime getHorarios() {
		return horarios;
	}

	public void setHorarios(LocalDateTime horarios) {
		this.horarios = horarios;
	}

	public boolean isDisponivel() {
		return disponivel;
	}

	public void setDisponivel(boolean disponivel) {
		this.disponivel = disponivel;
	}

	public boolean isBooked() {
		return isBooked;
	}

	public void setBooked(boolean isBooked) {
		this.isBooked = isBooked;
	}
}
