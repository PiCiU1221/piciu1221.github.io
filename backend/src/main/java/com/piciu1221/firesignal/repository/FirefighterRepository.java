package com.piciu1221.firesignal.repository;

import com.piciu1221.firesignal.model.Firefighter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FirefighterRepository extends JpaRepository<Firefighter, Long> {
    List<Firefighter> findByFireDepartment_DepartmentIdIn(List<Integer> departmentIds);
    Firefighter findByFirefighterUsername(String firefighterUsername);

    @Query("SELECT f.fireDepartment.departmentId FROM Firefighter f WHERE f.firefighterUsername = :username")
    Integer findDepartmentIdByUsername(String username);
}
