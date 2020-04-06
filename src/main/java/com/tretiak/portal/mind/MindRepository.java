package com.tretiak.portal.mind;

import com.tretiak.portal.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MindRepository extends JpaRepository<Mind, Long> {
    Page<Mind> findByUser(User user, Pageable pageable);
    Page<Mind> findByIdLessThan(long id, Pageable pageable);
    Page<Mind> findByIdLessThanAndUser(long id, User user, Pageable pageable);
}
