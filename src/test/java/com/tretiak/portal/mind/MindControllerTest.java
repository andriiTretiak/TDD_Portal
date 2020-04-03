package com.tretiak.portal.mind;

import com.tretiak.portal.error.ApiError;
import com.tretiak.portal.user.UserRepository;
import com.tretiak.portal.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static com.tretiak.portal.TestUtil.createValidMind;
import static com.tretiak.portal.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class MindControllerTest {

    private static final String API_1_0_MINDS = "/api/1.0/minds";
    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Before
    public void cleanup(){
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_receiveOk(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsUnauthorized_receivesUnauthorized(){
        Mind mind = createValidMind();
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsUnauthorized_receivesApiError(){
        Mind mind = createValidMind();
        ResponseEntity<ApiError> response = postMind(mind, ApiError.class);
        assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
    }

    private <T>ResponseEntity<T> postMind(Mind mind, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_1_0_MINDS, mind, responseType);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
