package com.lucas.gabrielBarbershop.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lucas.gabrielBarbershop.entities.HorarioDisponivel;

@Repository
public interface HorarioDisponivelRepository extends JpaRepository<HorarioDisponivel, Long> {
	
	 List<HorarioDisponivel>findByDisponivelTrueAndHorariosBetween(LocalDateTime inicio, LocalDateTime fim);
}
