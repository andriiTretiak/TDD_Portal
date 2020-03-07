package com.tretiak.portal.user;

import com.fasterxml.jackson.annotation.JsonView;
import com.tretiak.portal.shared.CurrentUser;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @PostMapping("/api/1.0/login")
    @JsonView(Views.Base.class)
    User handleLogin(@CurrentUser User loggedInUser){
        return loggedInUser;
    }
}
