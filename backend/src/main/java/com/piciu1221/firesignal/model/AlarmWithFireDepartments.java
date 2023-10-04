package com.piciu1221.firesignal.model;

import lombok.Data;

import java.util.List;

@Data
public class AlarmWithFireDepartments {
    private Alarm alarm;
    private List<FireDepartment> fireDepartments;

    public AlarmWithFireDepartments(Alarm alarm, List<FireDepartment> fireDepartments) {
        this.alarm = alarm;
        this.fireDepartments = fireDepartments;
    }
}
