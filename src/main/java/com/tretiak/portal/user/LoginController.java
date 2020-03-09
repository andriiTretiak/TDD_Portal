package com.tretiak.portal.user;

import com.tretiak.portal.shared.CurrentUser;
import com.tretiak.portal.user.vm.UserVM;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {

    @PostMapping("/api/1.0/login")
    UserVM handleLogin(@CurrentUser User loggedInUser){
        return new UserVM(loggedInUser);
    }
}
