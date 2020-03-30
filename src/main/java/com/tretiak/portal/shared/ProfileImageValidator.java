package com.tretiak.portal.shared;

import com.tretiak.portal.file.FileService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Base64;

public class ProfileImageValidator implements ConstraintValidator<ProfileImage, String> {

   @Autowired
   private final FileService fileService;

   public ProfileImageValidator(FileService fileService) {
      this.fileService = fileService;
   }

   public boolean isValid(String obj, ConstraintValidatorContext context) {
      if(obj == null){
         return true;
      }

      byte[] decodedBytes = Base64.getDecoder().decode(obj);
      String fileType = fileService.detectType(decodedBytes);
      return fileType.equalsIgnoreCase("image/png") || fileType.equalsIgnoreCase("image/jpeg");
   }
}
