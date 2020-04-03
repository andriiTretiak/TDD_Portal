package com.tretiak.portal.mind;

import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class MindService {

    private final MindRepository mindRepository;

    public MindService(MindRepository mindRepository) {
        this.mindRepository = mindRepository;
    }

    void save(Mind mind){
        mind.setTimestamp(new Date());
        mindRepository.save(mind);
    }
}
