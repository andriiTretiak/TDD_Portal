package com.tretiak.portal.mind;

import com.tretiak.portal.shared.CurrentUser;
import com.tretiak.portal.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/minds")
    Page<?> getAllMinds(Pageable pageable){
        return mindService.getAllMinds(pageable);
    }
}
