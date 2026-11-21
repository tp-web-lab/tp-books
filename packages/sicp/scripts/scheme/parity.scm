(define (same-parity first . rest)
  (cons first (filter (lambda (x) (= (modulo x 2) (modulo first 2))) rest)))
