package com.tretiak.portal.mind;

import com.tretiak.portal.TestPage;
import com.tretiak.portal.error.ApiError;
import com.tretiak.portal.mind.vm.MindVM;
import com.tretiak.portal.user.User;
import com.tretiak.portal.user.UserRepository;
import com.tretiak.portal.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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

    @Autowired
    private MindRepository mindRepository;

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private MindService mindService;

    @Before
    public void cleanup(){
        testRestTemplate.getRestTemplate().getInterceptors().clear();
        mindRepository.deleteAll();
        userRepository.deleteAll();
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

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindSaveToDataBase(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);
        assertThat(mindRepository.count()).isEqualTo(1);
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindSaveToDataBaseWithTimestamp(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);

        Mind inDb = mindRepository.findAll().get(0);

        assertThat(inDb.getTimestamp()).isNotNull();
    }

    @Test
    public void postMind_whenMindContentIsNullAndUserIsAuthorized_receiveBadRequest(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postMind_whenMindContentLess10CharactersAndUserIsAuthorized_receiveBadRequest(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        mind.setContent("123456789");
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postMind_whenMindContentIs5000CharactersAndUserIsAuthorized_receiveOk(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        String veryLongString = IntStream.rangeClosed(1, 5000).mapToObj(value -> "x").collect(Collectors.joining());
        mind.setContent(veryLongString);
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postMind_whenMindContentMore5000CharactersAndUserIsAuthorized_receiveBadRequest(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        String veryLongString = IntStream.rangeClosed(1, 5001).mapToObj(value -> "x").collect(Collectors.joining());
        mind.setContent(veryLongString);
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postMind_whenMindContentIsNullAndUserIsAuthorized_receiveApiErrorWithValidationErrors(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        ResponseEntity<ApiError> response = postMind(mind, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("content")).isNotNull();
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindSavedWithAuthenticatedUserInfo(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);

        Mind inDb = mindRepository.findAll().get(0);

        assertThat(inDb.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindCanBeAccessedFromUserEntity(){
        User user = userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);

        EntityManager entityManager = entityManagerFactory.createEntityManager();

        User inDb = entityManager.find(User.class, user.getId());
        assertThat(inDb.getMinds().size()).isEqualTo(1);
    }

    @Test
    public void getMinds_whenThereAreNoMinds_receiveOk(){
        ResponseEntity<Object> response = getMinds(new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getMinds_whenThereAreNoMinds_receivePageWithZeroItems(){
        ResponseEntity<TestPage<Object>> response = getMinds(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getMinds_whenThereAreMinds_receivePageWithItems(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<Object>> response = getMinds(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getMinds_whenThereAreMinds_receivePageWithMindVM(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<MindVM>> response = getMinds(new ParameterizedTypeReference<TestPage<MindVM>>() {});
        MindVM storeMind = response.getBody().getContent().get(0);
        assertThat(storeMind.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_receiveMindVm(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        ResponseEntity<MindVM> response = postMind(mind, MindVM.class);
        assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getMindsOfUser_whenUserIsExists_receiveOk(){
        userService.save(createValidUser("user1"));
        ResponseEntity<Object> response = getMindsOfUser("user1", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getMindsOfUser_whenUserDoesNotExist_receiveNotFound(){
        ResponseEntity<Object> response = getMindsOfUser("unknown-username", new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getMindsOfUser_whenUserIsExists_receivePaigeWithZeroMinds(){
        userService.save(createValidUser("user1"));
        ResponseEntity<TestPage<Object>> response = getMindsOfUser("user1",
                new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getMindsOfUser_whenUserIsExistsWithMinds_receivePageWithMindVM(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<MindVM>> response = getMindsOfUser("user1",
                new ParameterizedTypeReference<TestPage<MindVM>>() {});
        MindVM storeMind = response.getBody().getContent().get(0);
        assertThat(storeMind.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void getMindsOfUser_whenUserIsExistsWithMultipleMinds_receivePageWithMatchingMindsCount(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<MindVM>> response = getMindsOfUser("user1",
                new ParameterizedTypeReference<TestPage<MindVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getMindsOfUser_whenMultipleUserIsExistsWithMultipleMinds_receivePageWithMatchingMindsCount(){
        User userWithThreeMinds = userService.save(createValidUser("user1"));
        IntStream.rangeClosed(1,3).forEach(value -> {
            mindService.save(userWithThreeMinds, createValidMind());
        });
        User userWithFiveMinds = userService.save(createValidUser("user2"));
        IntStream.rangeClosed(1,5).forEach(value -> {
            mindService.save(userWithFiveMinds, createValidMind());
        });
        ResponseEntity<TestPage<MindVM>> response = getMindsOfUser(userWithFiveMinds.getUsername(),
                new ParameterizedTypeReference<TestPage<MindVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(5);
    }

    @Test
    public void getOldMinds_whenThereAreNoMinds_receiveOk(){
        ResponseEntity<Object> response = getOldMinds(5, new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldMinds_whenThereAreMinds_receivePageWithItemsProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<Object>> response = getOldMinds(fourth.getId(),
                new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldMinds_whenThereAreMinds_receivePageWithMindVMBeforeProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<MindVM>> response = getOldMinds(fourth.getId(),
                new ParameterizedTypeReference<TestPage<MindVM>>() {});
        assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
    }

    @Test
    public void getOldMindsOfUser_whenUserExistThereAreNoMinds_receiveOk(){
        User user = userService.save(createValidUser("user1"));
        ResponseEntity<Object> response = getOldMindsOfUser(5, user.getUsername(),
                new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getOldMindsOfUser_whenUserExistThereAreMinds_receivePageWithItemsProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<Object>> response = getOldMindsOfUser(fourth.getId(), user.getUsername(),
                new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getOldMindsOfUser_whenUserExistThereAreMinds_receivePageWithMindVMBeforeProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<MindVM>> response = getOldMindsOfUser(fourth.getId(), user.getUsername(),
                new ParameterizedTypeReference<TestPage<MindVM>>() {});
        assertThat(response.getBody().getContent().get(0).getDate()).isGreaterThan(0);
    }

    @Test
    public void getOldMindsOfUser_whenUserNotExistThereAreNoMinds_receiveNotFound(){
        ResponseEntity<Object> response = getOldMindsOfUser(5, "unknown-username",
                new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getOldMindsOfUser_whenUserExistThereAreNoMinds_receivePageWithZeroItemsBeforeProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        userService.save(createValidUser("user2"));
        ResponseEntity<TestPage<MindVM>> response = getOldMindsOfUser(fourth.getId(), "user2",
                new ParameterizedTypeReference<TestPage<MindVM>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getNewMinds_whenThereAreMinds_receiveListOfItemsAfterProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<List<Object>> response = getNewMinds(fourth.getId(),
                new ParameterizedTypeReference<List<Object>>() {});
        assertThat(response.getBody().size()).isEqualTo(1);
    }

    @Test
    public void getNewMinds_whenThereAreMinds_receiveListOfMindVMAfterProvidedId(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        Mind fourth = mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<List<MindVM>> response = getNewMinds(fourth.getId(),
                new ParameterizedTypeReference<List<MindVM>>() {});
        assertThat(response.getBody().get(0).getDate()).isGreaterThan(0);
    }

    private <T>ResponseEntity<T> getNewMinds(long mindId, ParameterizedTypeReference<T> responseType) {
        String path = API_1_0_MINDS + "/" + mindId+"?direction=after&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T>ResponseEntity<T> getOldMinds(long mindId, ParameterizedTypeReference<T> responseType) {
        String path = API_1_0_MINDS + "/" + mindId+"?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T>ResponseEntity<T> getOldMindsOfUser(long mindId, String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/1.0/users/"+username+"/minds" + "/" + mindId+"?direction=before&page=0&size=5&sort=id,desc";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T>ResponseEntity<T> getMindsOfUser(String username, ParameterizedTypeReference<T> responseType) {
        String path = "/api/1.0/users/"+username+"/minds";
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }
    private <T>ResponseEntity<T> postMind(Mind mind, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_1_0_MINDS, mind, responseType);
    }

    private <T>ResponseEntity<T> getMinds(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_1_0_MINDS, HttpMethod.GET, null, responseType);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
