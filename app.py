from flask import Flask, jsonify, request, make_response
from flask_cors import CORS, cross_origin
from settings import LOCAL, PASSWORD
from functions import functions, test_exn, FunctionType
from redis_utils import rget, rset 
from secrets import compare_digest
import random
import requests
import json

from enum import Enum

app = Flask(__name__)
CORS(app)

@app.route("/new_game", methods=['POST'])
@cross_origin()
def new_game():
    game_id = request.json.get('gameId')
    function_type = FunctionType(request.json.get('functionType') or 'easy')
    f = random.choice(list(functions[function_type].keys()))
    if game_id is None:
        return 'Must provide gameId', 400
    rset('current', '', game_id=game_id)
    rset('function', f, game_id=game_id)
    rset('function_type', function_type.value, game_id=game_id)
    add_character_inner(game_id, '\n')
    add_character_inner(game_id, '\t')
    return {'function': functions[function_type][f][0]}

@app.route("/submit", methods=['POST'])
@cross_origin()
def end_game():
    if not compare_digest(request.json.get('password'), PASSWORD):
        return {'won': False, 'message': 'Incorrect password'}
    game_id = request.json.get('gameId')
    if game_id is None:
        return {'won': False, 'message': 'Must provide gameId'}
    rget('function', game_id=game_id)
    if rget('function', game_id=game_id) is None:
        return {'won': False, 'message': 'Game does not exist'}
    try:
        test_exn(rget('function', game_id=game_id), rget('current', game_id=game_id))
        return {'won': True}
    except Exception as e:
        return {'won': False, 'message': str(e)}

@app.route("/clear", methods=['POST'])
@cross_origin()
def clear():
    game_id = request.json.get('gameId')
    if game_id is None:
        return 'Must provide gameId', 400
    rset('current', '', game_id=game_id)
    return {'cleared': True}

def add_character_inner(game_id, character):
    current = rget('current', game_id=game_id) 
    if current is None:
        return {'exists': False }
    rset('current', current + character, game_id=game_id)
    return {'exists': True, 'current': current + character}

@app.route("/current", methods=['POST'])
@cross_origin()
def get_current():
    game_id = request.json.get('gameId')
    current = rget('current', game_id=game_id)
    function = rget('function', game_id=game_id)
    function_type = FunctionType(rget('function_type', game_id=game_id) or 'easy')
    if current is None:
        return {'exists': False}
    return {'exists': True, 'current': current, 'function': functions[function_type][function][0]} 

@app.route("/add", methods=['POST'])
@cross_origin()
def add():
    game_id = request.json.get('gameId')
    character = request.json.get('character')
    if character is None or game_id is None:
        return 'Must provide character and gameId', 400
    return add_character_inner(game_id, character)

@app.route("/add/newline", methods=['POST'])
@cross_origin()
def add_newline():
    game_id = request.json.get('gameId')
    return add_character_inner(game_id, '\n')

@app.route("/add/tab", methods=['POST'])
@cross_origin()
def add_tab():
    game_id = request.json.get('gameId')
    return add_character_inner(game_id, '\t')

@app.route("/delete", methods=['POST'])
@cross_origin()
def delete_character():
    game_id = request.json.get('gameId')
    current = rget('current', game_id=game_id) or ''
    rset('current', current[:-1], game_id=game_id)
    return current[:-1]

if __name__ == '__main__':
    print('app running!')
    app.run(host='0.0.0.0', port=5001 if LOCAL else 5000)