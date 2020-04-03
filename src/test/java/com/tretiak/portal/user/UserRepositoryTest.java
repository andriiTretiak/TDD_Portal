package com.tretiak.portal.user;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static com.tretiak.portal.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    private TestEntityManager testEntityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void findByUsername_whenUserExists_returnUser(){
        testEntityManager.persist(createValidUser());
        User inDb = userRepository.findByUsername("test-user");
        assertThat(inDb).isNotNull();
    }

    @Test
    public void findByUsername_whenUserDoesNotExists_returnNull(){
        User inDb = userRepository.findByUsername("nonexistingusername");
        assertThat(inDb).isNull();
    }
}
