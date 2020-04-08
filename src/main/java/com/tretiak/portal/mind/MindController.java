package com.tretiak.portal.mind;

import com.tretiak.portal.mind.vm.MindVM;
import com.tretiak.portal.shared.CurrentUser;
import com.tretiak.portal.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;
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
    MindVM createMind(@Valid @RequestBody Mind mind, @CurrentUser User user) {
        return new MindVM(mindService.save(user, mind));
    }

    @GetMapping("/minds")
    Page<MindVM> getAllMinds(Pageable pageable) {
        return mindService.getAllMinds(pageable).map(MindVM::new);
    }

    @GetMapping("/users/{username}/minds")
    Page<MindVM> getMindsOfUser(@PathVariable String username, Pageable pageable) {
        return mindService.getMindOfUser(username, pageable).map(MindVM::new);
    }

    @GetMapping({"/minds/{id:[0-9]+}", "/users/{username}/minds/{id:[0-9]+}"})
    ResponseEntity<?> getMindsRelative(@PathVariable long id, @PathVariable(required = false) String username,
                                       Pageable pageable,
                                       @RequestParam(name = "direction", defaultValue = "after") String direction,
                                       @RequestParam(name = "count", defaultValue = "false", required = false) boolean count) {
        if (!direction.equalsIgnoreCase("after")) {
            return ResponseEntity.ok(mindService.getOldMinds(id, username, pageable).map(MindVM::new));
        }
        if (count) {
            long newMindsCount = mindService.getNewMindsCount(id, username);
            return ResponseEntity.ok(Collections.singletonMap("count", newMindsCount));
        }
        List<MindVM> newMinds = mindService.getNewMinds(id, username, pageable).stream()
                .map(MindVM::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(newMinds);
    }

//    @GetMapping("/users/{username}/minds/{id:[0-9]+}")
//    ResponseEntity<?> getMindsRelativeForUser(@PathVariable String username, @PathVariable long id, Pageable pageable,
//                                              @RequestParam(name = "direction", defaultValue = "after") String direction,
//                                              @RequestParam(name = "count", defaultValue = "false", required = false) boolean count) {
//        if (!direction.equalsIgnoreCase("after")) {
//            return ResponseEntity.ok(mindService.getOldMindsForUser(username, id, pageable).map(MindVM::new));
//        }
//        if(count){
//            long newMindsCountOfUser = mindService.getNewMindsCountOfUser(id, username);
//            return ResponseEntity.ok(Collections.singletonMap("count", newMindsCountOfUser));
//        }
//        List<MindVM> newMinds = mindService.getNewMindsOfUser(username, id, pageable).stream()
//                .map(MindVM::new)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(newMinds);
//    }
}
