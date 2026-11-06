package com.backend.backend.services.impl.domain;

import com.backend.backend.dtos.response.ContadorResponse;
import com.backend.backend.models.Contador;
import com.backend.backend.repositories.ContadorRepository;
import com.backend.backend.services.interfaces.domain.ContadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContadorServiceImpl implements ContadorService {

    private static final long ID_CONTADOR = 1L;

    private final ContadorRepository contadorRepository;

    @Override
    @Transactional(readOnly = true)
    public ContadorResponse obtenerTotal() {
        return new ContadorResponse(leerTotal());
    }

    @Override
    @Transactional
    public ContadorResponse incrementar() {
        int filas = contadorRepository.incrementar();

        if (filas == 0) {
            throw new IllegalStateException(
                    "El contador no está inicializado. Revisá la migración V1__contador.sql.");
        }

        return new ContadorResponse(leerTotal());
    }

    private long leerTotal() {
        return contadorRepository.findById(ID_CONTADOR)
                .map(Contador::getTotal)
                .orElseThrow(() -> new IllegalStateException(
                        "El contador no está inicializado. Revisá la migración V1__contador.sql."));
    }
}