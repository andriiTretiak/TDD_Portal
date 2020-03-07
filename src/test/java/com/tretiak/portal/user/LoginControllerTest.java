package com.tretiak.portal.user;

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

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {

    private static final String API_1_0_LOGIN = "/api/1.0/login";

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Test
    public void postLogin_withoutUserCredential_receiveUnauthorized(){
        ResponseEntity<Object> response = login(null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutIncorrectCredential_receiveUnauthorized(){
        authenticate();
        ResponseEntity<Object> response = login(null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private void authenticate() {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor("test-user", "P4ssword"));
    }

    private <T> ResponseEntity<T> login(Object request, Class<T> response){
        return testRestTemplate.postForEntity(API_1_0_LOGIN, request, response);
    }
}
