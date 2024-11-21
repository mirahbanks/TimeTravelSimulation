;; Time-Travel Simulation Contract

;; Define data vars
(define-data-var contract-owner principal tx-sender)
(define-data-var current-time uint u0)
(define-data-var next-message-id uint u0)

;; Define data maps
(define-map messages
  { message-id: uint }
  { sender: principal, content: (string-utf8 280), send-time: uint, target-time: uint, is-paradox: bool })

(define-map user-messages principal (list 100 uint))

;; Define constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-INPUT (err u101))
(define-constant ERR-MESSAGE-NOT-FOUND (err u102))
(define-constant ERR-PARADOX-DETECTED (err u103))

;; Helper function to check if a message creates a paradox
(define-private (is-paradox (send-time uint) (target-time uint))
  (if (< target-time send-time)
      (> (- send-time target-time) u100)
      false))

;; Send a message to the past or future
(define-public (send-message (content (string-utf8 280)) (target-time uint))
  (let
    (
      (sender tx-sender)
      (message-id (var-get next-message-id))
      (send-time (var-get current-time))
    )
    (asserts! (> (len content) u0) ERR-INVALID-INPUT)
    (asserts! (not (is-paradox send-time target-time)) ERR-PARADOX-DETECTED)
    (map-set messages
      { message-id: message-id }
      { sender: sender, content: content, send-time: send-time, target-time: target-time, is-paradox: false }
    )
    (var-set next-message-id (+ message-id u1))
    (let
      (
        (user-message-list (default-to (list) (map-get? user-messages sender)))
      )
      (map-set user-messages
        sender
        (unwrap! (as-max-len? (append user-message-list message-id) u100) ERR-NOT-AUTHORIZED)
      )
    )
    (ok message-id)
  )
)

;; Retrieve a message
(define-read-only (get-message (message-id uint))
  (let
    (
      (message (unwrap! (map-get? messages { message-id: message-id }) ERR-MESSAGE-NOT-FOUND))
      (is-available (>= (var-get current-time) (get target-time message)))
    )
    (ok {
      content: (get content message),
      sender: (get sender message),
      send-time: (get send-time message),
      target-time: (get target-time message),
      is-paradox: (get is-paradox message),
      is-available: is-available
    })
  )
)

;; Get user's messages
(define-read-only (get-user-messages (user principal))
  (ok (default-to (list) (map-get? user-messages user))))

;; Advance time (only contract owner)
(define-public (advance-time (time-increment uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set current-time (+ (var-get current-time) time-increment))
    (ok (var-get current-time))
  )
)

;; Get current time
(define-read-only (get-current-time)
  (ok (var-get current-time)))

