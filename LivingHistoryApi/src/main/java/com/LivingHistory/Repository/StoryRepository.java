package com.LivingHistory.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.LivingHistory.Modal.Story;

public interface StoryRepository extends JpaRepository<Story, Long> {
    @Query("SELECT s FROM story s WHERE s.title LIKE %:query% OR s.story LIKE %:query% OR s.user.nickname LIKE %:query% OR s.location LIKE %:query% OR s.tag LIKE %:query%")
    List<Story> findAll(String query);
}