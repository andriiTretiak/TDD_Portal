package com.tretiak.portal.mind;

import com.tretiak.portal.shared.CurrentUser;
import com.tretiak.portal.user.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/1.0")
public class MindController {

    private final MindService mindService;

    public MindController(MindService mindService) {
        this.mindService = mindService;
    }

    @PostMapping("/minds")
    void createMind(@Valid @RequestBody Mind mind, @CurrentUser User user){
        mindService.save(user, mind);
    }
}
