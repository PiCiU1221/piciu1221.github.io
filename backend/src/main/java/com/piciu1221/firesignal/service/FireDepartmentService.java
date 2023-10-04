package com.piciu1221.firesignal.service;

import com.piciu1221.firesignal.model.FireDepartment;
import com.piciu1221.firesignal.repository.FireDepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FireDepartmentService {
    private final FireDepartmentRepository fireDepartmentRepository;

    @Autowired
    public FireDepartmentService(FireDepartmentRepository fireDepartmentRepository) {
        this.fireDepartmentRepository = fireDepartmentRepository;
    }

    public List<FireDepartment> getAllFireDepartments() {
        return fireDepartmentRepository.findAll();
    }

    public List<FireDepartment> getFireDepartmentsByPage(int page) {
        int pageSize = 8;
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("departmentId").descending());
        Page<FireDepartment> fireDepartmentPage = fireDepartmentRepository.findAll(pageable);
        return fireDepartmentPage.getContent();
    }
}
