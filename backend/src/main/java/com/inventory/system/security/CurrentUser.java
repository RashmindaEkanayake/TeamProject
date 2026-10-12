package com.inventory.system.security;

import com.inventory.system.entities.*;
import com.inventory.system.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {
  private final UserRepository users;

  public User get() {
    return users
        .findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
        .orElseThrow(() -> new AccessDeniedException("Account unavailable"));
  }

  public boolean admin() {
    return "ADMIN".equals(get().getRole());
  }

  public Long repId() {
    User u = get();
    if (u.getAssociatedRep() == null) throw new AccessDeniedException("No representative linked");
    return u.getAssociatedRep().getRepId();
  }

  public void customer(Customer c) {
    if (!admin() && (c.getRep() == null || !repId().equals(c.getRep().getRepId())))
      throw new AccessDeniedException("Customer belongs to another representative");
  }
}
