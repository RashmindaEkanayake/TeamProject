package com.inventory.system.services;

import com.inventory.system.entities.Item;
import com.inventory.system.entities.PriceHistory;
import com.inventory.system.dto.PriceUpdateRequest;
import com.inventory.system.exceptions.ResourceNotFoundException;
import com.inventory.system.repositories.ItemRepository;
import com.inventory.system.repositories.PriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PriceApprovalService {

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    public List<PriceHistory> getPendingPriceRequests() {
        return priceHistoryRepository.findByStatus("PENDING");
    }

    @Transactional
    public PriceHistory submitPriceRequest(PriceUpdateRequest request, String requestedBy) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + request.getItemId()));

        PriceHistory priceRequest = new PriceHistory();
        priceRequest.setItem(item);
        priceRequest.setRetailPrice(request.getRetailPrice());
        priceRequest.setImportPrice(request.getImportPrice());
        priceRequest.setSalePrice(request.getSalePrice());
        priceRequest.setStartDate(LocalDateTime.now());
        priceRequest.setStatus("PENDING");
        priceRequest.setRequestedBy(requestedBy);

        return priceHistoryRepository.save(priceRequest);
    }

    @Transactional
    public PriceHistory approvePriceRequest(Long priceId, String approvedBy) {
        PriceHistory request = priceHistoryRepository.findById(priceId)
                .orElseThrow(() -> new ResourceNotFoundException("Price approval request not found with ID: " + priceId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Price request is not in PENDING state. Current status: " + request.getStatus());
        }

        Optional<PriceHistory> activePriceOpt = priceHistoryRepository
                .findFirstByItemItemIdAndStatusOrderByStartDateDesc(request.getItem().getItemId(), "APPROVED");
        
        if (activePriceOpt.isPresent()) {
            PriceHistory activePrice = activePriceOpt.get();
            activePrice.setEndDate(LocalDateTime.now());
            priceHistoryRepository.save(activePrice);
        }

        request.setStatus("APPROVED");
        request.setApprovedBy(approvedBy);
        request.setDecisionDate(LocalDateTime.now());
        request.setStartDate(LocalDateTime.now());

        return priceHistoryRepository.save(request);
    }

    @Transactional
    public PriceHistory rejectPriceRequest(Long priceId, String approvedBy) {
        PriceHistory request = priceHistoryRepository.findById(priceId)
                .orElseThrow(() -> new ResourceNotFoundException("Price approval request not found with ID: " + priceId));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Price request is not in PENDING state. Current status: " + request.getStatus());
        }

        request.setStatus("REJECTED");
        request.setApprovedBy(approvedBy);
        request.setDecisionDate(LocalDateTime.now());

        return priceHistoryRepository.save(request);
    }
}
