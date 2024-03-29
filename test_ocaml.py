import subprocess
import re
from functions import functions, spec

ocaml_function_starts = {
    'square': 'let square x =',
    'add_two': 'let add_two x =',
    'is_even': 'let is_even x =',
    'most_common_element': 'let most_common_element x =',
    'sum_list': 'let sum_list x =',
    'reverse': 'let reverse x =',
    'flatten_list_of_lists': 'let flatten_list_of_lists x =',
    'is_palindrome': 'let is_palindrome x =',
    'is_prime': 'let is_prime x =',
    'is_anagram': 'let is_anagram x y =',
}

ocaml_function_starts_with_type_annotations = {
    'square': 'let square (x : int) : int =',
    'add_two': 'let add_two (x : int) : int =',
    'is_even': 'let is_even (x : int) : bool =',
    'most_common_element': 'let most_common_element (x : int list) : int option =',
    'sum_list': 'let sum_list (x : int list) : int =',
    'reverse': 'let reverse (x : string) : string =',
    'flatten_list_of_lists': 'let flatten_list_of_lists (x : int list list) : int list =',
    'is_palindrome': 'let is_palindrome (x : string) : bool =',
    'is_prime': 'let is_prime (x : int) : bool =',
    'is_anagram': 'let is_anagram (x : string) (y : string) : bool =',
}

print_function = {
    'square': ' |> Int.to_string |> print_endline',
    'add_two': ' |> Int.to_string |> print_endline',
    'is_even': ' |> Bool.to_string |> print_endline',
    'most_common_element': ' |> (fun x -> match x with | None -> "None" | Some x -> Int.to_string x) |> print_endline ',
    'sum_list': ' |> Int.to_string |> print_endline',
    'reverse': ' |> print_endline',
    'flatten_list_of_lists': ' |> List.map Int.to_string |> String.concat ";" |> fun x -> "[" ^ x ^ "]" |> print_endline',
    'is_palindrome': ' |> Bool.to_string |> print_endline',
    'is_prime': ' |> Bool.to_string |> print_endline',
    'is_anagram': ' |> Bool.to_string |> print_endline',
}

back_to_expected_type = {
    'square': lambda x : int(x),
    'add_two': lambda x : int(x),
    'is_even': lambda x : x == 'true',
    'most_common_element': lambda x : x,
    'sum_list': lambda x : int(x),
    'reverse': lambda x : x,
    'flatten_list_of_lists': lambda x : x,
    'is_palindrome': lambda x : x == 'true',
    'is_prime': lambda x : x == 'true',
    'is_anagram': lambda x : x == 'true',
}

special_test_cases = {
    'sum_list': [('[1;2;3]', 6), ('[1;1;2;3]', 7), ('[1;2;3;3]', 9)],
    'most_common_element': [('[1;2;3]', 'None'), ('[1;1;2;3]', '1'), ('[1;2;3;3]', '3')],
    'flatten_list_of_lists': [('[[1;2];[3;4]]', '[1;2;3;4]'), ('[[1;2];[3;4];[5;6]]', '[1;2;3;4;5;6]'), ('[[1;2;3]]', '[1;2;3]')], 
}

filename_prefix = 'super_safe_filename'

def cleanup():
    subprocess.run(f'rm {filename_prefix}*', capture_output=True, shell=True)

def evaluate_ocaml_code(code):
    with open(f'{filename_prefix}.ml', 'w') as file:
        file.write(code)

    result = subprocess.run(['ocamlc', '-o', filename_prefix, f'{filename_prefix}.ml'], capture_output=True, text=True)

    if result.returncode == 0:
        result = subprocess.run([f'./{filename_prefix}'], capture_output=True, text=True)
        return result.stdout.strip()
    else:
        raise Exception('Failed to build', result.stderr)

def wrap_negatives_in_parens(args):
    ret = []
    for arg in args:
        if (isinstance(arg, float) or isinstance(arg, int)) and arg < 0:
            ret += ['(', arg, ')']
        else:
            ret += [arg]
    return ret

def stringify(arg):
    if arg == '(' or arg == ')':
        return arg
    if isinstance(arg, str) and (arg == '' or arg[0] != '['):
        return f'"{arg}"'
    return str(arg)

def test_ocaml_exn(function, additional_code):
    function_spec = spec(function)
    test_cases = special_test_cases[function] if function in special_test_cases else function_spec[1]
    code = ocaml_function_starts[function] + '(' + additional_code + ')' + print_function[function]
    for test_case in test_cases:
        args = test_case[:-1]
        args = wrap_negatives_in_parens(args)
        expected = test_case[-1]
        repr_args = ' '.join([stringify(arg) for arg in args])
        try:
            value = evaluate_ocaml_code(f'{code};; {function} {repr_args}')
            cleanup()
        except Exception as e:
            cleanup()
            raise Exception(f'Failed to evaluate f {repr_args} with error {e}')  
        if back_to_expected_type[function](value) != expected:
            raise Exception(f'Expected f {repr_args} = {expected} but got {value}')

test_ocaml_exn('square', 'x * x')
# test_ocaml_exn('add_two', 'x + 2')
# test_ocaml_exn('sum_list', 'List.fold_left (+) 0 x')
# test_ocaml_exn('is_palindrome', 'x = x')