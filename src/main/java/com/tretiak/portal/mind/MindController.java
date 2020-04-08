package com.tretiak.portal.mind;

import com.tretiak.portal.mind.vm.MindVM;
import com.tretiak.portal.shared.CurrentUser;
import com.tretiak.portal.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/1.0")
public class MindController {

    private final MindService mindService;

    public MindController(MindService mindService) {
        this.mindService = mindService;
    }

    @PostMapping("/minds")
    MindVM createMind(@Valid @RequestBody Mind mind, @CurrentUser User user){
        return new MindVM(mindService.save(user, mind));
    }

    @GetMapping("/minds")
    Page<MindVM> getAllMinds(Pageable pageable){
        return mindService.getAllMinds(pageable).map(MindVM::new);
    }

    @GetMapping("/users/{username}/minds")
    Page<MindVM> getMindsOfUser(@PathVariable String username, Pageable pageable){
        return mindService.getMindOfUser(username, pageable).map(MindVM::new);
    }

    @GetMapping("/minds/{id:[0-9]+}")
    ResponseEntity<?> getMindsRelative(@PathVariable long id, Pageable pageable,
                                       @RequestParam(name = "direction", defaultValue = "after") String direction){
        if(!direction.equalsIgnoreCase("after")){
            return ResponseEntity.ok(mindService.getOldMinds(id, pageable).map(MindVM::new));
        }
        List<MindVM> newMinds = mindService.getNewMinds(id, pageable).stream()
                .map(MindVM::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(newMinds);
    }

    @GetMapping("/users/{username}/minds/{id:[0-9]+}")
    ResponseEntity<?> getMindsRelativeForUser(@PathVariable String username, @PathVariable long id, Pageable pageable,
                                    @RequestParam(name = "direction", defaultValue = "after") String direction){
        if(!direction.equalsIgnoreCase("after")){
            return ResponseEntity.ok(mindService.getOldMindsForUser(username, id, pageable).map(MindVM::new));
        }
        List<MindVM> newMinds = mindService.getNewMindsOfUser(username, id, pageable).stream()
                .map(MindVM::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(newMinds);
    }
}
