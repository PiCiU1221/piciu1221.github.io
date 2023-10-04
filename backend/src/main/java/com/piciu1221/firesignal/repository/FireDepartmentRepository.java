package com.piciu1221.firesignal.repository;

import com.piciu1221.firesignal.model.FireDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FireDepartmentRepository extends JpaRepository<FireDepartment, Long> {

    @Query( "SELECT DISTINCT fd " +
            "FROM AlarmedFirefighter af " +
            "INNER JOIN Firefighter f ON af.firefighter = f " +
            "INNER JOIN FireDepartment fd ON f.fireDepartment = fd " +
            "WHERE af.alarm.alarmId = :alarmId")
    List<FireDepartment> findFireDepartmentsByAlarmId(int alarmId);
}
