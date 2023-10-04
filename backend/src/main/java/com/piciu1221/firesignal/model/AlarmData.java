package com.piciu1221.firesignal.model;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class AlarmData implements Serializable {
    private String city;
    private String street;
    private String description;
    private List<Integer> selectedDepartments;
}
