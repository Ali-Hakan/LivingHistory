package com.LivingHistory.Modal.DTO;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoryRequest {
    private Long id;

    private String content;

    private Date startDate;

    private Date endDate;
    
    private String locations;

    private String nickname;
}