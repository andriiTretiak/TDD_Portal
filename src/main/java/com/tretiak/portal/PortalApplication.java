package com.tretiak.portal;

import com.tretiak.portal.user.User;
import com.tretiak.portal.user.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import java.util.stream.IntStream;

@SpringBootApplication
public class PortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortalApplication.class, args);
    }

    @Bean
    @Profile("!test")
    CommandLineRunner run(UserService userService){
        return args -> IntStream.rangeClosed(1,15)
                .mapToObj(value -> {
                    User user = new User();
                    user.setUsername("user" + value);
                    user.setDisplayName("display" + value);
                    user.setPassword("P4ssword");
                    return user;
                }).forEach(userService::save);
    }
}
