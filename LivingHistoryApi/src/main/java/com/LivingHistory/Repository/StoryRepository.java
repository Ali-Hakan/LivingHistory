package com.LivingHistory.Repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.LivingHistory.Modal.Story;

public interface StoryRepository extends JpaRepository<Story, Long> {
        @Query("SELECT DISTINCT s FROM Story s LEFT JOIN s.tags t LEFT JOIN s.locations l LEFT JOIN s.user u WHERE s.title LIKE :query OR s.content LIKE :query OR t = :query OR l.name LIKE :query OR u.nickname LIKE :query")
        List<Story> findAll(@Param("query") String query);

        @Query("SELECT s FROM Story s " +
                        "LEFT JOIN s.tags t " +
                        "LEFT JOIN s.locations l " +
                        "LEFT JOIN s.user u " +
                        "LEFT JOIN s.dates d " +
                        "WHERE " +
                        "(:nickname IS NULL OR u.nickname LIKE :nickname) AND " +
                        "(:locations IS NULL OR l.name LIKE :locations) AND " +
                        "(:content IS NULL OR s.content LIKE :content) AND " +
                        "(:tags IS NULL OR t LIKE :tags) AND " +
                        "(:title IS NULL OR s.title LIKE :title) AND " +
                        "(d.startDate <= :startDate) AND " +
                        "(d.endDate >= :endDate)")
        List<Story> findAllAdvanced(@Param("nickname") String nickname,
                        @Param("locations") String locations,
                        @Param("content") String content,
                        @Param("tags") String tags,
                        @Param("title") String title,
                        @Param("startDate") Date startDate,
                        @Param("endDate") Date endDate);

        @Query("SELECT s FROM Story s ORDER BY s.creationDate DESC")
        List<Story> findAllOrderByCreationDateDesc();
}