package com.tretiak.portal.mind;

import com.tretiak.portal.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MindRepository extends JpaRepository<Mind, Long> {
    Page<Mind> findByUser(User user, Pageable pageable);
    Page<Mind> findByIdLessThan(long id, Pageable pageable);
    List<Mind> findByIdGreaterThan(long id, Sort sort);
    Page<Mind> findByIdLessThanAndUser(long id, User user, Pageable pageable);
    List<Mind> findByIdGreaterThanAndUser(long id, User user, Sort sort);
    long countByIdGreaterThan(long id);
    long countByIdGreaterThanAndUser(long id, User user);
}
