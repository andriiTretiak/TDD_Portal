package com.tretiak.portal.user;

import com.tretiak.portal.shared.GenericResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/api/1.0/users")
    GenericResponse createUser(@RequestBody User user){
        userService.save(user);
        return new GenericResponse("User saved");
    }
}
