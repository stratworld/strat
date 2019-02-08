# Introduction

This spec is a work in progress.

# Divisions within Lit

Lit is comprised of five pieces of software:
  
  1. The compiler takes Lit program text and component artifacts and produces a .sys file
  2. The deployer takes a .sys file and produces running infrastructure
  3. The substrate informs the deployer how to create infrastructure at deploy time and informs the host how to invoke functions at runtime
  4. The host runs alongside component software and sends and recieves events for its component
  5. Event sources inform the deployer what infrastructure must be created for their particular event type and are responsible for routing events to functions at runtime.