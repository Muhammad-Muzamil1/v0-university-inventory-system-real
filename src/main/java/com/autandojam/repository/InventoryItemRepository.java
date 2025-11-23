package com.autandojam.repository;

import com.autandojam.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {

    // Fix: use the actual field name in Category entity
    Page<InventoryItem> findByCategoryCategoryId(Integer categoryId, Pageable pageable);

    // Optional: find by item name
    Page<InventoryItem> findByItemNameContainingIgnoreCase(String itemName, Pageable pageable);
}
