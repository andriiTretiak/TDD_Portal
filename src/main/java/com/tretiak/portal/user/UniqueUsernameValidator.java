package com.tretiak.portal.user;

import org.springframework.beans.factory.annotation.Autowired;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class UniqueUsernameValidator implements ConstraintValidator<UniqueUsername, String> {

   @Autowired
   private UserRepository userRepository;

   public boolean isValid(String value, ConstraintValidatorContext context) {
      User inDb = userRepository.findByUsername(value);
      return inDb == null;
   }
}
