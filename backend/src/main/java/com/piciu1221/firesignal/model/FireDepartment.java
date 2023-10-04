package com.piciu1221.firesignal.model;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Entity
@Table(
        name = "fire_departments",
        uniqueConstraints = @UniqueConstraint(columnNames = "department_name")
)
@Data
public class FireDepartment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private int departmentId;

    @Column(name = "department_name", unique = true, nullable = false, length = 255)
    private String departmentName;

    @Column(name = "department_city", nullable = false, length = 255)
    private String departmentCity;

    @Column(name = "department_street", nullable = false, length = 255)
    private String departmentStreet;

    @Column(name = "department_latitude", nullable = false, precision = 10, scale = 8)
    private double departmentLatitude;

    @Column(name = "department_longitude", nullable = false, precision = 11, scale = 8)
    private double departmentLongitude;
}
