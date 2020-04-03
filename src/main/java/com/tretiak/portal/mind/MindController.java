package com.tretiak.portal.mind;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/1.0")
public class MindController {

    @PostMapping("/minds")
    void createMind(){

    }
}
