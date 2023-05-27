package com.LivingHistory.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.LivingHistory.Modal.Custom.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

}
