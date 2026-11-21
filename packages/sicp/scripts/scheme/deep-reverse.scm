(define (deep-reverse tree)
  (if (pair? tree) (map deep-reverse (reverse tree)) tree))
