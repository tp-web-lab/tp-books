; TP representation adapter: message-passing objects hide cyclic environments
; from LIPS's value printer. The evaluator's lexical scoping and memoization
; algorithms remain unchanged. This is not part of the printed book.
(define (make-procedure parameters body env)
  (lambda (key) (case key ((tag) 'procedure) ((parameters) parameters) ((body) body) ((environment) env))))
(define (compound-procedure? p) (and (procedure? p) (eq? (p 'tag) 'procedure)))
(define (procedure-parameters p) (p 'parameters))
(define (procedure-body p) (p 'body))
(define (procedure-environment p) (p 'environment))
(define (delay-it exp env)
  (let ((forced #f) (value #f))
    (lambda (key)
      (case key
        ((tag) 'thunk)
        ((force)
         (if (not forced) (begin (set! value (actual-value exp env)) (set! forced #t) (set! env '())))
         value)))))
(define (force-it obj)
  (if (and (procedure? obj) (eq? (obj 'tag) 'thunk)) (obj 'force) obj))
