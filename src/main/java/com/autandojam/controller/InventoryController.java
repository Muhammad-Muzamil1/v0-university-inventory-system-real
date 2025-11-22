package com.autandojam.controller;

import com.autandojam.dto.ApiResponse;
import com.autandojam.dto.ItemDTO;
import com.autandojam.entity.InventoryItem;
import com.autandojam.entity.User;
import com.autandojam.service.InventoryService;
import com.autandojam.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*")
public class InventoryController {
    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ItemDTO> items = inventoryService.getAllItems(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Items fetched", items));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchItems(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ItemDTO> items = inventoryService.searchItems(query, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Search completed", items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Integer id) {
        ItemDTO item = inventoryService.getItemById(id);
        if (item != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Item fetched", item));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockItems() {
        List<ItemDTO> items = inventoryService.getLowStockItems();
        return ResponseEntity.ok(new ApiResponse<>(true, "Low stock items fetched", items));
    }

    @PostMapping
    public ResponseEntity<?> createItem(
            @RequestBody InventoryItem item,
            Authentication authentication) {
        User user = userService.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User not found", null));
        }
        ItemDTO created = inventoryService.createItem(item, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(
            @PathVariable Integer id,
            @RequestBody InventoryItem item,
            Authentication authentication) {
        User user = userService.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User not found", null));
        }
        ItemDTO updated = inventoryService.updateItem(id, item, user);
        if (updated != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Item updated", updated));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = userService.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User not found", null));
        }
        boolean deleted = inventoryService.deleteItem(id, user);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Item deleted", null));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/add-stock")
    public ResponseEntity<?> addStock(
            @PathVariable Integer id,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String reference,
            Authentication authentication) {
        User user = userService.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User not found", null));
        }
        inventoryService.addStock(id, quantity, reference, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock added", null));
    }

    @PostMapping("/{id}/reduce-stock")
    public ResponseEntity<?> reduceStock(
            @PathVariable Integer id,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String reference,
            Authentication authentication) {
        User user = userService.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "User not found", null));
        }
        inventoryService.reduceStock(id, quantity, reference, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock reduced", null));
    }
}
