package com.tretiak.portal.mind;

import com.tretiak.portal.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MindRepository extends JpaRepository<Mind, Long>, JpaSpecificationExecutor<Mind> {
    Page<Mind> findByUser(User user, Pageable pageable);
}
