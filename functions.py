from enum import Enum

class FunctionType(Enum):
    EASY = 'easy'
    MEDIUM = 'medium'
    HARD = 'hard'

easy_functions = {
    'square': ('def square(x: float) -> float:', [(0, 0), (2, 4), (-3, 9)]), 
    'add_two': ('def add_two(x: float) -> float:', [(0, 2), (2, 4), (-3, -1)]),
    'is_even': ('def is_even(x: int) -> bool:', [(0, True), (1, False), (2, True), (3, False), (5, False), (10, True), (17, False), (123, False), (1171, False)]),
}

medium_functions = {
    'is_palindrome': ('def is_palindrome(x: str) -> bool:', [('racecar', True), ('hello', False), ('', True)]),
    'sum_list': ('def sum_list(x: list) -> int:', [([1, 2, 3], 6), ([1, 1, 2, 3], 7), ([1, 2, 3, 3], 9)]),
    'reverse': ('def reverse(x: str) -> str:', [('hello', 'olleh'), ('', ''), ('racecar', 'racecar')]),
    'flatten_list': ('def flatten_list(x: list) -> list:', [([[1, 2], [3, 4]], [1, 2, 3, 4]), ([[1, 2], [3, 4], [5, 6]], [1, 2, 3, 4, 5, 6]), ([[ 1, 2, 3 ]], [1, 2, 3])]),
}

hard_functions = {
    'most_common_element': ('def most_common_element(x: list) -> int:', [([1, 2, 3], None), ([1, 1, 2, 3], 1), ([1, 2, 3, 3], 3)]),
    'is_prime': ('def is_prime(x: int) -> bool:', [(0, False), (1, False), (2, True), (3, True), (5, True), (10, False), (17, True), (123, False), (1171, True)]),
    'is_anagram': ('def is_anagram(x: str, y: str) -> bool:', [('racecar', 'carrace', True), ('hello', 'world', False), ('', '', True)]),
}

functions = {
    FunctionType.EASY: easy_functions,
    FunctionType.MEDIUM: medium_functions,
    FunctionType.HARD: hard_functions
}

def spec(function):
    for function_type in functions:
        if function in functions[function_type]:
            return functions[function_type][function]
    raise Exception(f'Function {function} not found')