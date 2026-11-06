package com.backend.backend.controllers.post;

import com.backend.backend.dtos.response.ContadorResponse;
import com.backend.backend.services.interfaces.domain.ContadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contador")
@RequiredArgsConstructor
public class ContadorPostController {

    private final ContadorService contadorService;

    @PostMapping("/incrementar")
    public ContadorResponse incrementar() {
        return contadorService.incrementar();
    }
}
