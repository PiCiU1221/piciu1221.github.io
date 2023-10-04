package com.piciu1221.firesignal.service;

import com.piciu1221.firesignal.model.*;
import com.piciu1221.firesignal.repository.AlarmRepository;
import com.piciu1221.firesignal.repository.AlarmedFirefighterRepository;
import com.piciu1221.firesignal.repository.FireDepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AlarmService {
    private final AlarmRepository alarmRepository;
    private final AlarmedFirefighterRepository alarmedFirefighterRepository;
    private final FireDepartmentRepository fireDepartmentRepository;

    @Autowired
    public AlarmService(AlarmRepository alarmRepository, AlarmedFirefighterRepository alarmedFirefighterRepository,
                        FireDepartmentRepository fireDepartmentRepository) {
        this.alarmRepository = alarmRepository;
        this.alarmedFirefighterRepository = alarmedFirefighterRepository;
        this.fireDepartmentRepository = fireDepartmentRepository;
    }

    public List<Alarm> getAlarmsForFirefighter(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return alarmRepository.findAlarmsForFirefighter(username, pageable);
    }

    public List<Alarm> getAlarmsByPage(int page) {
        int pageSize = 10;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("departmentId").descending());
        Page<Alarm> alarmPage = alarmRepository.findAll(pageable);
        return alarmPage.getContent();
    }

    public List<AlarmWithFireDepartments> getLatestAlarmsWithDepartments(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("alarmId").descending());

        Page<Alarm> alarmPage = alarmRepository.findAll(pageable);

        // Initialize a list to store alarms with fire departments
        List<AlarmWithFireDepartments> alarmsWithDepartments = new ArrayList<>();

        // Iterate over the latest alarms
        for (Alarm alarm : alarmPage.getContent()) {
            // Fetch the alerted fire departments for this alarm
            List<FireDepartment> alertedDepartments = fireDepartmentRepository.findFireDepartmentsByAlarmId(alarm.getAlarmId());

            // Create an AlarmWithFireDepartments object to combine alarm and fire departments
            AlarmWithFireDepartments alarmWithDepartments = new AlarmWithFireDepartments(alarm, alertedDepartments);

            // Add the combination to the list
            alarmsWithDepartments.add(alarmWithDepartments);
        }

        return alarmsWithDepartments;
    }
}
