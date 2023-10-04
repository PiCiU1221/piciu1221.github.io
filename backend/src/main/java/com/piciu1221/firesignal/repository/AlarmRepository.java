package com.piciu1221.firesignal.repository;

import com.piciu1221.firesignal.model.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    @Query("SELECT a FROM Alarm a " +
            "JOIN AlarmedFirefighter af ON a.alarmId = af.alarm.alarmId " +
            "JOIN Firefighter f ON af.firefighter.firefighterId = f.firefighterId " +
            "WHERE f.firefighterUsername = :firefighterUsername " +
            "ORDER BY a.dateTime DESC")
    List<Alarm> findAlarmsForFirefighter(String firefighterUsername,
                                         Pageable pageable);
}