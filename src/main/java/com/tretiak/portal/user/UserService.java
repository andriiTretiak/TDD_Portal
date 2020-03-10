package com.tretiak.portal.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    User save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    Page<User> getUsers(User loggedUser, Pageable pageable) {
        if(loggedUser!=null){
            return userRepository.findByUsernameNot(loggedUser.getUsername(), pageable);
        }
        return userRepository.findAll(pageable);
    }
}
