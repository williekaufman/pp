import subprocess
from functions import functions, spec

ocaml_function_starts = {
    'square': 'let square x =',
    'add_two': 'let add_two x =',
    'is_even': 'let is_even x =',
    'most_common_element': 'let most_common_element x =',
    'sum_list': 'let sum_list x =',
    'is_palindrome': 'let is_palindrome x =',
    'is_prime': 'let is_prime x =',
    'is_anagram': 'let is_anagram x y =',
}

print_function = {
    'square': ' |> Int.to_string |> print_endline',
    'add_two': ' |> Int.to_string |> print_endline',
    'is_even': ' |> Bool.to_string |> print_endline',
    'most_common_element': ' |> Int.to_string |> print_endline',
    'sum_list': ' |> Int.to_string |> print_endline',
    'is_palindrome': ' |> Bool.to_string |> print_endline',
    'is_prime': ' |> Bool.to_string |> print_endline',
    'is_anagram': ' |> Bool.to_string |> print_endline',
}

back_to_expected_type = {
    'square': lambda x : int(x),
    'add_two': lambda x : int(x),
    'is_even': lambda x : x == 'true',
    'most_common_element': lambda x : int(x),
    'sum_list': lambda x : int(x),
    'is_palindrome': lambda x : x == 'true',
    'is_prime': lambda x : x == 'true',
    'is_anagram': lambda x : x == 'true',
}

filename_prefix = 'super_safe_filename'

def cleanup():
    print(subprocess.run(f'rm {filename_prefix}*', capture_output=True, shell=True))

def evaluate_ocaml_code(code):
    with open(f'{filename_prefix}.ml', 'w') as file:
        file.write(code)

    result = subprocess.run(['ocamlc', '-o', filename_prefix, f'{filename_prefix}.ml'], capture_output=True, text=True)

    if result.returncode == 0:
        result = subprocess.run([f'./{filename_prefix}'], capture_output=True, text=True)
        return result.stdout.strip()
    else:
        raise Exception('Failed to build', result.stderr)

def change_list_delimiters(args):
    return [str(arg).replace(',', ';') for arg in args]

def wrap_negatives_in_parens(args):
    return [f'({arg})' if isinstance(arg, float) or isinstance(arg, int) and arg < 0 else arg for arg in args]

def test_ocaml_exn(function, additional_code):
    function_spec = spec(function)
    code = ocaml_function_starts[function] + additional_code + print_function[function]
    for test_case in function_spec[1]:
        args = test_case[:-1]
        args = wrap_negatives_in_parens(args)
        args = change_list_delimiters(args)
        expected = test_case[-1]
        repr_args = ' '.join([str(arg) for arg in args])
        try:
            value = evaluate_ocaml_code(f'{code};; {function} {repr_args}')
            cleanup()
        except Exception as e:
            cleanup()
            raise Exception(f'Failed to evaluate f {repr_args} with error {e}')  
        if back_to_expected_type[function](value) != expected:
            raise Exception(f'Expected f {repr_args} = {expected} but got {value}')
