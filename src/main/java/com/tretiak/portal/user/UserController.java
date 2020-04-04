package com.tretiak.portal.user;

import com.tretiak.portal.shared.CurrentUser;
import com.tretiak.portal.shared.GenericResponse;
import com.tretiak.portal.user.vm.UserUpdateVM;
import com.tretiak.portal.user.vm.UserVM;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/1.0")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/users")
    GenericResponse createUser(@Valid @RequestBody User user){
        userService.save(user);
        return new GenericResponse("User saved");
    }

    @GetMapping("/users")
    Page<UserVM> getUsers(@CurrentUser User loggedUser, Pageable pageable){
        return userService.getUsers(loggedUser, pageable).map(UserVM::new);
    }

    @GetMapping("/users/{username}")
    UserVM getUserByUsername(@PathVariable String username){
        return new UserVM(userService.getByUsername(username));
    }

    @PutMapping("/users/{id:[0-9]+}")
    @PreAuthorize("#id == principal.id")
    UserVM updateUser(@PathVariable long id, @Valid @RequestBody(required = false) UserUpdateVM userUpdate){
        return new UserVM(userService.update(id, userUpdate));
    }
}
