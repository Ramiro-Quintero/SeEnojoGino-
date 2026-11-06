package com.backend.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contador")
@Getter
@Setter
public class Contador {

    @Id
    @Column(name = "id_contador")
    private Long idContador;

    @Column(name = "total", nullable = false)
    private Long total;
}
