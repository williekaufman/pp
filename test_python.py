from functions import spec

def test_exn(function, additional_code):
    function_spec = spec(function)
    code = function_spec[0] + additional_code
    exec(code)
    for test_case in function_spec[1]:
        args = test_case[:-1]
        expected = test_case[-1]
        repr_args = ', '.join([repr(arg) for arg in args])
        try:
            value = eval(f'{function}(*{args})')
        except Exception as e:
            raise Exception(f'Failed to evaluate f({repr_args}) with error {e}')
        if value != expected:
            raise Exception(f'Expected f({repr_args}) = {expected} but got {value}')
