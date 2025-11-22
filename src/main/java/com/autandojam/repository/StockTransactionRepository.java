package com.autandojam.repository;

import com.autandojam.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Integer> {
    Page<StockTransaction> findByItemId(Integer itemId, Pageable pageable);
    List<StockTransaction> findByItemIdOrderByCreatedAtDesc(Integer itemId);
}
