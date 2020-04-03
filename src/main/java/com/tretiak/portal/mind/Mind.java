package com.tretiak.portal.mind;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity
public class Mind {

    @Id
    @GeneratedValue
    private long id;

    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
}
