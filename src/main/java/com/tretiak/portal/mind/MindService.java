package com.tretiak.portal.mind;

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

    Mind save(User user, Mind mind){
        mind.setTimestamp(new Date());
        mind.setUser(user);
        return mindRepository.save(mind);
    }

    Page<Mind> getAllMinds(Pageable pageable) {
        return mindRepository.findAll(pageable);
    }

    Page<Mind> getMindOfUser(String username, Pageable pageable) {
        User inDb = userService.getByUsername(username);
        return mindRepository.findByUser(inDb, pageable);
    }

    Page<Mind> getOldMinds(long id, Pageable pageable) {
        return mindRepository.findByIdLessThan(id, pageable);
    }

    Page<Mind> getOldMindsForUser(String username, long id, Pageable pageable) {
        User inDb = userService.getByUsername(username);
        return mindRepository.findByIdLessThanAndUser(id, inDb, pageable);
    }
}
