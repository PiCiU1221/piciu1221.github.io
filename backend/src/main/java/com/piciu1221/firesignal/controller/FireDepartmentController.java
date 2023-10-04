package com.piciu1221.firesignal.controller;

import com.piciu1221.firesignal.service.FireDepartmentService;
import com.piciu1221.firesignal.model.FireDepartment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fire-departments")
public class FireDepartmentController {
    private final FireDepartmentService fireDepartmentService;

    @Autowired
    public FireDepartmentController(FireDepartmentService fireDepartmentService) {
        this.fireDepartmentService = fireDepartmentService;
    }

    @GetMapping
    public ResponseEntity<List<FireDepartment>> getFireDepartments(@RequestParam(defaultValue = "0") int page) {
        // Implement pagination logic here using the page parameter
        List<FireDepartment> fireDepartments = fireDepartmentService.getFireDepartmentsByPage(page);
        return ResponseEntity.ok(fireDepartments);
    }

    @GetMapping("/all")
    public List<FireDepartment> getAllFireDepartments() {
        return fireDepartmentService.getAllFireDepartments();
    }
}
