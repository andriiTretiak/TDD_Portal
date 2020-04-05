package com.tretiak.portal.mind;

import com.tretiak.portal.mind.vm.MindVM;
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
    MindVM createMind(@Valid @RequestBody Mind mind, @CurrentUser User user){
        return mindService.save(user, mind);
    }

    @GetMapping("/minds")
    Page<MindVM> getAllMinds(Pageable pageable){
        return mindService.getAllMinds(pageable).map(MindVM::new);
    }

    @GetMapping("/users/{username}/minds")
    Page<MindVM> getMindsOfUser(@PathVariable String username, Pageable pageable){
        return mindService.getMindOfUser(username, pageable).map(MindVM::new);
    }
}
