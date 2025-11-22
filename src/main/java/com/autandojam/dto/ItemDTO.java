package com.autandojam.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDTO {
    private Integer itemId;
    private String itemName;
    private Integer categoryId;
    private String categoryName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalValue;
    private String description;
    private String location;
    private String sku;
    private Integer reorderLevel;
    private String addedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
