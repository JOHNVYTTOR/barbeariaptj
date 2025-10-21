package com.lucas.gabrielBarbershop.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lucas.gabrielBarbershop.entities.Servico;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {

}
