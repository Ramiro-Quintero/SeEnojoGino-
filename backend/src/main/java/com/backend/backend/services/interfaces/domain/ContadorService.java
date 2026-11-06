package com.backend.backend.services.interfaces.domain;

import com.backend.backend.dtos.response.ContadorResponse;

public interface ContadorService {

    ContadorResponse obtenerTotal();

    ContadorResponse incrementar();
}