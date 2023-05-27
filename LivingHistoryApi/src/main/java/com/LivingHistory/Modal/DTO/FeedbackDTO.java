package com.LivingHistory.Modal.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackDTO {
    private Long id;

    private String username;

    private String nickname;

    private boolean liked;
}