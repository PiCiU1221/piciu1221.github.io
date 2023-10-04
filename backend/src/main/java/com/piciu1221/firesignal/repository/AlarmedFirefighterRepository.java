package com.piciu1221.firesignal.repository;

import com.piciu1221.firesignal.dto.ConsolidatedAlarmInfoDTO;
import com.piciu1221.firesignal.model.AlarmedFirefighter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlarmedFirefighterRepository extends JpaRepository<AlarmedFirefighter, Long> {

    @Query("SELECT COUNT(af) FROM AlarmedFirefighter af " +
            "INNER JOIN af.firefighter f " +
            "INNER JOIN af.alarm a " +
            "WHERE f.fireDepartment.departmentId = :departmentId " +
            "AND a.alarmId = :alarmId")
    int findCountByDepartmentIdAndAlarmId(Integer departmentId, int alarmId);

    @Query("SELECT COUNT(af) > 0 FROM AlarmedFirefighter af " +
            "INNER JOIN af.firefighter f " +
            "WHERE f.fireDepartment.departmentId = :departmentId " +
            "AND af.alarm.alarmId = :alarmId " +
            "AND af.accepted = true " +
            "AND f.firefighterCommander = true")
    boolean hasAcceptedCommander(Integer departmentId, int alarmId);

    @Query("SELECT COUNT(af) FROM AlarmedFirefighter af " +
            "INNER JOIN af.firefighter f " +
            "WHERE f.fireDepartment.departmentId = :departmentId " +
            "AND f.firefighterDriver = true " +
            "AND af.alarm.alarmId = :alarmId " +
            "AND af.accepted = true ")
    int getAcceptedDriversCount(Integer departmentId, int alarmId);

    @Query("SELECT COUNT(af) FROM AlarmedFirefighter af " +
            "INNER JOIN af.firefighter f " +
            "WHERE f.fireDepartment.departmentId = :departmentId " +
            "AND af.alarm.alarmId = :alarmId " +
            "AND af.accepted = true ")
    int getAcceptedFirefightersCount(Integer departmentId, int alarmId);

    @Query("SELECT COUNT(af) > 0 FROM AlarmedFirefighter af " +
            "INNER JOIN af.firefighter f " +
            "WHERE f.fireDepartment.departmentId = :departmentId " +
            "AND af.alarm.alarmId = :alarmId " +
            "AND af.accepted = true " +
            "AND f.firefighterTechnicalRescue = true")
    boolean hasAcceptedTechnicalRescue(Integer departmentId, int alarmId);
}