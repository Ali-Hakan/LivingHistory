package com.LivingHistory.Modal.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentDTO {
    private Long id;

    private String username;

    private String nickname;

    private String content;
}