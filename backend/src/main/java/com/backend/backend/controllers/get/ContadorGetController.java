package com.backend.backend.controllers.get;

import com.backend.backend.dtos.response.ContadorResponse;
import com.backend.backend.services.interfaces.domain.ContadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contador")
@RequiredArgsConstructor
public class ContadorGetController {

    private final ContadorService contadorService;

    @GetMapping
    public ContadorResponse obtener() {
        return contadorService.obtenerTotal();
    }
}