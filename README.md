# Time-Travel Simulation Smart Contract

A Clarity smart contract that simulates a time-travel messaging system, allowing users to send messages to the past or future while maintaining temporal causality and preventing paradoxes.

## Overview

This smart contract implements a temporal messaging system where users can:
- Send messages targeted to specific points in time
- Prevent temporal paradoxes through validation
- Access messages only after their target time
- Track message availability and paradox status

## Features

- **Temporal Messaging**
    - Send messages to past or future times
    - 280-character message limit
    - Automatic paradox detection
    - Temporal availability tracking

- **Time Management**
    - Controlled time progression
    - Paradox prevention system
    - Message timestamp tracking
    - Time-based message access

- **Message Organization**
    - User-specific message tracking
    - Temporal order maintenance
    - Paradox status tracking
    - Message availability status

## Contract Functions

### Public Functions

1. `send-message (content (string-utf8 280)) (target-time uint)`
    - Sends a message to a specific point in time
    - Parameters:
        - `content`: Message text (max 280 chars)
        - `target-time`: Intended delivery time
    - Returns: Message ID or error
    - Errors:
        - ERR-INVALID-INPUT if content is empty
        - ERR-PARADOX-DETECTED if creates paradox
        - ERR-NOT-AUTHORIZED if user message limit reached

2. `advance-time (time-increment uint)`
    - Advances the simulation time (owner only)
    - Parameters:
        - `time-increment`: Time units to advance
    - Returns: New current time or error
    - Errors:
        - ERR-NOT-AUTHORIZED if not owner

### Read-Only Functions

1. `get-message (message-id uint)`
    - Retrieves message details and availability
    - Returns:
        - Message content
        - Sender information
        - Temporal metadata
        - Paradox status
        - Availability status

2. `get-user-messages (user principal)`
    - Returns list of user's message IDs
    - Maximum 100 messages per user

3. `get-current-time`
    - Returns current simulation time

### Private Functions

1. `is-paradox (send-time uint) (target-time uint)`
    - Checks for temporal paradoxes
    - Returns true if message creates paradox
    - Paradox condition: >100 time units into past

## Data Structures

### Messages Map
```clarity
(define-map messages
  { message-id: uint }
  { 
    sender: principal,
    content: (string-utf8 280),
    send-time: uint,
    target-time: uint,
    is-paradox: bool 
  })
```

### User Messages Map
```clarity
(define-map user-messages 
  principal 
  (list 100 uint))
```

## Error Codes

- `ERR-NOT-AUTHORIZED (u100)`: Operation not permitted
- `ERR-INVALID-INPUT (u101)`: Invalid message content
- `ERR-MESSAGE-NOT-FOUND (u102)`: Message doesn't exist
- `ERR-PARADOX-DETECTED (u103)`: Temporal paradox detected

## Usage Example

```clarity
;; Send a message to the future
(send-message 
  "Remember to invest in Bitcoin!"
  u1000)

;; Check message status
(get-message u1)

;; Advance time (owner only)
(advance-time u50)

;; Check current time
(get-current-time)
```

## Security Considerations

1. **Temporal Security**
    - Paradox prevention system
    - Controlled time advancement
    - Message availability checks
    - Temporal boundary enforcement

2. **Access Control**
    - Owner-only time advancement
    - Public message submission
    - Controlled message retrieval
    - User message limits

3. **Content Control**
    - Fixed message size limit
    - Content validation
    - Temporal metadata tracking
    - Paradox status tracking

## Implementation Notes

1. **Time Management**
    - Linear time progression
    - No time reversal
    - Paradox detection
    - Availability tracking

2. **Message Storage**
    - Limited message size
    - User message tracking
    - Temporal metadata
    - Efficient retrieval

3. **Paradox Prevention**
    - 100-unit past limit
    - Automatic detection
    - Status tracking
    - Safe time advancement

## Future Improvements

1. **Enhanced Features**
    - Message encryption
    - Multi-recipient messages
    - Message threads
    - Temporal chains

2. **Time Management**
    - Multiple timelines
    - Branch management
    - Temporal zones
    - Paradox resolution

3. **User Experience**
    - Message scheduling
    - Temporal notifications
    - Message expiration
    - Timeline visualization

## Testing

Recommended test scenarios:

1. Message Creation
    - Future message sending
    - Past message sending
    - Paradox detection
    - Content validation

2. Time Management
    - Time advancement
    - Message availability
    - Paradox prevention
    - Timeline consistency

3. Message Access
    - Available message retrieval
    - Future message handling
    - User message listing
    - Error handling
