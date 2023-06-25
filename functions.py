functions = {
    'square': ('def square(x: float) -> float:', [(0, 0), (2, 4), (-3, 9)]), 
    'add_two': ('def add_two(x: float) -> float:', [(0, 2), (2, 4), (-3, -1)]),
}

def test(function, additional_code):
    code = functions[function][0] + '\n' + additional_code
    exec(code)
    for x, y in functions[function][1]:
        try:
            if eval(f'{function}({x}) != {y}'):
                return False
        except:
            return False
    
    return True