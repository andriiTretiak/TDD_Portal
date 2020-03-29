package com.tretiak.portal.user;

import com.tretiak.portal.error.NotFoundException;
import com.tretiak.portal.file.FileService;
import com.tretiak.portal.user.vm.UserUpdateVM;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, FileService fileService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileService = fileService;
    }

    public User save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    Page<User> getUsers(User loggedUser, Pageable pageable) {
        if(loggedUser!=null){
            return userRepository.findByUsernameNot(loggedUser.getUsername(), pageable);
        }
        return userRepository.findAll(pageable);
    }

    public User getByUsername(String username) {
        User inDb = userRepository.findByUsername(username);
        if(inDb == null){
            throw new NotFoundException(username + " not found");
        }
        return inDb;
    }

    public User update(long id, UserUpdateVM userUpdate) {
        User inDb = userRepository.getOne(id);
        inDb.setDisplayName(userUpdate.getDisplayName());
        if(userUpdate.getImage() != null){
            String savedImageName;
            try {
                savedImageName = fileService.saveProfileImage(userUpdate.getImage());
                inDb.setImage(savedImageName);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return userRepository.save(inDb);
    }
}
