import requests

extra = input('>>> ')

# type = input('>>> ').upper()

type = 'POST'

if type == 'GET':
    f = requests.get
elif type == 'POST':
    f = requests.post
elif type == 'PUT':
    f = requests.put
elif type == 'DELETE':
    f = requests.delete

if extra:
    extra = '/' + extra

url = f'http://127.0.0.1:5001{extra}'

game_id = 'asdf'

character = 'c'

if extra == '/add':
    character = input('character: ')

data = { 'gameId': game_id , 'character': character , 'password': 'adam' } 

response = f(url, json=data)

print(response.text)