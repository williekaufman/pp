functions = {
    'square': ('def square(x: float) -> float:', [(0, 0), (2, 4), (-3, 9)]), 
    'add_two': ('def add_two(x: float) -> float:', [(0, 2), (2, 4), (-3, -1)]),
}

def test_exn(function, additional_code):
    code = functions[function][0] + '\n' + additional_code
    exec(code)
    for x, y in functions[function][1]:
        try:
            value = eval(f'{function}({x})')
        except:
            raise Exception(f'Failed to evaluate f({x})')
        if value != y:
            raise Exception(f'Expected f({x}) = {y} but got {value}')