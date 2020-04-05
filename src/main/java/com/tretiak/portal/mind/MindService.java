package com.tretiak.portal.mind;

import com.tretiak.portal.mind.vm.MindVM;
import com.tretiak.portal.user.User;
import com.tretiak.portal.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class MindService {

    private final MindRepository mindRepository;
    private final UserService userService;

    public MindService(MindRepository mindRepository, UserService userService) {
        this.mindRepository = mindRepository;
        this.userService = userService;
    }

    MindVM save(User user, Mind mind){
        mind.setTimestamp(new Date());
        mind.setUser(user);
        return new MindVM(mindRepository.save(mind));
    }

    Page<Mind> getAllMinds(Pageable pageable) {
        return mindRepository.findAll(pageable);
    }

    Page<Mind> getMindOfUser(String username, Pageable pageable) {
        User inDb = userService.getByUsername(username);
        return mindRepository.findByUser(inDb, pageable);
    }
}
