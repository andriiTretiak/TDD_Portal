package com.tretiak.portal;

import com.tretiak.portal.mind.Mind;
import com.tretiak.portal.user.User;

public class TestUtil {

    public static User createValidUser() {
        User user = new User();
        user.setUsername("test-user");
        user.setDisplayName("test-display");
        user.setPassword("P4ssword");
        user.setImage("profile-image.png");
        return user;
    }

    public static User createValidUser(String username) {
        User user = createValidUser();
        user.setUsername(username);
        return user;
    }

    public static Mind createValidMind(){
        Mind mind = new Mind();
        mind.setContent("test content for the test mind");
        return mind;
    }
}
