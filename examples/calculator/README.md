# calculator
This example uses the Pratt parsing algorithm to perform calculations based on operator precedence and associativity.

pratt parsing:
https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html

## Prefix operators
Name     | Symbol
---------|--------
plus     | `+`
minus    | `-`

## Infix operators
Name     | Symbol | Associativity
---------|--------|---------------
power    | `**`   | right to left
multiply | `*`    | left to right
divide   | `/`    | left to right
modulo   | `%`    | left to right
add      | `+`    | left to right
subtract | `-`    | left to right
