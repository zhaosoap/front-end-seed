import pandas as pd

if __name__ == '__main__':
    df = pd.read_csv('2G_gongcan_origin.csv')
    df = df[['LAC','CI','longitude','latitude']]
    df.to_csv('2G_gongcan.csv',index = False)

