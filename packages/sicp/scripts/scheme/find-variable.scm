(define (find-variable variable environment)
  (define (scan frames depth)
    (if (null? frames) 'not-found
        (let search ((names (car frames)) (offset 0))
          (cond ((null? names) (scan (cdr frames) (+ depth 1)))
                ((eq? (car names) variable) (list depth offset))
                (else (search (cdr names) (+ offset 1)))))))
  (scan environment 0))
