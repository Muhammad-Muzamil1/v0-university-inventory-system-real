package com.autandojam.repository;

import com.autandojam.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {
    Page<InventoryItem> findByCategoryId(Integer categoryId, Pageable pageable);
    
    @Query("SELECT i FROM InventoryItem i WHERE LOWER(i.itemName) LIKE LOWER(CONCAT('%', ?1, '%'))")
    Page<InventoryItem> searchByName(String itemName, Pageable pageable);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.reorderLevel")
    List<InventoryItem> findLowStockItems();
    
    List<InventoryItem> findBySku(String sku);
}
