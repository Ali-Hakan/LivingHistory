package com.LivingHistory.Modal.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

import com.LivingHistory.Modal.Custom.DateCustom;
import com.LivingHistory.Modal.Custom.Location;

@Getter
@Setter
public class StoryDTO {
    private Long id;

    private String title;

    private String content;

    private List<String> tags;

    private List<DateCustom> dates;

    private Date creationDate;
    
    private List<Location> locations;

    private String nickname;

    private List<FeedbackDTO> feedbacks;

    private List<CommentDTO> comments;
}