package com.tretiak.portal.mind;

import com.tretiak.portal.file.FileAttachment;
import com.tretiak.portal.file.FileAttachmentRepository;
import com.tretiak.portal.file.FileService;
import com.tretiak.portal.user.User;
import com.tretiak.portal.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MindService {

    private final MindRepository mindRepository;
    private final UserService userService;
    private final FileAttachmentRepository fileAttachmentRepository;
    private final FileService fileService;

    public MindService(MindRepository mindRepository, UserService userService,
                       FileAttachmentRepository fileAttachmentRepository, FileService fileService) {
        this.mindRepository = mindRepository;
        this.userService = userService;
        this.fileAttachmentRepository = fileAttachmentRepository;
        this.fileService = fileService;
    }

    Mind save(User user, Mind mind) {
        mind.setTimestamp(new Date());
        mind.setUser(user);
        if(mind.getAttachment()!=null){
            FileAttachment inDb = fileAttachmentRepository.findById(mind.getAttachment().getId()).get();
            inDb.setMind(mind);
            mind.setAttachment(inDb);
        }
        return mindRepository.save(mind);
    }

    Page<Mind> getAllMinds(Pageable pageable) {
        return mindRepository.findAll(pageable);
    }

    Page<Mind> getMindOfUser(String username, Pageable pageable) {
        User inDb = userService.getByUsername(username);
        return mindRepository.findByUser(inDb, pageable);
    }

    Page<Mind> getOldMinds(long id, String username, Pageable pageable) {
        Specification<Mind> spec = Specification.where(idLessThan(id));
        if (username != null) {
            User inDb = userService.getByUsername(username);
            spec = spec.and(userId(inDb));
        }
        return mindRepository.findAll(spec, pageable);
    }

    List<Mind> getNewMinds(long id, String username, Pageable pageable) {
        Specification<Mind> spec = Specification.where(idGreaterThan(id));
        if (username != null) {
            User inDb = userService.getByUsername(username);
            spec = spec.and(userId(inDb));
        }
        return mindRepository.findAll(spec, pageable.getSort());
    }

    long getNewMindsCount(long id, String username) {
        Specification<Mind> spec = Specification.where(idGreaterThan(id));
        if (username != null) {
            User inDb = userService.getByUsername(username);
            spec = spec.and(userId(inDb));
        }
        return mindRepository.count(spec);
    }

    private Specification<Mind> userId(User user) {
        return (Specification<Mind>) (root, criteriaQuery, criteriaBuilder) -> criteriaBuilder.equal(root.get("user"), user);
    }

    private Specification<Mind> idLessThan(long id) {
        return (Specification<Mind>) (root, criteriaQuery, criteriaBuilder) -> criteriaBuilder.lessThan(root.get("id"), id);
    }

    private Specification<Mind> idGreaterThan(long id) {
        return (Specification<Mind>) (root, criteriaQuery, criteriaBuilder) -> criteriaBuilder.greaterThan(root.get("id"), id);
    }

    void deleteMind(long id) {
        Mind mind = mindRepository.getOne(id);
        if(mind.getAttachment()!=null){
            fileService.deleteAttachmentFile(mind.getAttachment().getName());
        }
        mindRepository.deleteById(id);
    }
}
