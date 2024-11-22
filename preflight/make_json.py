import json
import pandas as pd


def get_canvas_id(css_filename: str) -> str:
    '''
    Extracts the Canvas ID from the [shitty] CSS filename.

    Example: 
        Input: abrams_sloan123250_question_5177500_14851024_style.css
        Output: 123250
    '''
    digits = set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])
    user_data = css_filename.split('question')[0]  # ['abrams_sloan123250_', '_5177500_14851024_style.css']
    canvas_id = ''.join([symbol for symbol in user_data if symbol in digits])  # keep only digits
    print(f'Canvas ID: {canvas_id}, for CSS filename: {css_filename}')
    return canvas_id


def get_roster(filepath: str = 'roster.json') -> dict:
    '''
    Roster is a two-way dictionary:
        { 
            "canvas_id": "full_name",
            "full_name": "canvas_id",
        }
    '''
    roster = {}
    with open(filepath, 'r') as roster_file:
        roster = json.load(roster_file)
    return roster

#
# Convert grades.csv to json file that the chrome extension can use
#

df = pd.read_csv('grades.csv', keep_default_na=False, na_filter=False)

df.columns = [
    'FirstName', 
    'LastName', 
    'ImplementationPoints', 
    'VisualPoints', 
    'TotalPoints', 
    'Comments', 
    'CSSFilename'
]

grades_json = {}
roster: dict = get_roster('roster.json')

print(roster)

for row in df.itertuples(index=True, name='Pandas'):
    grade = row.TotalPoints
    comments = row.Comments
    canvas_id = get_canvas_id(row.CSSFilename)
    full_name = roster[canvas_id]
    grades_json[full_name] = {
        'grade': grade,
        'comments': comments,
        'full_name': full_name,
        'canvas_id': canvas_id,
    }

with open('grades.json', 'w') as json_file:
    json.dump(grades_json, json_file, indent=4)
