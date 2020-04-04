package com.tretiak.portal.mind;

import com.tretiak.portal.user.User;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class MindService {

    private final MindRepository mindRepository;

    public MindService(MindRepository mindRepository) {
        this.mindRepository = mindRepository;
    }

    void save(User user, Mind mind){
        mind.setTimestamp(new Date());
        mind.setUser(user);
        mindRepository.save(mind);
    }
}
