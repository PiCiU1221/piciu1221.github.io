package com.piciu1221.firesignal.model;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Data
@Entity
@Table(name = "firefighters")
public class Firefighter implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "firefighter_id")
    private Integer firefighterId;

    @ManyToOne
    @JoinColumn(name = "department_id", referencedColumnName = "department_id", nullable = false)
    private FireDepartment fireDepartment;

    @Column(name = "firefighter_name", nullable = false)
    private String firefighterName;

    @Column(name = "firefighter_username", unique = true, nullable = false)
    private String firefighterUsername;

    @Column(name = "firefighter_commander", nullable = false)
    private boolean firefighterCommander;

    @Column(name = "firefighter_driver", nullable = false)
    private boolean firefighterDriver;

    @Column(name = "firefighter_technical_rescue", nullable = false)
    private boolean firefighterTechnicalRescue;
}
