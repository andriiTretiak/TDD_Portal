package com.tretiak.portal.mind;

import com.tretiak.portal.user.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MindSecurityService {

    private final MindRepository mindRepository;

    public MindSecurityService(MindRepository mindRepository) {
        this.mindRepository = mindRepository;
    }

    public boolean allowToDelete(long mindId, User loggedInUser){
        Optional<Mind> optionalMind = mindRepository.findById(mindId);
        if(optionalMind.isPresent()){
            Mind mind = optionalMind.get();
            return mind.getUser().getId() == loggedInUser.getId();
        }
        return false;
    }
}
