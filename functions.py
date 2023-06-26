from enum import Enum

class FunctionType(Enum):
    EASY = 'easy'
    MEDIUM = 'medium'
    HARD = 'hard'

easy_functions = {
    'square': ('def square(x: float) -> float:', [(0, 0), (2, 4), (-3, 9)]), 
    'add_two': ('def add_two(x: float) -> float:', [(0, 2), (2, 4), (-3, -1)]),
}

medium_functions = {
    'most_common_element': ('def most_common_element(x: list) -> int:', [([1, 2, 3], None), ([1, 1, 2, 3], 1), ([1, 2, 3, 3], 3)]),
    'sum_list': ('def sum_list(x: list) -> float:', [([1, 2, 3], 6), ([1, 1, 2, 3], 7), ([1, 2, 3, 3], 9)]),
}

hard_functions = {
    'is_palindrome': ('def is_palindrome(x: str) -> bool:', [('racecar', True), ('hello', False), ('', True)]),
    'is_prime': ('def is_prime(x: int) -> bool:', [(0, False), (1, False), (2, True), (3, True), (5, True), (10, False), (17, True), (123, False), (1171, True)]),
}

functions = {
    FunctionType.EASY: easy_functions,
    FunctionType.MEDIUM: medium_functions,
    FunctionType.HARD: hard_functions
}

def test_exn(function, additional_code):
    spec = None
    for function_type in functions:
        if function in functions[function_type]:
            spec = functions[function_type][function]
            break
    if spec is None:
        raise Exception(f'Function {function} not found')
    code = spec[0] + additional_code
    exec(code)
    for x, y in spec[1]:
        try:
            value = eval(f'{function}({x})')
        except:
            raise Exception(f'Failed to evaluate f({x})')
        if value != y:
            raise Exception(f'Expected f({x}) = {y} but got {value}')