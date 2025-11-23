package com.autandojam.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items", indexes = {
        @Index(name = "idx_item_name", columnList = "item_name"),
        @Index(name = "idx_category", columnList = "category_id"),
        @Index(name = "idx_quantity", columnList = "quantity"),
        @Index(name = "idx_sku", columnList = "sku")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer itemId;

    @Column(nullable = false, length = 150)
    private String itemName;

    @ManyToOne(fetch = FetchType.EAGER) // FIXED LAZY ISSUE
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String location;

    @Column(length = 50, unique = true)
    private String sku;

    @Column(nullable = false)
    private Integer reorderLevel;

    @ManyToOne(fetch = FetchType.EAGER) // FIXED
    @JoinColumn(name = "added_by", nullable = false)
    private User addedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (reorderLevel == null)
            reorderLevel = 5;

        calculateTotalValue();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotalValue();
    }

    public void calculateTotalValue() {
        if (quantity != null && unitPrice != null)
            this.totalValue = unitPrice.multiply(new BigDecimal(quantity));
    }
}
