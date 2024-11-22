import json
import pandas as pd


columns_to_extract = ['Full name', 'canvas_id'] 
full_name_column = 'Full name'

df = pd.read_csv('roster.csv')

df = df[['Full name', 'Canvas user id']]

df['Canvas user id'] = df['Canvas user id'].astype(str)
df['canvas_id'] = df['Canvas user id'].str.replace('14559', '')
df['canvas_id'] = df['canvas_id'].str.lstrip('0')

df['full_name'] = df['Full name']

df = df.drop(columns=['Full name', 'Canvas user id']) 

canvas_id_lookup = {}
full_name_lookup = {}

for row in df.itertuples(index=True, name='Pandas'):
    full_name_lookup[row.full_name] = row.canvas_id
    canvas_id_lookup[row.canvas_id] = row.full_name

merged_dict = {**canvas_id_lookup, **full_name_lookup}

with open('roster.json', 'w') as json_file:
    json.dump(merged_dict, json_file, indent=4)
