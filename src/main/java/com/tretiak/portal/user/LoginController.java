package com.tretiak.portal.user;

import com.tretiak.portal.shared.CurrentUser;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
public class LoginController {

    @PostMapping("/api/1.0/login")
    Map<String, Object> handleLogin(@CurrentUser User loggedUser){
        return Collections.singletonMap("id", loggedUser.getId());
    }
}
