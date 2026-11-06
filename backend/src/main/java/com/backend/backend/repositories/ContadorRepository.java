package com.backend.backend.repositories;

import com.backend.backend.models.Contador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ContadorRepository extends JpaRepository<Contador, Long> {

    // UPDATE atómico: no se pisan dos clicks seguidos.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Contador c set c.total = c.total + 1 where c.idContador = 1")
    int incrementar();
}
