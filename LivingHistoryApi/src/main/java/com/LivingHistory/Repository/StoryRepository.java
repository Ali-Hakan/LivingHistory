package com.LivingHistory.Repository;

import com.LivingHistory.Model.Story;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryRepository extends JpaRepository<Story, Long> {
}