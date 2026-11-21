(define (no-more? coins) (null? coins))
(define (first-denomination coins) (car coins))
(define (except-first-denomination coins) (cdr coins))
; TP reference solution: same recurrence, memoized for this integral coin set.
(define (cc amount coins)
  (let* ((width (+ amount 1)) (cache (make-vector (* width (+ (length coins) 1)) #f)))
    (define (count remaining values)
      (cond ((= remaining 0) 1)
            ((or (< remaining 0) (null? values)) 0)
            (else
             (let* ((key (+ remaining (* width (length values)))) (cached (vector-ref cache key)))
               (if cached cached
                   (let ((value (+ (count remaining (cdr values)) (count (- remaining (car values)) values))))
                     (vector-set! cache key value) value))))))
    (count amount coins)))
