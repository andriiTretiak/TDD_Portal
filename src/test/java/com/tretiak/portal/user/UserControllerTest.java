package com.tretiak.portal.user;

import com.tretiak.portal.TestPage;
import com.tretiak.portal.TestUtil;
import com.tretiak.portal.configuration.AppConfiguration;
import com.tretiak.portal.error.ApiError;
import com.tretiak.portal.shared.GenericResponse;
import com.tretiak.portal.user.vm.UserUpdateVM;
import com.tretiak.portal.user.vm.UserVM;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.tretiak.portal.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class UserControllerTest {

    private static final String API_1_0_USERS = "/api/1.0/users";

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private AppConfiguration appConfiguration;

    @Before
    public void cleanup(){
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    @Test
    public void postUser_whenUserIsValid_receiveOk(){
        User user = createValidUser();

        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postUser_whenUserIsValid_userSavedTODatabase(){
        User user = createValidUser();

        postSignUp(user, Object.class);

        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    public void postUser_whenUserIsValid_receiveSuccessMessage(){
        User user = createValidUser();

        ResponseEntity<GenericResponse> response = postSignUp(user, GenericResponse.class);
        assertThat(response.getBody().getMessage()).isNotNull();
    }

    @Test
    public void postUser_whenUserIsValid_passwordIsHashedInDatabase(){
        User user = createValidUser();

        postSignUp(user, Object.class);

        List<User> users = userRepository.findAll();
        User inDb = users.get(0);
        assertThat(inDb.getPassword()).isNotEqualTo(user.getPassword());
    }

    @Test
    public void postUser_whenUserHasNullUsername_receiveBadRequest(){
        User user = createValidUser();
        user.setUsername(null);
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasNullDisplayName_receiveBadRequest(){
        User user = createValidUser();
        user.setDisplayName(null);
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasNullPassword_receiveBadRequest(){
        User user = createValidUser();
        user.setPassword(null);
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasUsernameWithLessThanRequired_receiveBadRequest(){
        User user = createValidUser();
        user.setUsername("abc");
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasDisplayNameWithLessThanRequired_receiveBadRequest(){
        User user = createValidUser();
        user.setDisplayName("abc");
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithLessThanRequired_receiveBadRequest(){
        User user = createValidUser();
        user.setPassword("P4sswrd");
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasUsernameExceedsTheLengthLimit_receiveBadRequest(){
        User user = createValidUser();
        String valueOf256Chars = IntStream.rangeClosed(1,256).mapToObj(value -> "a").collect(Collectors.joining());
        user.setUsername(valueOf256Chars);
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasDisplayNameExceedsTheLengthLimit_receiveBadRequest(){
        User user = createValidUser();
        String valueOf256Chars = IntStream.rangeClosed(1,256).mapToObj(value -> "a").collect(Collectors.joining());
        user.setDisplayName(valueOf256Chars);
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordExceedsTheLengthLimit_receiveBadRequest(){
        User user = createValidUser();
        String valueOf256Chars = IntStream.rangeClosed(1,256).mapToObj(value -> "a").collect(Collectors.joining());
        user.setPassword("P4" + valueOf256Chars);
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithAllLowercase_receiveBadRequest(){
        User user = createValidUser();
        user.setPassword("alllowercase");
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithAllUppercase_receiveBadRequest(){
        User user = createValidUser();
        user.setPassword("ALLUPPERCASE");
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserHasPasswordWithAllNumbers_receiveBadRequest(){
        User user = createValidUser();
        user.setPassword("1234567890");
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenUserIsInvalid_receiveApiError(){
        User user = new User();
        ResponseEntity<ApiError> response = postSignUp(user, ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_1_0_USERS);
    }

    @Test
    public void postUser_whenUserIsInvalid_receiveApiErrorWithValidationErrors(){
        User user = new User();
        ResponseEntity<ApiError> response = postSignUp(user, ApiError.class);
        assertThat(response.getBody().getValidationErrors().size()).isEqualTo(3);
    }

    @Test
    public void postUser_whenAnotherUserHasSaneUsername_receiveBadRequest(){
        userRepository.save(createValidUser());
        User user = createValidUser();
        ResponseEntity<Object> response = postSignUp(user, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postUser_whenAnotherUserHasSaneUsername_receiveMessageOfDuplicateUsername(){
        userRepository.save(createValidUser());
        User user = createValidUser();
        ResponseEntity<ApiError> response = postSignUp(user, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("username")).isEqualTo("This name is in use");
    }

    @Test
    public void getUsers_whenThereAreNoUsersInDb_receiveOk(){
        ResponseEntity<Object> response = getUsers(new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getUsers_whenThereAreNoUsersInDb_receivePageWithZeroItems(){
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getUsers_whenThereAUsersInDb_receivePageWithUser(){
        userRepository.save(createValidUser());
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getNumberOfElements()).isEqualTo(1);
    }

    @Test
    public void getUsers_whenThereAUsersInDb_receiveUserWithoutPassword(){
        userRepository.save(createValidUser());
        ResponseEntity<TestPage<Map<String, Object>>> response
                = getUsers(new ParameterizedTypeReference<TestPage<Map<String, Object>>>() {});
        Map<String, Object> entity = response.getBody().getContent().get(0);
        assertThat(entity.containsKey("password")).isFalse();
    }

    @Test
    public void getUsers_whenPageIsRequestedFor3ItemsPerPageWhereTheDatabaseHas20Users_receive3Users(){
        IntStream.rangeClosed(1,20).mapToObj(value -> "test-user-" + value)
                .map(TestUtil::createValidUser)
                .forEach(userRepository::save);
        String path = API_1_0_USERS + "?page=0&size=3";
        ResponseEntity<TestPage<Object>> response = getUsers(path, new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getContent().size()).isEqualTo(3);
    }

    @Test
    public void getUsers_whenPageSizeNotProvided_receiveSizeAs10(){
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getSize()).isEqualTo(10);
    }

    @Test
    public void getUsers_whenPageSizeIsGreaterThan100_receiveSizeAs100(){
        String path = API_1_0_USERS + "?size=500";
        ResponseEntity<TestPage<Object>> response = getUsers(path, new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getSize()).isEqualTo(100);
    }

    @Test
    public void getUsers_whenPageSizeIsNegative_receiveSizeAs10(){
        String path = API_1_0_USERS + "?size=-5";
        ResponseEntity<TestPage<Object>> response = getUsers(path, new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getSize()).isEqualTo(10);
    }

    @Test
    public void getUsers_whenPageIsNegative_receiveFirstPage(){
        String path = API_1_0_USERS + "?page=-5";
        ResponseEntity<TestPage<Object>> response = getUsers(path, new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getNumber()).isEqualTo(0);
    }

    @Test
    public void getUsers_whenUserLoggedIn_receivePageWithoutUser(){
        userService.save(createValidUser("user1"));
        userService.save(createValidUser("user2"));
        userService.save(createValidUser("user3"));
        authenticate("user1");
        ResponseEntity<TestPage<Object>> response = getUsers(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(2);
    }

    @Test
    public void getUserByUsername_whenUserExist_receiveOk(){
        String username = "test-user";
        userService.save(createValidUser(username));
        ResponseEntity<Object> response = getUser(username, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getUserByUsername_whenUserExist_receiveUserWithoutPassword(){
        String username = "test-user";
        userService.save(createValidUser(username));
        ResponseEntity<String> response = getUser(username, String.class);
        assertThat(response.getBody().contains("password")).isFalse();
    }

    @Test
    public void getUserByUsername_whenUserDoeNotExist_receiveNotFound(){
        ResponseEntity<Object> response = getUser("unknown-username", Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    public void getUserByUsername_whenUserDoeNotExist_receiveApiError(){
        ResponseEntity<ApiError> response = getUser("unknown-username", ApiError.class);
        assertThat(response.getBody().getMessage().contains("unknown-use")).isTrue();
    }

    @Test
    public void putUser_whenUnauthorizedUserSendsTheRequest_receiveUnauthorized(){
        ResponseEntity<Object> response = putUser(123, null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void putUser_whenAuthorizedUserSendsUpdateForAnotherUser_receiveForbidden(){
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        long anotherUserId = user.getId() + 123;
        ResponseEntity<Object> response = putUser(anotherUserId, null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    public void putUser_whenUnauthorizedUserSendsTheRequest_receiveApiError(){
        ResponseEntity<ApiError> response = putUser(123, null, ApiError.class);
        assertThat(response.getBody().getUrl()).contains("users/123");
    }

    @Test
    public void putUser_whenAuthorizedUserSendsUpdateForAnotherUser_receiveApiError(){
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        long anotherUserId = user.getId() + 123;
        ResponseEntity<ApiError> response = putUser(anotherUserId, null, ApiError.class);
        assertThat(response.getBody().getUrl()).contains("users/" + anotherUserId);
    }

    @Test
    public void putUser_whenValidRequestBodyFromAuthorizedUser_receiveOk(){
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        UserUpdateVM updatedUser = createUserUpdateVM();
        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void putUser_whenValidRequestBodyFromAuthorizedUser_displayNameUpdated(){
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        UserUpdateVM updatedUser = createUserUpdateVM();
        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        putUser(user.getId(), requestEntity, Object.class);
        User userInDb = userRepository.findByUsername(user.getUsername());
        assertThat(userInDb.getDisplayName()).isEqualTo(updatedUser.getDisplayName());
    }

    @Test
    public void putUser_whenValidRequestBodyFromAuthorizedUser_receiveUserVmWithUpdatedDisplayName(){
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());
        UserUpdateVM updatedUser = createUserUpdateVM();
        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);
        assertThat(response.getBody().getDisplayName()).isEqualTo(updatedUser.getDisplayName());
    }

    @Test
    public void putUser_whenValidRequestBodyWithSupportedImageFromAuthorizedUser_receiveUserVmWithRandomImageName() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = createUserUpdateVM();
        String imageString = readFileBase64("profile.png");
        updatedUser.setImage(imageString);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);
        assertThat(response.getBody().getImage()).isNotEqualTo("profile-image.png");
    }

    @Test
    public void putUser_whenValidRequestBodyWithSupportedImageFromAuthorizedUser_imageIsStoredUnderProfileFolder() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = createUserUpdateVM();
        String imageString = readFileBase64("profile.png");
        updatedUser.setImage(imageString);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);

        String storedImageName = response.getBody().getImage();

        File storedImage = new File(appConfiguration.getFullProfileImagesPath() + "/" + storedImageName);

        assertThat(storedImage.exists()).isTrue();
    }

    @Test
    public void putUser_withInvalidRequestBodyWithNullDisplayNameFromAuthorizedUser_receiveBadRequest() {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = new UserUpdateVM();

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_withInvalidRequestBodyWithLessThanMinSizeDisplayNameFromAuthorizedUser_receiveBadRequest() {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = new UserUpdateVM();
        updatedUser.setDisplayName("abc");

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_withInvalidRequestBodyWithMoreThanMaxSizeDisplayNameFromAuthorizedUser_receiveBadRequest() {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        String valueOf256Chars = IntStream.rangeClosed(1,256).mapToObj(value -> "a").collect(Collectors.joining());
        UserUpdateVM updatedUser = new UserUpdateVM();
        updatedUser.setDisplayName(valueOf256Chars);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_whenValidRequestBodyWithJPGImageFromAuthorizedUser_receiveOk() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = createUserUpdateVM();
        String imageString = readFileBase64("test-jpg.jpg");
        updatedUser.setImage(imageString);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void putUser_whenValidRequestBodyWithGIFImageFromAuthorizedUser_receiveBadRequest() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = createUserUpdateVM();
        String imageString = readFileBase64("test-gif.gif");
        updatedUser.setImage(imageString);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<Object> response = putUser(user.getId(), requestEntity, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void putUser_whenValidRequestBodyWithTXTImageFromAuthorizedUser_receiveValidationErrorForProfile() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = createUserUpdateVM();
        String imageString = readFileBase64("test-txt.txt");
        updatedUser.setImage(imageString);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<ApiError> response = putUser(user.getId(), requestEntity, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("image")).isEqualTo("Only PNG and JPG files are allowed");
    }

    @Test
    public void putUser_whenValidRequestBodyWithJPGImageForUserWhoHasImage_removesOldImageFromStorage() throws IOException {
        User user = userService.save(createValidUser("user1"));
        authenticate(user.getUsername());

        UserUpdateVM updatedUser = createUserUpdateVM();
        String imageString = readFileBase64("test-jpg.jpg");
        updatedUser.setImage(imageString);

        HttpEntity<UserUpdateVM> requestEntity = new HttpEntity<>(updatedUser);
        ResponseEntity<UserVM> response = putUser(user.getId(), requestEntity, UserVM.class);

        putUser(user.getId(), requestEntity, UserVM.class);

        String storedImageName = response.getBody().getImage();
        File storedImage = new File(appConfiguration.getFullProfileImagesPath() + "/" + storedImageName);
        assertThat(storedImage.exists()).isFalse();
    }

    private String readFileBase64(String fileName) throws IOException {
        ClassPathResource imageResource = new ClassPathResource(fileName);
        byte[] imageArr = FileUtils.readFileToByteArray(imageResource.getFile());
        return Base64.getEncoder().encodeToString(imageArr);
    }

    private UserUpdateVM createUserUpdateVM() {
        UserUpdateVM updateUser = new UserUpdateVM();
        updateUser.setDisplayName("newDisplayName");
        return updateUser;
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }

    private <T>ResponseEntity<T> postSignUp(Object request, Class<T> response){
        return testRestTemplate.postForEntity(API_1_0_USERS, request, response);
    }

    private <T>ResponseEntity<T> getUsers(ParameterizedTypeReference<T> responseType){
        return testRestTemplate.exchange(API_1_0_USERS, HttpMethod.GET, null, responseType);
    }

    private <T>ResponseEntity<T> getUsers(String path, ParameterizedTypeReference<T> responseType){
        return testRestTemplate.exchange(path, HttpMethod.GET, null, responseType);
    }

    private <T>ResponseEntity<T> getUser(String username, Class<T> responseType){
        String path = API_1_0_USERS + "/" + username;
        return testRestTemplate.getForEntity(path, responseType);
    }

    private <T>ResponseEntity<T> putUser(long id, HttpEntity<?> requestEntity, Class<T> responseType){
        String path = API_1_0_USERS + "/" + id;
        return testRestTemplate.exchange(path, HttpMethod.PUT, requestEntity, responseType);
    }

    @After
    public void cleanupDirectory() throws IOException {
        FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
        FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
    }
}
