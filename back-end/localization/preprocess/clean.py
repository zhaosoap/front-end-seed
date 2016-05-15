import pandas as pd
import numpy as np
import sys

def preprocess_df(df):
    df = df[df['All-LAC'].notnull() & df['All-Cell Id'].notnull() & df['All-Longitude'].notnull() & df['All-Latitude'].notnull() & (df['Message Type'] == 'Measurement Report')]
    df = df.fillna(-999)
    df['RxAddPower'] =df['All-MS TxPower (dBm)']* df['All-MS TxPower (dBm)'] + df['All-RxLev Sub (dBm)']*df['All-RxLev Sub (dBm)']
    return df

def run(filename,config):
    filepath = "data/raw/"+filename
    df = preprocess_df(pd.read_csv(filepath))
    df.to_csv("data/clean/"+filename, sep=',', encoding='utf-8',index=False) 

    return df.to_json(orient="values")

